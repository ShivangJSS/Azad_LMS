from datetime import datetime

from sqlalchemy.orm import Session

from app.modules.assessment.model import MatchCorrectAnswer
from app.modules.assessment.schema.match_correct_answer_schema import (
    MatchCorrectAnswerCreate,
    MatchCorrectAnswerUpdate,
)


class MatchCorrectAnswerRepository:

    @staticmethod
    def get_all(
        db: Session,
        match_making_id: int,
    ):
        return (
            db.query(MatchCorrectAnswer)
            .filter(
                MatchCorrectAnswer.match_making_id == match_making_id,
                MatchCorrectAnswer.deleted_at.is_(None),
            )
            .order_by(
                MatchCorrectAnswer.match_correct_answers_id.asc()
            )
            .all()
        )

    @staticmethod
    def get_by_id(
        db: Session,
        match_correct_answers_id: int,
    ):
        return (
            db.query(MatchCorrectAnswer)
            .filter(
                MatchCorrectAnswer.match_correct_answers_id
                == match_correct_answers_id,
                MatchCorrectAnswer.deleted_at.is_(None),
            )
            .first()
        )

    @staticmethod
    def create(
        db: Session,
        match_making_id: int,
        data: MatchCorrectAnswerCreate,
    ):
        answer = MatchCorrectAnswer(
            match_making_id=match_making_id,
            match_left_id=data.match_left_id,
            match_right_id=data.match_right_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        db.add(answer)
        db.commit()
        db.refresh(answer)

        return answer

    @staticmethod
    def update(
        db: Session,
        answer: MatchCorrectAnswer,
        data: MatchCorrectAnswerUpdate,
    ):
        update_data = data.model_dump(exclude_unset=True)

        for key, value in update_data.items():
            setattr(answer, key, value)

        answer.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(answer)

        return answer

    @staticmethod
    def delete(
        db: Session,
        answer: MatchCorrectAnswer,
    ):
        answer.deleted_at = datetime.utcnow()

        db.commit()