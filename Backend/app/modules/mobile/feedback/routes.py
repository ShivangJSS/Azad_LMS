from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.modules.mobile.core.dependencies import get_current_participant

from .form import FEEDBACK_FORM
from .schema import (
    FeedbackCreate,
    FeedbackFormField,
    FeedbackResponse,
    MoodQuestionResponse
)
from .service import FeedbackService


router = APIRouter(
    prefix="/mobile/feedback",
    tags=["Mobile Feedback"]
)


@router.post(
    "/submit",
    response_model=FeedbackResponse,
)
def submit_feedback(
    payload: FeedbackCreate,
    participant=Depends(get_current_participant),
    db: Session = Depends(get_db),
):
    return FeedbackService.save_feedback(
        db=db,
        participant_id=participant.participant_id,
        payload=payload,
    )


@router.get(
    "/form",
    response_model=list[FeedbackFormField],
)
def get_feedback_form(
    participant=Depends(get_current_participant),
):
    """
    The full trainee questionnaire, beyond the two mood questions asked
    straight after sign-in.
    """
    return FEEDBACK_FORM


@router.get(
    "/questions",
    response_model=list[MoodQuestionResponse]
)
def get_feedback_questions(
    language_id: int = Query(
        default=1,
        ge=1,
        description="language_master.language_id (1 = English)",
    ),
    participant=Depends(get_current_participant),
    db: Session = Depends(get_db),
):
    return FeedbackService.get_questions(
        db=db,
        language_id=language_id
    )
