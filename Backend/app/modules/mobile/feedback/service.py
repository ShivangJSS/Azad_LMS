from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from .repository import FeedbackRepository
from .schema import (
    FeedbackCreate,
    FeedbackResponse
)


class FeedbackService:

    @staticmethod
    def save_feedback(
        db: Session,
        participant_id: int,
        payload: FeedbackCreate,
    ) -> FeedbackResponse:

        FeedbackService._validate_mood_answers(
            db=db,
            payload=payload,
        )

        feedback = FeedbackRepository.create_feedback(
            db=db,
            participant_id=participant_id,
            payload=payload,            
        )

        return FeedbackResponse(
            feedback_id=feedback.feedback_id,
            message="Feedback submitted successfully"
        )

    @staticmethod
    def _validate_mood_answers(
        db: Session,
        payload: FeedbackCreate,
    ) -> None:
        """
        Nothing in the database enforces these references, so the option has
        to be checked against its question here.
        """

        if not payload.mood_answers:
            return

        valid = FeedbackRepository.get_valid_option_ids(
            db=db,
            question_ids=[
                answer.question_id for answer in payload.mood_answers
            ],
        )

        for answer in payload.mood_answers:

            allowed = valid.get(answer.question_id)

            if allowed is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Unknown question_id {answer.question_id}.",
                )

            unknown = set(answer.selected_options) - allowed

            if unknown:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Options {sorted(unknown)} do not belong to "
                        f"question {answer.question_id}."
                    ),
                )

    @staticmethod
    def get_questions(
        db: Session,
        language_id: int
    ):
        questions = FeedbackRepository.get_questions_by_language(
            db=db,
            language_id=language_id
        )

        return questions
