from io import BytesIO
from typing import Optional

from fastapi import HTTPException, status
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from sqlalchemy.orm import Session

from app.modules.assessment.repository.sql_repository import ScqRepository
from app.modules.assessment.schema.sqc_schema import (
    ScqCreate,
    ScqUpdate,
)


class ScqService:

    @staticmethod
    def get_all(
        db: Session,
        language_id: Optional[int] = None,
        search: Optional[str] = None,
    ):
        return ScqRepository.get_all(
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
        scq = ScqRepository.get_by_parent_and_language(
            db=db,
            parent_id=parent_id,
            language_id=language_id,
        )

        if not scq:
            scq = ScqRepository.get_by_id(
                db=db,
                scq_id=parent_id,
            )

        if not scq:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="SCQ not found.",
            )

        scq.options = ScqRepository.get_options(
            db,
            scq.scq_id,
        )

        return scq

    @staticmethod
    def create(
        db: Session,
        data: ScqCreate,
    ):
        correct = sum(
            1
            for option in data.options
            if option.is_scq_option_correct == 1
        )

        if correct != 1:
            raise HTTPException(
                status_code=400,
                detail="Exactly one option must be marked as correct.",
            )

        return ScqRepository.create(
            db=db,
            data=data,
        )

    @staticmethod
    def update(
        db: Session,
        scq_id: int,
        data: ScqUpdate,
    ):
        scq = ScqRepository.get_by_id(
            db,
            scq_id,
        )

        if not scq:
            raise HTTPException(
                status_code=404,
                detail="SCQ not found.",
            )

        if data.options is not None:
            correct = sum(
                1
                for option in data.options
                if option.is_scq_option_correct == 1
            )

            if correct != 1:
                raise HTTPException(
                    status_code=400,
                    detail="Exactly one option must be marked as correct.",
                )

        return ScqRepository.update(
            db=db,
            scq=scq,
            data=data,
        )

    @staticmethod
    def delete(
        db: Session,
        scq_id: int,
    ):
        scq = ScqRepository.get_by_id(
            db,
            scq_id,
        )

        if not scq:
            raise HTTPException(
                status_code=404,
                detail="SCQ not found.",
            )

        ScqRepository.delete(
            db,
            scq,
        )

        return {
            "message": "SCQ deleted successfully."
        }

    @staticmethod
    def export(
        db: Session,
        language_id: Optional[int] = None,
    ):
        scqs = ScqRepository.get_all(
            db=db,
            language_id=language_id,
        )

        wb = Workbook()
        ws = wb.active
        ws.title = "SCQ"

        ws.append([
            "S.No",
            "Question",
            "Description",
            "Marks",
            "Language",
            "Status",
        ])

        languages = {
            1: "English",
            2: "Hindi",
            3: "Bangla",
            4: "Tamil",
        }

        for index, scq in enumerate(scqs, start=1):
            ws.append([
                index,
                scq.scq_question_title,
                scq.scq_question_description,
                float(scq.marks),
                languages.get(scq.language_id, ""),
                "Active" if scq.status == 1 else "Inactive",
            ])

        stream = BytesIO()
        wb.save(stream)
        stream.seek(0)

        return StreamingResponse(
            stream,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={
                "Content-Disposition": "attachment; filename=scq_list.xlsx"
            },
        )



    @staticmethod
    def save_translation(
     db: Session,
     parent_id: int,
     data: ScqCreate,
):
     correct = sum(
        1
        for option in data.options
        if option.is_scq_option_correct == 1
    )

     if correct != 1:
        raise HTTPException(
            status_code=400,
            detail="Exactly one option must be marked as correct.",
        )

     english_scq = ScqRepository.get_by_id(
        db=db,
        scq_id=parent_id,
    )

     if not english_scq:
        raise HTTPException(
            status_code=404,
            detail="English SCQ not found.",
        )

     return ScqRepository.save_translation(
        db=db,
        parent_id=parent_id,
        data=data,
    )