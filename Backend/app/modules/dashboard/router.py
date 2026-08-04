from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.modules.dashboard.schema import DashboardCentreDetail, DashboardDocumentDetail, DashboardLoginDetail, DashboardModuleDetail, DashboardParticipantDetail, DashboardResponse, MonthlyLoginTrendItem
from app.modules.dashboard.service import DashboardService
from app.shared.dependencies.module_access import Module, require_module_access

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
    dependencies=[Depends(require_module_access(Module.DASHBOARD))],
)


@router.get(
    "",
    response_model=DashboardResponse,
)
def get_dashboard(
    state_id: int | None = Query(None),
    district_id: int | None = Query(None),
    centre_id: int | None = Query(None),
    from_date: str | None = Query(None),
    to_date: str | None = Query(None),
    db: Session = Depends(get_db),
):

    return DashboardService.get_dashboard_summary(
        db=db,
        state_id=state_id,
        district_id=district_id,
        centre_id=centre_id,
        from_date=from_date,
        to_date=to_date,
    )


@router.get(
    "/state-wise-participants",
    response_model=list[DashboardParticipantDetail],
)
def get_state_wise_participants(
    clicked_value: int | None = None,
    state_id: int | None = None,
    district_id: int | None = None,
    centre_id: int | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    db: Session = Depends(get_db),
):
    return DashboardService.get_state_wise_participants(
        db=db,
        clicked_value=clicked_value,
        state_id=state_id,
        district_id=district_id,
        centre_id=centre_id,
        from_date=from_date,
        to_date=to_date,
    )

@router.get(
    "/district-wise-participants",
    response_model=list[DashboardParticipantDetail],
)
def get_district_wise_participants(
    clicked_value: str | None = None,
    state_id: int | None = None,
    district_id: int | None = None,
    centre_id: int | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    db: Session = Depends(get_db),
):
    return DashboardService.get_district_wise_participants(
        db=db,
        clicked_value=clicked_value,
        state_id=state_id,
        district_id=district_id,
        centre_id=centre_id,
        from_date=from_date,
        to_date=to_date,
    )


@router.get(
    "/gender-distribution",
    response_model=list[DashboardParticipantDetail],
)
def get_gender_distribution(
    clicked_value: str | None = None,
    state_id: int | None = None,
    district_id: int | None = None,
    centre_id: int | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    db: Session = Depends(get_db),
):
    return DashboardService.get_gender_distribution(
        db=db,
        clicked_value=clicked_value,
        state_id=state_id,
        district_id=district_id,
        centre_id=centre_id,
        from_date=from_date,
        to_date=to_date,
    )


@router.get(
    "/age-group-distribution",
    response_model=list[DashboardParticipantDetail],
)
def get_age_group_distribution(
    clicked_value: str | None = None,
    state_id: int | None = None,
    district_id: int | None = None,
    centre_id: int | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    db: Session = Depends(get_db),
):
    return DashboardService.get_age_group_distribution(
        db=db,
        clicked_value=clicked_value,
        state_id=state_id,
        district_id=district_id,
        centre_id=centre_id,
        from_date=from_date,
        to_date=to_date,
    )


@router.get(
    "/state-wise-centres",
    response_model=list[DashboardCentreDetail],
)
def get_state_wise_centres(
    clicked_value: str | None = None,
    state_id: int | None = None,
    district_id: int | None = None,
    centre_id: int | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    db: Session = Depends(get_db),
):
    return DashboardService.get_state_wise_centres(
        db=db,
        clicked_value=clicked_value,
        state_id=state_id,
        district_id=district_id,
        centre_id=centre_id,
        from_date=from_date,
        to_date=to_date,
    )


@router.get(
    "/module-wise-performance",
    response_model=list[DashboardModuleDetail],
)
def get_module_wise_performance(
    clicked_value: str | None = None,
    state_id: int | None = None,
    district_id: int | None = None,
    centre_id: int | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    db: Session = Depends(get_db),
):
    return DashboardService.get_module_wise_performance_details(
        db=db,
        clicked_value=clicked_value,
        state_id=state_id,
        district_id=district_id,
        centre_id=centre_id,
        from_date=from_date,
        to_date=to_date,
    )


@router.get(
    "/document-type-distribution",
    response_model=list[DashboardDocumentDetail],
)
def get_document_type_distribution(
    db: Session = Depends(get_db),
):
    return DashboardService.get_document_type_distribution(
        db=db,
    )


@router.get(
    "/monthly-logins",
    response_model=list[MonthlyLoginTrendItem],
)
def get_monthly_logins(
    clicked_value: str | None = None,
    state_id: int | None = None,
    district_id: int | None = None,
    centre_id: int | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    db: Session = Depends(get_db),
):
    return DashboardService.get_monthly_logins(
        db=db,
        clicked_value=clicked_value,
        state_id=state_id,
        district_id=district_id,
        centre_id=centre_id,
        from_date=from_date,
        to_date=to_date,
    )



@router.get(
    "/monthly-logins/details",
    response_model=list[DashboardLoginDetail],
)
def get_monthly_login_details(
    clicked_value: str,
    state_id: int | None = None,
    district_id: int | None = None,
    centre_id: int | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    db: Session = Depends(get_db),
):
    return DashboardService.get_monthly_login_details(
        db=db,
        clicked_value=clicked_value,
        state_id=state_id,
        district_id=district_id,
        centre_id=centre_id,
        from_date=from_date,
        to_date=to_date,
    )
