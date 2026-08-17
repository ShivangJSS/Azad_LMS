from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.modules.assessment.model import DropBucket
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
    ):
        if language_id == 1:
            drop_bucket = DropBucketRepository.get_by_id(
                db=db,
                drop_bucket_id=parent_id,
            )
        else:
            drop_bucket = DropBucketRepository.get_by_parent_and_language(
                db=db,
                parent_id=parent_id,
                language_id=language_id,
            )

        if not drop_bucket:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Drop Bucket not found.",
            )

        drop_bucket.buckets = DropBucketRepository.get_buckets(
            db=db,
            drop_bucket_id=drop_bucket.drop_bucket_id,
        )

        return drop_bucket

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

        return {
            "message": "Drop Bucket deleted successfully."
        }
    

    @staticmethod
    def get_items_by_bucket(
     db: Session,
     bucket_id: int,
):
     return DropBucketRepository.get_items_by_bucket(
        db=db,
        bucket_id=bucket_id,
    )



    @staticmethod
    def get_items_by_bucket(
     db: Session,
     bucket_id: int,
):
     return DropBucketRepository.get_items_by_bucket(
        db=db,
        bucket_id=bucket_id,
    )


    @staticmethod 
    def update_bucket_items(
     db: Session,
     bucket_id: int,
     data: DropBucketItemsUpdateRequest,
):

     bucket = db.query(DropBucket).filter(
        DropBucket.bucket_id == bucket_id
    ).first()

     if not bucket:
        raise HTTPException(
            status_code=404,
            detail="Bucket not found."
        )

     return DropBucketRepository.update_bucket_items(
      db=db,
      bucket_id=bucket_id,
      data=data,
)