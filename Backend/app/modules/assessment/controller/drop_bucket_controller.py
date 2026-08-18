from typing import Optional

from fastapi import Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.modules.assessment.schema.drop_bucket_schema import (
    DropBucketBulkUpdate,
    DropBucketCreate,
    DropBucketItemsUpdateRequest,
    DropBucketResponse,
    DropBucketUpdate,
)
from app.modules.assessment.service.drop_bucket_service import (
    DropBucketService,
)


class DropBucketController:

    @staticmethod
    def get_all(
        language_id: Optional[int] = Query(None),
        search: Optional[str] = Query(None),
        page: int = Query(1, ge=1),
        limit: int = Query(10, ge=1),
        db: Session = Depends(get_db),
    ):
        return DropBucketService.get_all(
            db=db,
            language_id=language_id,
            search=search,
        )

    @staticmethod
    def get_by_id(
        parent_id: int,
        language_id: int = Query(...),
        db: Session = Depends(get_db),
    ) -> DropBucketResponse:
        return DropBucketService.get_by_id(
            db=db,
            parent_id=parent_id,
            language_id=language_id,
        )

    @staticmethod
    def get_all_languages(
        parent_id: int,
        db: Session = Depends(get_db),
    ):
        return DropBucketService.get_all_languages(
            db=db,
            parent_id=parent_id,
        )

    @staticmethod
    def bulk_update(
        parent_id: int,
        payload: DropBucketBulkUpdate,
        db: Session = Depends(get_db),
    ):
        return DropBucketService.bulk_update(
            db=db,
            parent_id=parent_id,
            data=payload,
        )

    @staticmethod
    def create(
        payload: DropBucketCreate,
        db: Session = Depends(get_db),
    ) -> DropBucketResponse:
        return DropBucketService.create(
            db=db,
            data=payload,
        )

    @staticmethod
    def update(
        drop_bucket_id: int,
        payload: DropBucketUpdate,
        db: Session = Depends(get_db),
    ) -> DropBucketResponse:
        return DropBucketService.update(
            db=db,
            drop_bucket_id=drop_bucket_id,
            data=payload,
        )

    @staticmethod
    def delete(
        drop_bucket_id: int,
        db: Session = Depends(get_db),
    ):
        return DropBucketService.delete(
            db=db,
            drop_bucket_id=drop_bucket_id,
        )

    @staticmethod
    def get_items_by_bucket(
        bucket_id: int,
        language_id: int = Query(1),
        db: Session = Depends(get_db),
    ):
        return DropBucketService.get_items_by_bucket(
            db=db,
            language_id=language_id,
            bucket_id=bucket_id,
        )

    @staticmethod
    def get_question_items(
        drop_bucket_id: int,
        language_id: int = Query(1),
        db: Session = Depends(get_db),
    ):
        return DropBucketService.get_question_items(
            db=db,
            drop_bucket_id=drop_bucket_id,
            language_id=language_id,
        )

    @staticmethod
    def update_bucket_items(
        bucket_id: int,
        payload: DropBucketItemsUpdateRequest,
        db: Session = Depends(get_db),
    ):
        return DropBucketService.update_bucket_items(
            db=db,
            bucket_id=bucket_id,
            data=payload,
        )

    @staticmethod
    def save_translation(
        parent_id: int,
        payload: DropBucketCreate,
        db: Session = Depends(get_db),
    ):
        return DropBucketService.save_translation(
            db=db,
            parent_id=parent_id,
            data=payload,
        )
