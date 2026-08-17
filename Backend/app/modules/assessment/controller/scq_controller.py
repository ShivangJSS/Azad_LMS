from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.modules.assessment.schema.sqc_schema import (
    ScqCreate,
    ScqResponse,
    ScqUpdate,
)
from app.modules.assessment.service.scq_service import ScqService


class ScqController:

    @staticmethod
    def get_all_scqs(
        language_id: Optional[int] = Query(None),
        search: Optional[str] = Query(None),
        db: Session = Depends(get_db),
    ):
        return ScqService.get_all(
            db=db,
            language_id=language_id,
            search=search,
        )

    @staticmethod
    def get_scq(
        parent_id: int,
        language_id: int = Query(1),
        db: Session = Depends(get_db),
    ):
        return ScqService.get_by_id(
            db=db,
            parent_id=parent_id,
            language_id=language_id,
        )

    @staticmethod
    def create_scq(
        payload: ScqCreate,
        db: Session = Depends(get_db),
    ):
        return ScqService.create(
            db=db,
            data=payload,
        )

    @staticmethod
    def update_scq(
        scq_id: int,
        payload: ScqUpdate,
        db: Session = Depends(get_db),
    ):
        return ScqService.update(
            db=db,
            scq_id=scq_id,
            data=payload,
        )

    @staticmethod
    def delete_scq(
        scq_id: int,
        db: Session = Depends(get_db),
    ):
        return ScqService.delete(
            db=db,
            scq_id=scq_id,
        )

    @staticmethod
    def export_scqs(
        language_id: Optional[int] = Query(None),
        db: Session = Depends(get_db),
    ):
        return ScqService.export(
            db=db,
            language_id=language_id,
        )




    @staticmethod
    def save_translation(
     parent_id: int,
     payload: ScqCreate,
     db: Session = Depends(get_db),
):
     return ScqService.save_translation(
        db=db,
        parent_id=parent_id,
        data=payload,
    )