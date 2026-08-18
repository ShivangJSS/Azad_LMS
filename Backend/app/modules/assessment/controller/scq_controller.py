from typing import Optional

from fastapi import Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.modules.assessment.schema.sqc_schema import (
    ScqCreate,
    ScqUpdate,
)

from app.modules.assessment.service.scq_service import (
    ScqService,
)


class ScqController:

    # =========================================================
    # GET ALL SCQs
    # =========================================================

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

    # =========================================================
    # GET SCQ
    #
    # Example:
    # GET /scqs/67?language_id=1
    # GET /scqs/67?language_id=2
    # =========================================================

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

    # =========================================================
    # CREATE SCQ
    #
    # POST /scqs/
    # =========================================================

    @staticmethod
    def create_scq(
        payload: ScqCreate,
        db: Session = Depends(get_db),
    ):
        return ScqService.create(
            db=db,
            data=payload,
        )

    # =========================================================
    # UPDATE SCQ
    #
    # PUT /scqs/{scq_id}
    # =========================================================

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

    # =========================================================
    # DELETE SCQ
    #
    # DELETE /scqs/{scq_id}
    # =========================================================

    @staticmethod
    def delete_scq(
        scq_id: int,
        db: Session = Depends(get_db),
    ):
        return ScqService.delete(
            db=db,
            scq_id=scq_id,
        )

    # =========================================================
    # EXPORT SCQs
    # =========================================================

    @staticmethod
    def export_scqs(
        language_id: Optional[int] = Query(None),
        db: Session = Depends(get_db),
    ):
        return ScqService.export(
            db=db,
            language_id=language_id,
        )

    # =========================================================
    # CREATE / UPDATE TRANSLATION
    #
    # PUT /scqs/{parent_id}/translation
    #
    # Example:
    #
    # PUT /scqs/67/translation
    #
    # Body:
    # {
    #     "scq_question_title": "...",
    #     "scq_question_description": "...",
    #     "image_url": null,
    #     "marks": 2,
    #     "status": 1,
    #     "language_id": 2,
    #     "options": [...]
    # }
    #
    # parent_id = 67
    # language_id = 2
    # =========================================================

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
