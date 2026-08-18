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


def _assert_scq_options_unique(options):
    """No duplicate / empty option text within the same question (exact match)."""
    seen = set()
    for option in options or []:
        if not option.scq_option_text.strip():
            raise HTTPException(
                status_code=400, detail="Option text cannot be empty."
            )
        if option.scq_option_text in seen:
            raise HTTPException(
                status_code=400,
                detail="Duplicate option text — each option must be unique.",
            )
        seen.add(option.scq_option_text)


class ScqService:

    # =========================================================
    # GET ALL
    # =========================================================

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

    # =========================================================
    # GET BY PARENT + LANGUAGE
    # =========================================================

    @staticmethod
    def get_by_id(
        db: Session,
        parent_id: int,
        language_id: int,
    ):
        """
        parent_id:
            Always the English SCQ ID.

        language_id:
            1 = English
            2 = Hindi
            3 = Bangla
            4 = Tamil

        Important:
            If translation does not exist, DO NOT return English.
            Return None so frontend can show blank translation form.
        """

        # =====================================================
        # ENGLISH
        # =====================================================

        if language_id == 1:

            scq = ScqRepository.get_by_id(
                db=db,
                scq_id=parent_id,
            )

            if not scq:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="SCQ not found.",
                )

        # =====================================================
        # TRANSLATION
        # =====================================================

        else:

            scq = ScqRepository.get_by_parent_and_language(
                db=db,
                parent_id=parent_id,
                language_id=language_id,
            )

            # IMPORTANT:
            # Do NOT fallback to English.
            #
            # If Hindi doesn't exist:
            # return None.
            #
            # Frontend will then show blank Hindi form.

            if not scq:
                return None

        # =====================================================
        # LOAD OPTIONS
        # =====================================================

        scq.options = ScqRepository.get_options(
            db=db,
            scq_id=scq.scq_id,
        )

        return scq

    # =========================================================
    # CREATE
    # =========================================================

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
                detail=(
                    "Exactly one option must be "
                    "marked as correct."
                ),
            )

        _assert_scq_options_unique(data.options)

        return ScqRepository.create(
            db=db,
            data=data,
        )

    # =========================================================
    # UPDATE
    # =========================================================

    @staticmethod
    def update(
        db: Session,
        scq_id: int,
        data: ScqUpdate,
    ):
        scq = ScqRepository.get_by_id(
            db=db,
            scq_id=scq_id,
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
                    detail=(
                        "Exactly one option must be "
                        "marked as correct."
                    ),
                )

            _assert_scq_options_unique(data.options)

        return ScqRepository.update(
            db=db,
            scq=scq,
            data=data,
        )

    # =========================================================
    # DELETE
    # =========================================================

    @staticmethod
    def delete(
        db: Session,
        scq_id: int,
    ):
        scq = ScqRepository.get_by_id(
            db=db,
            scq_id=scq_id,
        )

        if not scq:
            raise HTTPException(
                status_code=404,
                detail="SCQ not found.",
            )

        ScqRepository.delete(
            db=db,
            scq=scq,
        )

        return {
            "message": "SCQ deleted successfully."
        }

    # =========================================================
    # EXPORT
    # =========================================================

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

        for index, scq in enumerate(
            scqs,
            start=1,
        ):

            ws.append([
                index,
                scq.scq_question_title,
                scq.scq_question_description,
                float(scq.marks),
                languages.get(
                    scq.language_id,
                    "",
                ),
                (
                    "Active"
                    if scq.status == 1
                    else "Inactive"
                ),
            ])

        stream = BytesIO()

        wb.save(stream)

        stream.seek(0)

        return StreamingResponse(
            stream,
            media_type=(
                "application/vnd.openxmlformats-"
                "officedocument.spreadsheetml.sheet"
            ),
            headers={
                "Content-Disposition":
                    "attachment; "
                    "filename=scq_list.xlsx"
            },
        )

    # =========================================================
    # SAVE TRANSLATION
    # =========================================================

    @staticmethod
    def save_translation(
        db: Session,
        parent_id: int,
        data: ScqCreate,
    ):
        """
        Creates or updates a translation under
        the English parent SCQ.

        Example:

        English:
            scq_id = 67
            parent_id = NULL
            language_id = 1

        Hindi:
            scq_id = 68
            parent_id = 67
            language_id = 2

        Bangla:
            scq_id = 69
            parent_id = 67
            language_id = 3
        """

        # =====================================================
        # ONLY TRANSLATIONS ALLOWED HERE
        # =====================================================

        if data.language_id == 1:
            raise HTTPException(
                status_code=400,
                detail=(
                    "English SCQ cannot be saved "
                    "as a translation."
                ),
            )

        # =====================================================
        # VALIDATE CORRECT OPTION
        # =====================================================

        correct = sum(
            1
            for option in data.options
            if option.is_scq_option_correct == 1
        )

        if correct != 1:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Exactly one option must be "
                    "marked as correct."
                ),
            )

        # =====================================================
        # CHECK ENGLISH PARENT
        # =====================================================

        english_scq = ScqRepository.get_by_id(
            db=db,
            scq_id=parent_id,
        )

        if not english_scq:
            raise HTTPException(
                status_code=404,
                detail="English SCQ not found.",
            )

        # =====================================================
        # SAVE TRANSLATION
        # =====================================================

        return ScqRepository.save_translation(
            db=db,
            parent_id=parent_id,
            data=data,
        )