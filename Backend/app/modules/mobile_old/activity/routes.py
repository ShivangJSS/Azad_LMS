from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.modules.mobile.activity.schema import (
    InsertResponse,
    ModuleTimeRequest,
    TimeSpentRequest,
    VideoAnswerResponse,
    VideoQuestionAnswerRequest,
    VideoQuestionItem,
)
from app.modules.mobile.activity.service import ActivityService
from app.modules.mobile.core.dependencies import get_current_participant
from app.modules.mobile.module.constants import DEFAULT_LANGUAGE_ID

# Mounted onto the module router, so the paths are /mobile/module/activity/...
# and main.py needs no change.
router = APIRouter(
    prefix="/activity",
    tags=["Mobile Activity"],
)


@router.post(
    "/time-spent",
    response_model=InsertResponse,
    status_code=status.HTTP_201_CREATED,
)
def log_time_spent(
    request: TimeSpentRequest,
    participant=Depends(get_current_participant),
    db: Session = Depends(get_db),
):
    """Whole-session time, in minutes → participant_time_spent_log."""
    return ActivityService.log_time_spent(
        db=db,
        participant_id=participant.participant_id,
        minutes=request.time_spent_in_minutes,
    )


@router.post(
    "/module-time",
    response_model=InsertResponse,
    status_code=status.HTTP_201_CREATED,
)
def log_module_time(
    request: ModuleTimeRequest,
    participant=Depends(get_current_participant),
    db: Session = Depends(get_db),
):
    """Seconds spent on a module/topic/document → time_spent_module_log."""
    return ActivityService.log_module_time(
        db=db,
        user_id=participant.participant_id,
        request=request,
    )


@router.get(
    "/video-questions/{video_id}",
    response_model=list[VideoQuestionItem],
)
def get_video_questions(
    video_id: int,
    language_id: int = Query(default=DEFAULT_LANGUAGE_ID, ge=1),
    participant=Depends(get_current_participant),
    db: Session = Depends(get_db),
):
    """The post-video questions for a video, in the requested language."""
    return ActivityService.video_questions(
        db=db,
        video_id=video_id,
        language_id=language_id,
    )


@router.post(
    "/video-question",
    response_model=VideoAnswerResponse,
)
def submit_video_answers(
    request: VideoQuestionAnswerRequest,
    participant=Depends(get_current_participant),
    db: Session = Depends(get_db),
):
    """Store a participant's post-video answers → post_video_question_score."""
    return ActivityService.submit_video_answers(
        db=db,
        participant_id=participant.participant_id,
        request=request,
    )
