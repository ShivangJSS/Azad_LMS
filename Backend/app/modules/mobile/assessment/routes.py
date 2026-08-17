from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.modules.mobile.assessment.schema import (
    ModuleAssessmentResponse,
    SubmitAssessmentRequest,
    SubmitAssessmentResponse,
)
from app.modules.mobile.assessment.service import AssessmentService
from app.modules.mobile.core.dependencies import get_current_participant
from app.modules.mobile.module.constants import DEFAULT_LANGUAGE_ID

# Mounted onto the module router, so the paths are
# /mobile/module/assessment/... and no change to main.py is needed.
router = APIRouter(
    prefix="/assessment",
    tags=["Mobile Assessment"],
)


@router.get(
    "/{module_id}",
    response_model=ModuleAssessmentResponse,
)
def get_module_assessment(
    module_id: int,
    language_id: int = Query(default=DEFAULT_LANGUAGE_ID, ge=1),
    participant=Depends(get_current_participant),
    db: Session = Depends(get_db),
):
    """
    Every post-session question for the module: MCQ, SCQ, drop bucket and
    match making, in one ordered list.
    """
    return AssessmentService.get_assessment(
        db=db,
        module_id=module_id,
        language_id=language_id,
    )


@router.post(
    "/{module_id}/submit",
    response_model=SubmitAssessmentResponse,
)
def submit_module_assessment(
    module_id: int,
    request: SubmitAssessmentRequest,
    language_id: int = Query(default=DEFAULT_LANGUAGE_ID, ge=1),
    participant=Depends(get_current_participant),
    db: Session = Depends(get_db),
):
    return AssessmentService.submit(
        db=db,
        participant_id=participant.participant_id,
        module_id=module_id,
        language_id=language_id,
        request=request,
    )
