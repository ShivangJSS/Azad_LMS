from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.model import User
from app.shared.dependencies.module_access import Module, require_module_access

from .schema import (
    ReferenceCentreResponse,
    ReferenceDistrictResponse,
    ReferenceStateResponse,
)
from .service import ReferenceDataService

router = APIRouter(
    prefix="/reference",
    tags=["Reference Data"],
    dependencies=[Depends(require_module_access(Module.REFERENCE_DATA))],
)


@router.get("/states", response_model=list[ReferenceStateResponse])
def get_states(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ReferenceDataService.states(db, current_user)


@router.get("/districts", response_model=list[ReferenceDistrictResponse])
def get_districts(
    state_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ReferenceDataService.districts(db, current_user, state_id)


@router.get("/centres", response_model=list[ReferenceCentreResponse])
def get_centres(
    state_id: int | None = Query(default=None, gt=0),
    district_id: int | None = Query(default=None, gt=0),
    search: str | None = Query(default=None, min_length=1, max_length=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return ReferenceDataService.centres(
        db=db,
        current_user=current_user,
        state_id=state_id,
        district_id=district_id,
        search=search,
    )
