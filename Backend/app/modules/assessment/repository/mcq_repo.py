from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

from app.modules.assessment.model import (
    McqMaster,
    McqQuestionOption,
)
from app.modules.assessment.schema.mcq_schema import (
    McqCreate,
    McqUpdate,
)


class McqRepository:

    # ============================================================
    # PRIVATE HELPERS
    # ============================================================

    @staticmethod
    def _normalize_option_text(text: Optional[str]) -> str:
        """
        Normalize option text for duplicate checking.

        Example:
            "Following speed limits"
            " following speed limits "
            "FOLLOWING SPEED LIMITS"

        All are treated as the same option.
        """
        return " ".join((text or "").strip().split()).casefold()

    @staticmethod
    def _get_unique_options(
        options: List[McqQuestionOption],
    ) -> List[McqQuestionOption]:
        """
        Remove duplicate option text from database results.

        Keeps the first option based on mcq_option_id.
        """

        unique_options = []
        seen_options = set()

        for option in options:
            normalized_text = McqRepository._normalize_option_text(
                option.mcq_option_text
            )

            # Empty option text is also ignored
            if not normalized_text:
                continue

            if normalized_text in seen_options:
                continue

            seen_options.add(normalized_text)
            unique_options.append(option)

        return unique_options

    @staticmethod
    def _add_options(
        db: Session,
        mcq_id: int,
        options,
        now: datetime,
    ) -> None:
        """
        Add MCQ options while preventing duplicate option text.
        """

        seen_options = set()

        for option in options:

            option_text = " ".join((option.mcq_option_text or "").strip().split())

            normalized_text = McqRepository._normalize_option_text(option_text)

            # Ignore empty option text
            if not normalized_text:
                continue

            # Ignore duplicate option text
            if normalized_text in seen_options:
                continue

            seen_options.add(normalized_text)

            db.add(
                McqQuestionOption(
                    mcq_id=mcq_id,
                    mcq_option_text=option_text,
                    is_mcq_option_correct=(option.is_mcq_option_correct),
                    status=option.status,
                    language_id=option.language_id,
                    created_at=now,
                    updated_at=now,
                )
            )

    # ============================================================
    # GET ALL
    # ============================================================

    @staticmethod
    def get_all(
        db: Session,
        language_id: Optional[int] = None,
        search: Optional[str] = None,
    ) -> List[McqMaster]:

        query = db.query(McqMaster).filter(McqMaster.deleted_at.is_(None))

        if language_id is not None:
            query = query.filter(McqMaster.language_id == language_id)

        if search:
            search_text = search.strip()

            if search_text:
                query = query.filter(
                    McqMaster.mcq_question_title.ilike(f"%{search_text}%")
                )

        mcqs = query.order_by(McqMaster.mcq_id.desc()).all()

        # Load unique options for every MCQ
        for mcq in mcqs:
            mcq.options = McqRepository.get_options(
                db,
                mcq.mcq_id,
            )

        return mcqs

    # ============================================================
    # GET BY ID
    # ============================================================

    @staticmethod
    def get_by_id(
        db: Session,
        mcq_id: int,
    ) -> Optional[McqMaster]:

        mcq = (
            db.query(McqMaster)
            .filter(
                McqMaster.mcq_id == mcq_id,
                McqMaster.deleted_at.is_(None),
            )
            .first()
        )

        if mcq:
            mcq.options = McqRepository.get_options(
                db,
                mcq.mcq_id,
            )

        return mcq

    # ============================================================
    # GET BY PARENT AND LANGUAGE
    # ============================================================

    @staticmethod
    def get_by_parent_and_language(
        db: Session,
        parent_id: int,
        language_id: int,
    ) -> Optional[McqMaster]:

        mcq = (
            db.query(McqMaster)
            .filter(
                McqMaster.parent_id == parent_id,
                McqMaster.language_id == language_id,
                McqMaster.deleted_at.is_(None),
            )
            .first()
        )

        if mcq:
            mcq.options = McqRepository.get_options(
                db,
                mcq.mcq_id,
            )

        return mcq

    # ============================================================
    # GET OPTIONS
    # ============================================================

    @staticmethod
    def get_options(
        db: Session,
        mcq_id: int,
    ) -> List[McqQuestionOption]:

        options = (
            db.query(McqQuestionOption)
            .filter(
                McqQuestionOption.mcq_id == mcq_id,
                McqQuestionOption.deleted_at.is_(None),
            )
            .order_by(McqQuestionOption.mcq_option_id.asc())
            .all()
        )

        return McqRepository._get_unique_options(options)

    # ============================================================
    # CREATE
    # ============================================================

    @staticmethod
    def create(
        db: Session,
        data: McqCreate,
    ) -> McqMaster:

        now = datetime.utcnow()

        mcq = McqMaster(
            parent_id=data.parent_id,
            mcq_question_title=data.mcq_question_title,
            mcq_question_description=(data.mcq_question_description),
            image_url=data.image_url,
            marks=(round(data.marks, 2) if data.marks is not None else 1.0),
            status=data.status,
            language_id=data.language_id,
            created_at=now,
            updated_at=now,
        )

        db.add(mcq)
        db.flush()

        # Add options without duplicates
        McqRepository._add_options(
            db=db,
            mcq_id=mcq.mcq_id,
            options=data.options,
            now=now,
        )

        db.commit()
        db.refresh(mcq)

        # Return unique options
        mcq.options = McqRepository.get_options(
            db,
            mcq.mcq_id,
        )

        return mcq

    # ============================================================
    # UPDATE
    # ============================================================

    @staticmethod
    def update(
        db: Session,
        mcq: McqMaster,
        data: McqUpdate,
    ) -> McqMaster:

        # Update MCQ fields
        update_data = data.model_dump(
            exclude_unset=True,
            exclude={"options"},
        )

        for key, value in update_data.items():
            setattr(
                mcq,
                key,
                value,
            )

        mcq.updated_at = datetime.utcnow()

        # Replace options only when options are supplied
        if data.options is not None:

            # Remove old options
            db.query(McqQuestionOption).filter(
                McqQuestionOption.mcq_id == mcq.mcq_id
            ).delete(synchronize_session=False)

            db.flush()

            now = datetime.utcnow()

            # Add new unique options
            McqRepository._add_options(
                db=db,
                mcq_id=mcq.mcq_id,
                options=data.options,
                now=now,
            )

        db.commit()
        db.refresh(mcq)

        # Return unique options
        mcq.options = McqRepository.get_options(
            db,
            mcq.mcq_id,
        )

        return mcq

    # ============================================================
    # DELETE
    # ============================================================

    @staticmethod
    def delete(
        db: Session,
        mcq: McqMaster,
    ) -> None:

        mcq.deleted_at = datetime.utcnow()

        db.commit()

    # ============================================================
    # GET ALL FOR EXPORT
    # ============================================================

    @staticmethod
    def get_all_for_export(
        db: Session,
        language_id: Optional[int] = None,
        search: Optional[str] = None,
    ) -> List[McqMaster]:

        query = db.query(McqMaster).filter(McqMaster.deleted_at.is_(None))

        if language_id is not None:
            query = query.filter(McqMaster.language_id == language_id)

        if search and search.strip():
            query = query.filter(
                McqMaster.mcq_question_title.ilike(f"%{search.strip()}%")
            )

        mcqs = query.order_by(McqMaster.mcq_id.desc()).all()

        for mcq in mcqs:
            mcq.options = McqRepository.get_options(
                db,
                mcq.mcq_id,
            )

        return mcqs

    # ============================================================
    # SAVE TRANSLATION
    # ============================================================

    @staticmethod
    def save_translation(
        db: Session,
        parent_id: int,
        data: McqCreate,
    ) -> McqMaster:

        # Find existing translation
        mcq = (
            db.query(McqMaster)
            .filter(
                McqMaster.parent_id == parent_id,
                McqMaster.language_id == data.language_id,
                McqMaster.deleted_at.is_(None),
            )
            .first()
        )

        now = datetime.utcnow()

        # ========================================================
        # UPDATE EXISTING TRANSLATION
        # ========================================================

        if mcq:

            mcq.mcq_question_title = data.mcq_question_title

            mcq.mcq_question_description = data.mcq_question_description

            mcq.image_url = data.image_url

            mcq.marks = round(data.marks, 2) if data.marks is not None else 1.0

            mcq.status = data.status
            mcq.updated_at = now

            # Remove existing options
            db.query(McqQuestionOption).filter(
                McqQuestionOption.mcq_id == mcq.mcq_id
            ).delete(synchronize_session=False)

            db.flush()

        # ========================================================
        # CREATE NEW TRANSLATION
        # ========================================================

        else:

            mcq = McqMaster(
                parent_id=parent_id,
                mcq_question_title=(data.mcq_question_title),
                mcq_question_description=(data.mcq_question_description),
                image_url=data.image_url,
                marks=(round(data.marks, 2) if data.marks is not None else 1.0),
                status=data.status,
                language_id=data.language_id,
                created_at=now,
                updated_at=now,
            )

            db.add(mcq)
            db.flush()

        # ========================================================
        # ADD UNIQUE TRANSLATION OPTIONS
        # ========================================================

        McqRepository._add_options(
            db=db,
            mcq_id=mcq.mcq_id,
            options=data.options,
            now=now,
        )

        db.commit()
        db.refresh(mcq)

        # Return unique options
        mcq.options = McqRepository.get_options(
            db,
            mcq.mcq_id,
        )

        return mcq
