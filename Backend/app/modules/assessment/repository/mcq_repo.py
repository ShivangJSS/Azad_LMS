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

    @staticmethod
    def get_all(
        db: Session,
        language_id: Optional[int] = None,
        search: Optional[str] = None,
    ) -> List[McqMaster]:

        query = db.query(McqMaster).filter(
            McqMaster.deleted_at.is_(None)
        )

        if language_id:
            query = query.filter(
                McqMaster.language_id == language_id
            )

        if search:
            query = query.filter(
                McqMaster.mcq_question_title.ilike(f"%{search}%")
            )

        return query.order_by(
            McqMaster.mcq_id.desc()
        ).all()

    @staticmethod
    def get_by_id(
        db: Session,
        mcq_id: int,
    ):

        return (
            db.query(McqMaster)
            .filter(
                McqMaster.mcq_id == mcq_id,
                McqMaster.deleted_at.is_(None),
            )
            .first()
        )

    @staticmethod
    def get_by_parent_and_language(
        db: Session,
        parent_id: int,
        language_id: int,
    ):

        return (
            db.query(McqMaster)
            .filter(
                McqMaster.parent_id == parent_id,
                McqMaster.language_id == language_id,
                McqMaster.deleted_at.is_(None),
            )
            .first()
        )

    @staticmethod
    def get_options(
        db: Session,
        mcq_id: int,
    ) -> List[McqQuestionOption]:

        return (
            db.query(McqQuestionOption)
            .filter(
                McqQuestionOption.mcq_id == mcq_id,
                McqQuestionOption.deleted_at.is_(None),
            )
            .order_by(McqQuestionOption.mcq_option_id)
            .all()
        )

    @staticmethod
    def create(
        db: Session,
        data: McqCreate,
    ) -> McqMaster:

        mcq = McqMaster(
            parent_id=data.parent_id,
            mcq_question_title=data.mcq_question_title,
            mcq_question_description=data.mcq_question_description,
            image_url=data.image_url,
            marks=data.marks,
            status=data.status,
            language_id=data.language_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        db.add(mcq)
        db.flush()

        for option in data.options:
            db.add(
                McqQuestionOption(
                    mcq_id=mcq.mcq_id,
                    mcq_option_text=option.mcq_option_text,
                    is_mcq_option_correct=option.is_mcq_option_correct,
                    status=option.status,
                    language_id=option.language_id,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )
            )

        db.commit()
        db.refresh(mcq)

        # Load options before returning
        mcq.options = McqRepository.get_options(
            db,
            mcq.mcq_id,
        )

        return mcq

    @staticmethod
    def update(
        db: Session,
        mcq: McqMaster,
        data: McqUpdate,
    ) -> McqMaster:

        update_data = data.model_dump(
            exclude_unset=True,
            exclude={"options"},
        )

        for key, value in update_data.items():
            setattr(mcq, key, value)

        mcq.updated_at = datetime.utcnow()

        if data.options is not None:

            db.query(McqQuestionOption).filter(
                McqQuestionOption.mcq_id == mcq.mcq_id
            ).delete()

            db.flush()

            for option in data.options:
                db.add(
                    McqQuestionOption(
                        mcq_id=mcq.mcq_id,
                        mcq_option_text=option.mcq_option_text,
                        is_mcq_option_correct=option.is_mcq_option_correct,
                        status=option.status,
                        language_id=option.language_id,
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow(),
                    )
                )

        db.commit()
        db.refresh(mcq)

        mcq.options = McqRepository.get_options(
            db,
            mcq.mcq_id,
        )

        return mcq

    @staticmethod
    def delete(
        db: Session,
        mcq: McqMaster,
    ):

        mcq.deleted_at = datetime.utcnow()

        db.commit()



    @staticmethod
    def get_all_for_export(
     db: Session,
     language_id: Optional[int] = None,
):

     query = db.query(McqMaster).filter(
        McqMaster.deleted_at.is_(None)
    )

     if language_id:
        query = query.filter(
            McqMaster.language_id == language_id
        )

     return query.order_by(
        McqMaster.mcq_id.desc()


    ).all()    




    @staticmethod
    def save_translation(
     db: Session,
     parent_id: int,
     data: McqCreate,
) -> McqMaster:

     mcq = (
        db.query(McqMaster)
        .filter(
            McqMaster.parent_id == parent_id,
            McqMaster.language_id == data.language_id,
            McqMaster.deleted_at.is_(None),
        )
        .first()
    )

     if mcq:
        # Update existing translation
        mcq.mcq_question_title = data.mcq_question_title
        mcq.mcq_question_description = data.mcq_question_description
        mcq.image_url = data.image_url
        mcq.marks = data.marks
        mcq.status = data.status
        mcq.updated_at = datetime.utcnow()

        db.query(McqQuestionOption).filter(
            McqQuestionOption.mcq_id == mcq.mcq_id
        ).delete()

     else:
        # Create new translation
        mcq = McqMaster(
            parent_id=parent_id,
            mcq_question_title=data.mcq_question_title,
            mcq_question_description=data.mcq_question_description,
            image_url=data.image_url,
            marks=data.marks,
            status=data.status,
            language_id=data.language_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        db.add(mcq)
        db.flush()

     for option in data.options:
        db.add(
            McqQuestionOption(
                mcq_id=mcq.mcq_id,
                mcq_option_text=option.mcq_option_text,
                is_mcq_option_correct=option.is_mcq_option_correct,
                status=option.status,
                language_id=option.language_id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
        )

     db.commit()
     db.refresh(mcq)

     mcq.options = McqRepository.get_options(
        db,
        mcq.mcq_id,
    )

     return mcq