from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.batch.repository import BatchRepository
from app.modules.batch.schema import (
    BatchCreateRequest,
    BatchUpdateRequest,
)



class BatchService:

    @staticmethod
    def create_batch(
        db: Session,
        batch: BatchCreateRequest,
        created_by: int,
    ):

        new_batch = BatchRepository.create_batch(
            db=db,
            batch=batch,
            created_by=created_by,
        )

        if new_batch is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Centre not found",
            )

        if new_batch == "duplicate":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Batch name already exists",
            )

        return new_batch

    @staticmethod
    def get_batches(
        db: Session,
        state_id: Optional[int] = None,
        district_id: Optional[int] = None,
        search: Optional[str] = None,
        status_filter: Optional[int] = None,
    ):

        return BatchRepository.get_batches(
            db=db,
            state_id=state_id,
            district_id=district_id,
            status=status_filter,
            search=search,
        )

    @staticmethod
    def get_batch_by_id(
     db: Session,
     batch_id: int,
):

     batch = BatchRepository.get_batch_view_by_id(
        db=db,
        batch_id=batch_id,
    )

     if not batch:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Batch not found",
        )

     return batch
    
    @staticmethod
    def update_batch(
        db: Session,
        batch_id: int,
        data: BatchUpdateRequest,
    ):

        batch = BatchRepository.get_batch_by_id(
            db=db,
            batch_id=batch_id,
        )

        if not batch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Batch not found",
            )

        updated_batch = BatchRepository.update_batch(
            db=db,
            batch=batch,
            data=data,
        )

        if updated_batch is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Centre not found",
            )

        if updated_batch == "duplicate":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Batch name already exists",
            )

        return updated_batch

    @staticmethod
    def update_batch_status(
        db: Session,
        batch_id: int,
        new_status: int,
    ):

        batch = BatchRepository.get_batch_by_id(
            db=db,
            batch_id=batch_id,
        )

        if not batch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Batch not found",
            )

        return BatchRepository.update_batch_status(
            db=db,
            batch=batch,
            status=new_status,
        )

    @staticmethod
    def delete_batch(
        db: Session,
        batch_id: int,
    ):

        batch = BatchRepository.get_batch_by_id(
            db=db,
            batch_id=batch_id,
        )

        if not batch:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Batch not found",
            )

        BatchRepository.delete_batch(
            db=db,
            batch=batch,
        )

        return {
            "message": "Batch deleted successfully"
        }


    @staticmethod
    def get_batch_participants(
     db: Session,
     batch_id: int,
):
     return BatchRepository.get_batch_participants(
        db=db,
        batch_id=batch_id,
    )