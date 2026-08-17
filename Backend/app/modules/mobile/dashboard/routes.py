from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.modules.mobile.core.dependencies import get_current_participant
from app.modules.mobile.dashboard.schema import (
    DashboardStatsResponse,
    DidYouKnowItem,
)
from app.modules.mobile.dashboard.service import DashboardService

router = APIRouter(
    prefix="/mobile/dashboard",
    tags=["Mobile Dashboard"],
)


@router.get(
    "/stats",
    response_model=DashboardStatsResponse,
)
def get_dashboard_stats(
    participant=Depends(get_current_participant),
    db: Session = Depends(get_db),
):
    return DashboardService.get_stats(
        db=db,
        participant_id=participant.participant_id,
    )


@router.get(
    "/tips",
    response_model=list[DidYouKnowItem],
)
def get_dashboard_tips(
    language_id: int = Query(
        default=1,
        ge=1,
        description="language_master.language_id (1 = English)",
    ),
    participant=Depends(get_current_participant),
    db: Session = Depends(get_db),
):
    """
    "Did You Know" safety tips shown on the dashboard.
    """
    return DashboardService.get_tips(
        db=db,
        language_id=language_id,
    )
