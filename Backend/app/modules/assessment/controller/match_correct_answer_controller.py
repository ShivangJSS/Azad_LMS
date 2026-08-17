from fastapi import Depends
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.modules.assessment.schema.match_correct_answer_schema import (
    MatchCorrectAnswerCreate,
    MatchCorrectAnswerUpdate,
    MatchCorrectAnswerResponse,
)

from app.modules.assessment.service.match_correct_answer_service import (
    MatchCorrectAnswerService,
)


class MatchCorrectAnswerController:

    @staticmethod
    def get_all(
        match_making_id: int,
        db: Session = Depends(get_db),
    ):
        return MatchCorrectAnswerService.get_all(
            db=db,
            match_making_id=match_making_id,
        )

    @staticmethod
    def get_by_id(
        match_correct_answers_id: int,
        db: Session = Depends(get_db),
    ) -> MatchCorrectAnswerResponse:
        return MatchCorrectAnswerService.get_by_id(
            db=db,
            match_correct_answers_id=match_correct_answers_id,
        )

    @staticmethod
    def create(
        match_making_id: int,
        payload: MatchCorrectAnswerCreate,
        db: Session = Depends(get_db),
    ) -> MatchCorrectAnswerResponse:
        return MatchCorrectAnswerService.create(
            db=db,
            match_making_id=match_making_id,
            data=payload,
        )

    @staticmethod
    def update(
        match_correct_answers_id: int,
        payload: MatchCorrectAnswerUpdate,
        db: Session = Depends(get_db),
    ) -> MatchCorrectAnswerResponse:
        return MatchCorrectAnswerService.update(
            db=db,
            match_correct_answers_id=match_correct_answers_id,
            data=payload,
        )

    @staticmethod
    def delete(
        match_correct_answers_id: int,
        db: Session = Depends(get_db),
    ):
        return MatchCorrectAnswerService.delete(
            db=db,
            match_correct_answers_id=match_correct_answers_id,
        )