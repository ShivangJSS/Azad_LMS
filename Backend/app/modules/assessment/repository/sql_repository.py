from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session

from app.modules.assessment.model import (
    ScqMaster,
    ScqQuestionOption,
)
from app.modules.assessment.schema.sqc_schema import (
    ScqCreate,
    ScqUpdate,

    
)


class ScqRepository:

    @staticmethod
    def get_all(
        db: Session,
        language_id: Optional[int] = None,
        search: Optional[str] = None,
    ) -> List[ScqMaster]:

        query = db.query(ScqMaster).filter(
            ScqMaster.deleted_at.is_(None)
        )

        if language_id:
            query = query.filter(
                ScqMaster.language_id == language_id
            )

        if search:
            query = query.filter(
                ScqMaster.scq_question_title.ilike(f"%{search}%")
            )

        return query.order_by(
            ScqMaster.scq_id.desc()
        ).all()

    @staticmethod
    def get_by_id(
        db: Session,
        scq_id: int,
    ):

        return (
            db.query(ScqMaster)
            .filter(
                ScqMaster.scq_id == scq_id,
                ScqMaster.deleted_at.is_(None),
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
            db.query(ScqMaster)
            .filter(
                ScqMaster.parent_id == parent_id,
                ScqMaster.language_id == language_id,
                ScqMaster.deleted_at.is_(None),
            )
            .first()
        )

    @staticmethod
    def get_options(
        db: Session,
        scq_id: int,
    ) -> List[ScqQuestionOption]:

        return (
            db.query(ScqQuestionOption)
            .filter(
                ScqQuestionOption.scq_id == scq_id,
                ScqQuestionOption.deleted_at.is_(None),
            )
            .order_by(ScqQuestionOption.scq_option_id)
            .all()
        )

    @staticmethod
    def create(
        db: Session,
        data: ScqCreate,
    ) -> ScqMaster:

        scq = ScqMaster(
            parent_id=data.parent_id,
            scq_question_title=data.scq_question_title,
            scq_question_description=data.scq_question_description,
            image_url=data.image_url,
            marks=data.marks,
            status=data.status,
            language_id=data.language_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        db.add(scq)
        db.flush()

        for option in data.options:
            db.add(
                ScqQuestionOption(
                    scq_id=scq.scq_id,
                    scq_option_text=option.scq_option_text,
                    is_scq_option_correct=option.is_scq_option_correct,
                    status=option.status,
                    language_id=option.language_id,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow(),
                )
            )

        db.commit()
        db.refresh(scq)

        scq.options = ScqRepository.get_options(
            db,
            scq.scq_id,
        )

        return scq

    @staticmethod
    def update(
        db: Session,
        scq: ScqMaster,
        data: ScqUpdate,
    ) -> ScqMaster:

        update_data = data.model_dump(
            exclude_unset=True,
            exclude={"options"},
        )

        for key, value in update_data.items():
            setattr(scq, key, value)

        scq.updated_at = datetime.utcnow()

        if data.options is not None:

            db.query(ScqQuestionOption).filter(
                ScqQuestionOption.scq_id == scq.scq_id
            ).delete()

            db.flush()

            for option in data.options:
                db.add(
                    ScqQuestionOption(
                        scq_id=scq.scq_id,
                        scq_option_text=option.scq_option_text,
                        is_scq_option_correct=option.is_scq_option_correct,
                        status=option.status,
                        language_id=option.language_id,
                        created_at=datetime.utcnow(),
                        updated_at=datetime.utcnow(),
                    )
                )

        db.commit()
        db.refresh(scq)

        scq.options = ScqRepository.get_options(
            db,
            scq.scq_id,
        )

        return scq

    @staticmethod
    def delete(
        db: Session,
        scq: ScqMaster,
    ):

        scq.deleted_at = datetime.utcnow()

        db.commit()



    @staticmethod
    def save_translation(
     db: Session,
     parent_id: int,
     data: ScqCreate,
) -> ScqMaster:

     scq = (
        db.query(ScqMaster)
        .filter(
            ScqMaster.parent_id == parent_id,
            ScqMaster.language_id == data.language_id,
            ScqMaster.deleted_at.is_(None),
        )
        .first()
    )

     if scq:
        scq.scq_question_title = data.scq_question_title
        scq.scq_question_description = data.scq_question_description
        scq.image_url = data.image_url
        scq.marks = data.marks
        scq.status = data.status
        scq.updated_at = datetime.utcnow()

        db.query(ScqQuestionOption).filter(
            ScqQuestionOption.scq_id == scq.scq_id
        ).delete()

     else:
        scq = ScqMaster(
            parent_id=parent_id,
            scq_question_title=data.scq_question_title,
            scq_question_description=data.scq_question_description,
            image_url=data.image_url,
            marks=data.marks,
            status=data.status,
            language_id=data.language_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        db.add(scq)
        db.flush()

     for option in data.options:
        db.add(
            ScqQuestionOption(
                scq_id=scq.scq_id,
                scq_option_text=option.scq_option_text,
                is_scq_option_correct=option.is_scq_option_correct,
                status=option.status,
                language_id=option.language_id,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
        )

     db.commit()
     db.refresh(scq)

     scq.options = ScqRepository.get_options(
        db,
        scq.scq_id,
    )

     return scq