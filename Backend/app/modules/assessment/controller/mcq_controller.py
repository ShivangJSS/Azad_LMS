from typing import Optional

from fastapi import Depends, Query
from sqlalchemy.orm import Session

from app.modules.assessment.schema.mcq_schema import (
    McqCreate,
    McqResponse,
    McqUpdate,
)
from app.modules.assessment.service.mcq_service import McqService
from app.database.database import get_db


class McqController:

    @staticmethod
    def get_all_mcqs(
        language_id: Optional[int] = Query(None),
        search: Optional[str] = Query(None),
        db: Session = Depends(get_db),
    ):
        return McqService.get_all(
            db=db,
            language_id=language_id,
            search=search,
        )


    @staticmethod
    def get_mcq(
        parent_id: int,
        language_id: int = Query(1),
        db: Session = Depends(get_db),
    ):
        return McqService.get_by_id(
            db=db,
            parent_id=parent_id,
            language_id=language_id,
        )
    @staticmethod
    def create_mcq(
        request: McqCreate,
        db: Session = Depends(get_db),
    ) -> McqResponse:
        return McqService.create(
            db=db,
            data=request,
        )

    @staticmethod
    def update_mcq(
        mcq_id: int,
        request: McqUpdate,
        db: Session = Depends(get_db),
    ) -> McqResponse:
        return McqService.update(
            db=db,
            mcq_id=mcq_id,
            data=request,
        )

    @staticmethod
    def delete_mcq(
        mcq_id: int,
        db: Session = Depends(get_db),
    ):
        return McqService.delete(
            db=db,
            mcq_id=mcq_id,
        )

    @staticmethod
    def export_mcqs(
     language_id: int | None = Query(None),
     db: Session = Depends(get_db),
):
     return McqService.export_mcqs(
        db=db,
        language_id=language_id,
    )


    @staticmethod
    def save_translation(
     parent_id: int,
     payload: McqCreate,
     db: Session = Depends(get_db),
):
     return McqService.save_translation(
        db=db,
        parent_id=parent_id,
        data=payload,
    )