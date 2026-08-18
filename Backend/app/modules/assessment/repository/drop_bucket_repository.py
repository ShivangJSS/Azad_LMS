from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

from app.modules.assessment.model import (
    DropBucketItem,
    DropBucketMaster,
    DropBucket,
)

from app.modules.assessment.schema.drop_bucket_schema import (
    DropBucketCreate,
    DropBucketItemsUpdateRequest,
    DropBucketUpdate,
)


class DropBucketRepository:

    @staticmethod
    def get_all(
        db: Session,
        language_id: Optional[int] = None,
        search: Optional[str] = None,
    ) -> List[DropBucketMaster]:

        query = db.query(DropBucketMaster).filter(DropBucketMaster.deleted_at.is_(None))

        if language_id:
            query = query.filter(DropBucketMaster.language_id == language_id)

        if search:
            query = query.filter(
                DropBucketMaster.drop_bucket_question_title.ilike(f"%{search}%")
            )

        results = query.order_by(DropBucketMaster.drop_bucket_id.desc()).all()

        for row in results:
            bucket = (
                db.query(DropBucket)
                .filter(
                    DropBucket.drop_bucket_id == row.drop_bucket_id,
                    DropBucket.deleted_at.is_(None),
                )
                .first()
            )

            row.bucket_name = bucket.bucket_name if bucket else None
            row.bucket_image = bucket.bucket_image if bucket else None
            # Expose the first bucket's id so the list can open its items.
            row.bucket_id = bucket.bucket_id if bucket else None

        return results

    @staticmethod
    def get_items_for_master(
        db: Session,
        drop_bucket_id: int,
        language_id: int,
    ):
        """All items across every bucket of a question, each labelled
        with its bucket name. Returns (buckets_meta, items)."""
        buckets = DropBucketRepository.get_buckets(
            db=db, drop_bucket_id=drop_bucket_id
        )

        buckets_meta = []
        items = []

        for b in buckets:
            buckets_meta.append(
                {"bucket_id": b.bucket_id, "bucket_name": b.bucket_name}
            )

            rows = (
                db.query(DropBucketItem)
                .filter(
                    DropBucketItem.bucket_id == b.bucket_id,
                    DropBucketItem.language_id == language_id,
                    DropBucketItem.deleted_at.is_(None),
                )
                .all()
            )

            for it in rows:
                items.append(
                    {
                        "drop_bucket_item_id": it.drop_bucket_item_id,
                        "bucket_id": it.bucket_id,
                        "bucket_name": b.bucket_name,
                        "item_name": it.item_name,
                        "item_image": it.item_image,
                        "status": it.status,
                        "language_id": it.language_id,
                        "created_at": it.created_at,
                    }
                )

        return buckets_meta, items

    @staticmethod
    def get_by_id(
        db: Session,
        drop_bucket_id: int,
    ):
        return (
            db.query(DropBucketMaster)
            .filter(
                DropBucketMaster.drop_bucket_id == drop_bucket_id,
                DropBucketMaster.deleted_at.is_(None),
            )
            .first()
        )

    @staticmethod
    def get_by_parent_and_language(
        db: Session,
        parent_id: int,
        language_id: int,
    ):
        return (
            db.query(DropBucketMaster)
            .filter(
                DropBucketMaster.parent_id == parent_id,
                DropBucketMaster.language_id == language_id,
                DropBucketMaster.deleted_at.is_(None),
            )
            .first()
        )

    @staticmethod
    def get_buckets(
        db: Session,
        drop_bucket_id: int,
    ):
        return (
            db.query(DropBucket)
            .filter(
                DropBucket.drop_bucket_id == drop_bucket_id,
                DropBucket.deleted_at.is_(None),
            )
            .all()
        )

    @staticmethod
    def get_translations(
        db: Session,
        parent_id: int,
    ):
        """All translation masters (parent_id == the English id)."""
        return (
            db.query(DropBucketMaster)
            .filter(
                DropBucketMaster.parent_id == parent_id,
                DropBucketMaster.deleted_at.is_(None),
            )
            .order_by(DropBucketMaster.language_id)
            .all()
        )

    @staticmethod
    def replace_buckets(
        db: Session,
        drop_bucket_id: int,
        buckets: list,
    ):
        """Delete existing buckets of a master and insert the given ones."""
        db.query(DropBucket).filter(
            DropBucket.drop_bucket_id == drop_bucket_id
        ).delete(synchronize_session=False)

        for bucket in buckets:
            db.add(
                DropBucket(
                    drop_bucket_id=drop_bucket_id,
                    bucket_name=bucket.bucket_name,
                    bucket_image=bucket.bucket_image,
                    status=1,
                    language_id=bucket.language_id,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )
            )

    @staticmethod
    def create(
        db: Session,
        data: DropBucketCreate,
    ):

        drop_bucket = DropBucketMaster(
            parent_id=data.parent_id,
            drop_bucket_question_title=data.drop_bucket_question_title,
            drop_bucket_question_description=data.drop_bucket_question_description,
            image_url=data.image_url,
            marks=data.marks,
            status=data.status,
            language_id=data.language_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        db.add(drop_bucket)
        db.flush()

        for bucket in data.buckets:
            db.add(
                DropBucket(
                    drop_bucket_id=drop_bucket.drop_bucket_id,
                    bucket_name=bucket.bucket_name,
                    bucket_image=bucket.bucket_image,
                    status=1,
                    language_id=bucket.language_id,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )
            )

        db.commit()
        db.refresh(drop_bucket)

        drop_bucket.buckets = DropBucketRepository.get_buckets(
            db,
            drop_bucket.drop_bucket_id,
        )

        return drop_bucket

    @staticmethod
    def update(
        db: Session,
        drop_bucket: DropBucketMaster,
        data: DropBucketUpdate,
    ):

        update_data = data.model_dump(
            exclude_unset=True,
            exclude={"buckets"},
        )

        for key, value in update_data.items():
            setattr(drop_bucket, key, value)

        drop_bucket.updated_at = datetime.utcnow()

        if data.buckets is not None:

            db.query(DropBucket).filter(
                DropBucket.drop_bucket_id == drop_bucket.drop_bucket_id
            ).delete()

            for bucket in data.buckets:
                db.add(
                    DropBucket(
                        drop_bucket_id=drop_bucket.drop_bucket_id,
                        bucket_name=bucket.bucket_name,
                        bucket_image=bucket.bucket_image,
                        status=1,
                        language_id=bucket.language_id,
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow(),
                    )
                )

        db.commit()
        db.refresh(drop_bucket)

        drop_bucket.buckets = DropBucketRepository.get_buckets(
            db,
            drop_bucket.drop_bucket_id,
        )

        return drop_bucket

    @staticmethod
    def delete(
        db: Session,
        drop_bucket: DropBucketMaster,
    ):
        drop_bucket.deleted_at = datetime.utcnow()
        db.commit()

    @staticmethod
    def save_translation(
        db: Session,
        parent_id: int,
        data: DropBucketCreate,
    ):
        # Check if translation already exists
        drop_bucket = (
            db.query(DropBucketMaster)
            .filter(
                DropBucketMaster.parent_id == parent_id,
                DropBucketMaster.language_id == data.language_id,
                DropBucketMaster.deleted_at.is_(None),
            )
            .first()
        )

        if drop_bucket:
            # Update existing translation
            drop_bucket.drop_bucket_question_title = data.drop_bucket_question_title
            drop_bucket.drop_bucket_question_description = (
                data.drop_bucket_question_description
            )
            drop_bucket.image_url = data.image_url
            drop_bucket.marks = data.marks
            drop_bucket.status = data.status
            drop_bucket.updated_at = datetime.utcnow()

            # Delete old buckets and add new ones
            db.query(DropBucket).filter(
                DropBucket.drop_bucket_id == drop_bucket.drop_bucket_id
            ).delete(synchronize_session=False)

        else:
            # Create new translation
            drop_bucket = DropBucketMaster(
                parent_id=parent_id,
                drop_bucket_question_title=data.drop_bucket_question_title,
                drop_bucket_question_description=data.drop_bucket_question_description,
                image_url=data.image_url,
                marks=data.marks,
                status=data.status,
                language_id=data.language_id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(drop_bucket)
            db.flush()

        # Add buckets
        for bucket in data.buckets:
            db.add(
                DropBucket(
                    drop_bucket_id=drop_bucket.drop_bucket_id,
                    bucket_name=bucket.bucket_name,
                    bucket_image=bucket.bucket_image,
                    status=1,
                    language_id=bucket.language_id,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )
            )

        db.commit()
        db.refresh(drop_bucket)

        drop_bucket.buckets = DropBucketRepository.get_buckets(
            db,
            drop_bucket.drop_bucket_id,
        )

        return drop_bucket

    @staticmethod
    def get_items_by_bucket(
        db: Session,
        bucket_id: int,
        language_id: Optional[int] = None,
    ):
        return (
            db.query(DropBucketItem)
            .filter(
                DropBucketItem.bucket_id == bucket_id,
                DropBucketItem.language_id == language_id,
                DropBucketItem.deleted_at.is_(None),
            )
            .all()
        )

    @staticmethod
    def update_bucket_items(
        db: Session,
        bucket_id: int,
        data: DropBucketItemsUpdateRequest,
    ):
        existing_items = (
            db.query(DropBucketItem)
            .filter(
                DropBucketItem.bucket_id == bucket_id,
                DropBucketItem.deleted_at.is_(None),
            )
            .all()
        )

        existing_map = {item.drop_bucket_item_id: item for item in existing_items}

        request_ids = []

        for item in data.items:

            # Existing item
            if item.drop_bucket_item_id and item.drop_bucket_item_id in existing_map:

                db_item = existing_map[item.drop_bucket_item_id]

                db_item.item_name = item.item_name
                db_item.item_image = item.item_image
                db_item.status = item.status
                db_item.language_id = item.language_id
                db_item.updated_at = datetime.utcnow()

                request_ids.append(item.drop_bucket_item_id)

            # New item
            else:

                new_item = DropBucketItem(
                    bucket_id=bucket_id,
                    item_name=item.item_name,
                    item_image=item.item_image,
                    status=item.status,
                    language_id=item.language_id,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )

                db.add(new_item)
                db.flush()

                request_ids.append(new_item.drop_bucket_item_id)

        # Delete removed items
        for db_item in existing_items:

            if db_item.drop_bucket_item_id not in request_ids:
                db_item.deleted_at = datetime.utcnow()

        db.commit()

        return (
            db.query(DropBucketItem)
            .filter(
                DropBucketItem.bucket_id == bucket_id,
                DropBucketItem.deleted_at.is_(None),
            )
            .all()
        )
