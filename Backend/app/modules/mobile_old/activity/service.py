"""
Thin orchestration over ActivityRepository, kept apart from the routes so the
HTTP layer stays declarative like the rest of the mobile package.
"""

from sqlalchemy.orm import Session

from app.modules.mobile.activity.repository import ActivityRepository
from app.modules.mobile.activity.schema import (
    InsertResponse,
    ModuleTimeRequest,
    VideoAnswerResponse,
    VideoQuestionAnswerRequest,
)


class ActivityService:

    @staticmethod
    def log_time_spent(
        db: Session,
        participant_id: int,
        minutes: int,
    ) -> InsertResponse:
        new_id = ActivityRepository.add_time_spent(
            db=db,
            participant_id=participant_id,
            minutes=minutes,
        )
        return InsertResponse(id=new_id)

    @staticmethod
    def log_module_time(
        db: Session,
        user_id: int,
        request: ModuleTimeRequest,
    ) -> InsertResponse:
        new_id = ActivityRepository.add_module_time(
            db=db,
            user_id=user_id,
            module_id=request.module_id,
            topic_id=request.topic_id or 0,
            document_id=request.document_id or 0,
            time_taken=request.time_taken,
        )
        return InsertResponse(id=new_id)

    @staticmethod
    def submit_video_answers(
        db: Session,
        participant_id: int,
        request: VideoQuestionAnswerRequest,
    ) -> VideoAnswerResponse:
        total = ActivityRepository.add_video_answers(
            db=db,
            participant_id=participant_id,
            video_id=request.video_id,
            topic_id=request.topic_id,
            module_id=request.module_id,
            answers=[(a.question_id, a.option_id) for a in request.answers],
        )
        return VideoAnswerResponse(total_answers=total)

    @staticmethod
    def video_questions(
        db: Session,
        video_id: int,
        language_id: int,
    ):
        return ActivityRepository.video_questions(
            db=db,
            video_id=video_id,
            language_id=language_id,
        )
