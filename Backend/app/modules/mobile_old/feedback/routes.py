from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.modules.mobile.core.dependencies import get_current_participant

from .form import get_feedback_form as get_form_by_language
from .schema import (
    FeedbackCreate,
    FeedbackFormField,
    FeedbackResponse,
    MoodQuestionResponse,
)
from .service import FeedbackService

router = APIRouter(
    prefix="/mobile/feedback",
    tags=["Mobile Feedback"],
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
    language_id: int = Query(
        default=1,
        ge=1,
        description=(
            "language_master.language_id "
            "(1 = English, 2 = Hindi, 3 = Bangla, 4 = Tamil)"
        ),
    ),
    participant=Depends(get_current_participant),
):
    """
    Returns the full 10-question feedback form
    in the selected language.
    """
    return get_form_by_language(language_id=language_id)


@router.get(
    "/questions",
    response_model=list[MoodQuestionResponse],
)
def get_feedback_questions(
    language_id: int = Query(
        default=1,
        ge=1,
        description=(
            "language_master.language_id "
            "(1 = English, 2 = Hindi, 3 = Bangla, 4 = Tamil)"
        ),
    ),
    participant=Depends(get_current_participant),
    db: Session = Depends(get_db),
):
    """
    Returns the mood questions shown after login
    in the selected language.
    """
    return FeedbackService.get_questions(
        db=db,
        language_id=language_id,
    )
