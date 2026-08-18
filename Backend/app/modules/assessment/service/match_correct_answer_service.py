from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.modules.assessment.repository.match_correct_answer_repository import (
    MatchCorrectAnswerRepository,
)
from app.modules.assessment.schema.match_correct_answer_schema import (
    MatchCorrectAnswerCreate,
    MatchCorrectAnswerUpdate,
)


class MatchCorrectAnswerService:

    @staticmethod
    def get_all(
        db: Session,
        match_making_id: int,
    ):
        return MatchCorrectAnswerRepository.get_all(
            db=db,
            match_making_id=match_making_id,
        )

    @staticmethod
    def get_by_id(
        db: Session,
        match_correct_answers_id: int,
    ):
        answer = MatchCorrectAnswerRepository.get_by_id(
            db=db,
            match_correct_answers_id=match_correct_answers_id,
        )

        if not answer:
            raise HTTPException(
                status_code=404,
                detail="Correct Answer not found.",
            )

        return answer

    @staticmethod
    def create(
        db: Session,
        match_making_id: int,
        data: MatchCorrectAnswerCreate,
    ):
        return MatchCorrectAnswerRepository.create(
            db=db,
            match_making_id=match_making_id,
            data=data,
        )

    @staticmethod
    def update(
        db: Session,
        match_correct_answers_id: int,
        data: MatchCorrectAnswerUpdate,
    ):
        answer = MatchCorrectAnswerRepository.get_by_id(
            db=db,
            match_correct_answers_id=match_correct_answers_id,
        )

        if not answer:
            raise HTTPException(
                status_code=404,
                detail="Correct Answer not found.",
            )

        return MatchCorrectAnswerRepository.update(
            db=db,
            answer=answer,
            data=data,
        )

    @staticmethod
    def delete(
        db: Session,
        match_correct_answers_id: int,
    ):
        answer = MatchCorrectAnswerRepository.get_by_id(
            db=db,
            match_correct_answers_id=match_correct_answers_id,
        )

        if not answer:
            raise HTTPException(
                status_code=404,
                detail="Correct Answer not found.",
            )

        MatchCorrectAnswerRepository.delete(
            db=db,
            answer=answer,
        )

        return {
            "message": "Correct Answer deleted successfully."
        }