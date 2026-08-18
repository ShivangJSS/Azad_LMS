from datetime import datetime

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.modules.assessment.model import DropBucket
from app.modules.document.model import LanguageMaster
from app.modules.assessment.repository.drop_bucket_repository import (
    DropBucketRepository,
)
from app.modules.assessment.schema.drop_bucket_schema import (
    DropBucketCreate,
    DropBucketItemsUpdateRequest,
    DropBucketResponse,
    DropBucketUpdate,
)


class DropBucketService:

    @staticmethod
    def get_all(
        db: Session,
        language_id: int | None = None,
        search: str | None = None,
    ):
        return DropBucketRepository.get_all(
            db=db,
            language_id=language_id,
            search=search,
        )

    @staticmethod
    def get_by_id(
        db: Session,
        parent_id: int,
        language_id: int,
    ) -> DropBucketResponse:
        # English
        if language_id == 1:
            drop_bucket = DropBucketRepository.get_by_id(
                db=db,
                drop_bucket_id=parent_id,
            )

            if not drop_bucket:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Drop Bucket not found.",
                )

            drop_bucket.is_translation = True
            drop_bucket.buckets = DropBucketRepository.get_buckets(
                db=db,
                drop_bucket_id=drop_bucket.drop_bucket_id,
            )
            return drop_bucket

        # Translation
        translation = DropBucketRepository.get_by_parent_and_language(
            db=db,
            parent_id=parent_id,
            language_id=language_id,
        )

        if translation:
            translation.is_translation = True
            translation.buckets = DropBucketRepository.get_buckets(
                db=db,
                drop_bucket_id=translation.drop_bucket_id,
            )
            return translation

        # Translation doesn't exist, prepare a blank form from English version
        english_drop_bucket = DropBucketRepository.get_by_id(
            db=db,
            drop_bucket_id=parent_id,
        )

        if not english_drop_bucket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="English Drop Bucket not found.",
            )

        # Blank out fields for the new translation
        english_drop_bucket.drop_bucket_id = None
        english_drop_bucket.parent_id = parent_id
        english_drop_bucket.language_id = language_id
        english_drop_bucket.drop_bucket_question_title = ""
        english_drop_bucket.drop_bucket_question_description = None
        english_drop_bucket.is_translation = False
        english_drop_bucket.buckets = []  # Return empty buckets for new translation

        return english_drop_bucket

    # ---------------------------------------------------------
    # All-language edit (flat) — read + bulk save
    # ---------------------------------------------------------

    @staticmethod
    def _language_names(db: Session) -> dict:
        return {
            row.language_id: row.language_name
            for row in db.query(LanguageMaster).all()
        }

    @staticmethod
    def _bucket_dict(bucket, lang_names) -> dict:
        return {
            "bucket_id": bucket.bucket_id,
            "drop_bucket_id": bucket.drop_bucket_id,
            "bucket_name": bucket.bucket_name,
            "bucket_image": bucket.bucket_image,
            "status": bucket.status,
            "language_id": bucket.language_id,
            "language_name": lang_names.get(bucket.language_id)
            or f"Language {bucket.language_id}",
        }

    @staticmethod
    def get_all_languages(db: Session, parent_id: int):
        english = DropBucketRepository.get_by_id(
            db=db, drop_bucket_id=parent_id
        )
        if not english:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Drop Bucket not found.",
            )

        lang_names = DropBucketService._language_names(db)

        buckets = []
        languages = [
            {
                "language_id": english.language_id,
                "language_name": lang_names.get(english.language_id)
                or "English",
            }
        ]

        for b in DropBucketRepository.get_buckets(
            db=db, drop_bucket_id=english.drop_bucket_id
        ):
            buckets.append(DropBucketService._bucket_dict(b, lang_names))

        for tr in DropBucketRepository.get_translations(
            db=db, parent_id=parent_id
        ):
            languages.append(
                {
                    "language_id": tr.language_id,
                    "language_name": lang_names.get(tr.language_id)
                    or f"Language {tr.language_id}",
                }
            )
            for b in DropBucketRepository.get_buckets(
                db=db, drop_bucket_id=tr.drop_bucket_id
            ):
                buckets.append(
                    DropBucketService._bucket_dict(b, lang_names)
                )

        return {
            "drop_bucket_id": english.drop_bucket_id,
            "drop_bucket_question_title": english.drop_bucket_question_title,
            "drop_bucket_question_description": english.drop_bucket_question_description,
            "image_url": english.image_url,
            "marks": float(english.marks) if english.marks is not None else None,
            "status": english.status,
            "language_id": english.language_id,
            "languages": languages,
            "buckets": buckets,
        }

    @staticmethod
    def bulk_update(db: Session, parent_id: int, data):
        english = DropBucketRepository.get_by_id(
            db=db, drop_bucket_id=parent_id
        )
        if not english:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Drop Bucket not found.",
            )

        # Group the flat bucket list by language.
        groups: dict = {}
        for b in data.buckets:
            groups.setdefault(b.language_id, []).append(b)

        english_buckets = groups.get(english.language_id) or groups.get(1) or []
        if len(english_buckets) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least two buckets are required for the base language.",
            )

        # English question fields + buckets.
        english.drop_bucket_question_title = data.drop_bucket_question_title
        english.drop_bucket_question_description = (
            data.drop_bucket_question_description
        )
        english.image_url = data.image_url
        english.marks = data.marks
        english.status = data.status
        english.updated_at = datetime.utcnow()

        DropBucketRepository.replace_buckets(
            db=db,
            drop_bucket_id=english.drop_bucket_id,
            buckets=english_buckets,
        )

        # Each translation keeps its own question fields; only its buckets
        # are refreshed from the matching language group.
        for tr in DropBucketRepository.get_translations(
            db=db, parent_id=parent_id
        ):
            tr_buckets = groups.get(tr.language_id)
            if tr_buckets:
                DropBucketRepository.replace_buckets(
                    db=db,
                    drop_bucket_id=tr.drop_bucket_id,
                    buckets=tr_buckets,
                )

        db.commit()

        return DropBucketService.get_all_languages(db=db, parent_id=parent_id)

    @staticmethod
    def create(
        db: Session,
        data: DropBucketCreate,
    ):
        if len(data.buckets) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least two buckets are required.",
            )

        return DropBucketRepository.create(
            db=db,
            data=data,
        )

    @staticmethod
    def update(
        db: Session,
        drop_bucket_id: int,
        data: DropBucketUpdate,
    ):
        drop_bucket = DropBucketRepository.get_by_id(
            db=db,
            drop_bucket_id=drop_bucket_id,
        )

        if not drop_bucket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Drop Bucket not found.",
            )

        if data.buckets is not None and len(data.buckets) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least two buckets are required.",
            )

        return DropBucketRepository.update(
            db=db,
            drop_bucket=drop_bucket,
            data=data,
        )

    @staticmethod
    def delete(
        db: Session,
        drop_bucket_id: int,
    ):
        drop_bucket = DropBucketRepository.get_by_id(
            db=db,
            drop_bucket_id=drop_bucket_id,
        )

        if not drop_bucket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Drop Bucket not found.",
            )

        DropBucketRepository.delete(
            db=db,
            drop_bucket=drop_bucket,
        )

        return {"message": "Drop Bucket deleted successfully."}

    @staticmethod
    def get_items_by_bucket(
        db: Session,
        bucket_id: int,
        language_id: int,
    ):
        return DropBucketRepository.get_items_by_bucket(
            db=db,
            bucket_id=bucket_id,
            language_id=language_id,
        )

    @staticmethod
    def get_question_items(
        db: Session,
        drop_bucket_id: int,
        language_id: int,
    ):
        """All items of a question across its buckets (with bucket names)."""
        master = DropBucketRepository.get_by_id(
            db=db, drop_bucket_id=drop_bucket_id
        )
        if not master:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Drop Bucket not found.",
            )

        buckets, items = DropBucketRepository.get_items_for_master(
            db=db,
            drop_bucket_id=drop_bucket_id,
            language_id=language_id,
        )

        return {
            "drop_bucket_id": drop_bucket_id,
            "buckets": buckets,
            "items": items,
        }

    @staticmethod
    def update_bucket_items(
        db: Session,
        bucket_id: int,
        data: DropBucketItemsUpdateRequest,
    ):

        bucket = db.query(DropBucket).filter(DropBucket.bucket_id == bucket_id).first()

        if not bucket:
            raise HTTPException(status_code=404, detail="Bucket not found.")

        return DropBucketRepository.update_bucket_items(
            db=db,
            bucket_id=bucket_id,
            data=data,
        )

    @staticmethod
    def save_translation(
        db: Session,
        parent_id: int,
        data: DropBucketCreate,
    ):
        if data.language_id == 1:
            raise HTTPException(
                status_code=400,
                detail="English Drop Bucket cannot be saved as a translation.",
            )

        if len(data.buckets) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least two buckets are required.",
            )

        english_bucket = DropBucketRepository.get_by_id(
            db=db,
            drop_bucket_id=parent_id,
        )
        if not english_bucket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="English Drop Bucket not found.",
            )

        return DropBucketRepository.save_translation(
            db=db,
            parent_id=parent_id,
            data=data,
        )
