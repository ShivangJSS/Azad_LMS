import json
from datetime import date, datetime

from sqlalchemy.orm import Session, joinedload

from app.modules.mobile.feedback.form import TEXT_FIELDS
from app.modules.mobile.feedback.model import (
    MoodQuestionMaster,
    ParticipantFeedback,
    ParticipantMoodAnswer,
)

from .schema import FeedbackCreate


class FeedbackRepository:

    @staticmethod
    def create_feedback(
        db: Session,
        participant_id: int,
        payload: FeedbackCreate,
    ):
        now = datetime.now()

        feedback = ParticipantFeedback(
            participant_id=participant_id,
            lms_experience=payload.lms_experience,
            lms_ease=payload.lms_ease,
            useful_modules=json.dumps(
                payload.useful_modules
            ),
            created_at=now,
            updated_at=now,
        )

        # Full questionnaire. Only known columns are written, and lists are
        # stored as JSON the same way useful_modules already is.
        for field, value in payload.form_answers.items():
            if field not in TEXT_FIELDS:
                continue

            setattr(
                feedback,
                field,
                json.dumps(value) if isinstance(value, list) else value,
            )

        db.add(feedback)
        db.flush()

        # Save mood question answers
        for mood_answer in payload.mood_answers:

            for option_id in mood_answer.selected_options:

                answer = ParticipantMoodAnswer(
                    participant_id=participant_id,
                    question_id=mood_answer.question_id,
                    selected_option_id=option_id,
                    answer_time=date.today(),
                )

                db.add(answer)

        db.commit()
        db.refresh(feedback)

        return feedback

    @staticmethod
    def get_questions_by_language(
        db: Session,
        language_id: int
    ):
        return (
            db.query(MoodQuestionMaster)
            .options(
                joinedload(
                    MoodQuestionMaster.options
                )
            )
            .filter(
                MoodQuestionMaster.language_id == language_id,
                MoodQuestionMaster.is_active == 1
            )
            .order_by(
                MoodQuestionMaster.question_id
            )
            .all()
        )

    @staticmethod
    def get_valid_option_ids(
        db: Session,
        question_ids: list[int],
    ) -> dict[int, set[int]]:
        """
        Option ids that genuinely belong to each question, so a submission
        cannot attach an option to the wrong question.
        """

        if not question_ids:
            return {}

        questions = (
            db.query(MoodQuestionMaster)
            .options(joinedload(MoodQuestionMaster.options))
            .filter(MoodQuestionMaster.question_id.in_(question_ids))
            .all()
        )

        return {
            question.question_id: {
                option.option_id for option in question.options
            }
            for question in questions
        }
