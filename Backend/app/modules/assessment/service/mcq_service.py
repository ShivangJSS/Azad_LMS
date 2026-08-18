from io import BytesIO

from fastapi import HTTPException, status
from fastapi.responses import StreamingResponse
from openpyxl import Workbook
from sqlalchemy.orm import Session

from app.modules.assessment.repository.mcq_repo import McqRepository
from app.modules.assessment.schema.mcq_schema import (
    McqCreate,
    McqUpdate,
)


class McqService:

    @staticmethod
    def get_all(
        db: Session,
        language_id: int | None = None,
        search: str | None = None,
    ):
        return McqRepository.get_all(
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
        mcq = None
        # If a specific language is requested (and it's not English), try to find the translation.
        if language_id != 1:
            mcq = McqRepository.get_by_parent_and_language(
                db=db,
                parent_id=parent_id,
                language_id=language_id,
            )

        # If no translation was found, or if the original request was for English, get the parent/English version.
        if not mcq:
            mcq = McqRepository.get_by_id(
                db=db,
                mcq_id=parent_id,
            )

        # If no question is found at all (neither translation nor parent), raise 404.
        if not mcq:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="MCQ not found.",
            )

        # Attach options to the found question and return it.
        mcq.options = McqRepository.get_options(
            db,
            mcq.mcq_id,
        )
        return mcq

    @staticmethod
    def create(
        db: Session,
        data: McqCreate,
    ):
        McqService.validate_mcq(data)

        return McqRepository.create(db, data)

    @staticmethod
    def update(
        db: Session,
        mcq_id: int,
        data: McqUpdate,
    ):
        mcq = McqRepository.get_by_id(db, mcq_id)

        if not mcq:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="MCQ not found.",
            )

        if data.options is not None:
            McqService.validate_options(data.options)

        return McqRepository.update(db, mcq, data)

    @staticmethod
    def delete(
        db: Session,
        mcq_id: int,
    ):
        mcq = McqRepository.get_by_id(db, mcq_id)

        if not mcq:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="MCQ not found.",
            )

        McqRepository.delete(db, mcq)

        return {"message": "MCQ deleted successfully."}

    # ----------------------------
    # Validation
    # ----------------------------

    @staticmethod
    def validate_mcq(data: McqCreate):

        if not data.mcq_question_title.strip():
            raise HTTPException(status_code=400, detail="Question title is required.")

        McqService.validate_options(data.options)

    @staticmethod
    def validate_options(options):

        if len(options) < 2:
            raise HTTPException(
                status_code=400, detail="Minimum 2 options are required."
            )

        if len(options) > 6:
            raise HTTPException(
                status_code=400, detail="Maximum 6 options are allowed."
            )

        correct = sum(1 for option in options if option.is_mcq_option_correct == 1)

        if correct < 1:
            raise HTTPException(
                status_code=400,
                detail="At least one option must be marked as correct.",
            )

        seen_texts = set()

        for option in options:

            if not option.mcq_option_text.strip():
                raise HTTPException(
                    status_code=400, detail="Option text cannot be empty."
                )

            # No duplicate option text within the same question (exact match).
            if option.mcq_option_text in seen_texts:
                raise HTTPException(
                    status_code=400,
                    detail="Duplicate option text — each option must be unique.",
                )
            seen_texts.add(option.mcq_option_text)

    @staticmethod
    def export_mcqs(
        db: Session,
        language_id: int | None = None,
    ):

        mcqs = McqRepository.get_all_for_export(
            db,
            language_id,
        )

        wb = Workbook()
        ws = wb.active
        ws.title = "MCQ List"

        ws.append(
            ["S.No", "Question Title", "Description", "Marks", "Language", "Status"]
        )

        language_map = {1: "English", 2: "Hindi", 3: "Bangla", 4: "Tamil"}

        for index, mcq in enumerate(mcqs, start=1):

            ws.append(
                [
                    index,
                    mcq.mcq_question_title,
                    mcq.mcq_question_description,
                    float(mcq.marks),
                    language_map.get(mcq.language_id, ""),
                    "Active" if mcq.status == 1 else "Inactive",
                ]
            )

        stream = BytesIO()
        wb.save(stream)
        stream.seek(0)

        return StreamingResponse(
            stream,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=mcq_list.xlsx"},
        )

    @staticmethod
    def save_translation(
        db: Session,
        parent_id: int,
        data: McqCreate,
    ):
        correct = sum(1 for option in data.options if option.is_mcq_option_correct == 1)

        if correct == 0:
            raise HTTPException(
                status_code=400,
                detail="At least one correct option must be selected.",
            )

        english_mcq = McqRepository.get_by_id(
            db=db,
            mcq_id=parent_id,
        )

        if not english_mcq:
            raise HTTPException(
                status_code=404,
                detail="English MCQ not found.",
            )

        return McqRepository.save_translation(
            db=db,
            parent_id=parent_id,
            data=data,
        )
