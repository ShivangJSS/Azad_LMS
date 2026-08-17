from typing import List, Optional

from fastapi import APIRouter, Depends, Query,status
from sqlalchemy.orm import Session
from app.modules.auth.dependencies import require_roles
from app.modules.auth.constants import UserRole
from app.database.database import get_db
from app.modules.centres.schema import BlockResponse, CentreCreateRequest, CentreDetailResponse, CentreListResponse, CentreResponse, CentreStatusUpdateRequest, CentreUpdateRequest, DistrictResponse, StateResponse
from app.modules.centres.service import CentreService





router = APIRouter(
    prefix="/centres",
    tags=["Centres"],
    dependencies=[
        Depends(require_roles(UserRole.SUPER_ADMIN)),
    ],
)


@router.get(
    "/states",
    response_model=List[StateResponse],
    summary="Get Active States",
)
def get_states(
    db: Session = Depends(get_db),
):
    """
    Returns all active states.
    """
    return CentreService.get_states(db)


@router.get(
    "/districts/{state_id}",
    response_model=List[DistrictResponse],
    summary="Get Districts by State",
)
def get_districts(
    state_id: int,
    db: Session = Depends(get_db),
):
    """
    Returns all active districts for the selected state.
    """
    return CentreService.get_districts(db, state_id)

@router.get(
    "/blocks/{district_id}",
    response_model=List[BlockResponse],
    summary="Get Blocks by District",
)
def get_blocks(
    district_id: int,
    db: Session = Depends(get_db),
):
    """
    Returns all active blocks for the selected district.
    """
    return CentreService.get_blocks(db, district_id)


@router.get(
    "",
    response_model=list[CentreListResponse],
)
def get_centres(
    state_id: Optional[int] = Query(None),
    district_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return CentreService.get_centres(
        db=db,
        state_id=state_id,
        district_id=district_id,
        search=search,
    )





@router.post(
    "",
    response_model=CentreResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_centre(
    centre: CentreCreateRequest,
    db: Session = Depends(get_db),
):
    return CentreService.create_centre(
        db=db,
        centre=centre,
    )


@router.get(
    "/{centre_id}",
    response_model=CentreDetailResponse,
)
def get_centre_by_id(
    centre_id: int,
    db: Session = Depends(get_db),
):
    return CentreService.get_centre_by_id(
        db=db,
        centre_id=centre_id,
    )

@router.put(
    "/{centre_id}",
    response_model=CentreResponse,
)
def update_centre(
    centre_id: int,
    centre: CentreUpdateRequest,
    db: Session = Depends(get_db),
):
    return CentreService.update_centre(
        db=db,
        centre_id=centre_id,
        data=centre,
    )



@router.patch(
    "/{centre_id}/status",
    response_model=CentreResponse,
)
def update_centre_status(
    centre_id: int,
    request: CentreStatusUpdateRequest,
    db: Session = Depends(get_db),
):
    return CentreService.update_centre_status(
        db=db,
        centre_id=centre_id,
        new_status=request.status,
    )


@router.delete(
    "/{centre_id}",
    status_code=status.HTTP_200_OK,
)
def delete_centre(
    centre_id: int,
    db: Session = Depends(get_db),
):

    return CentreService.delete_centre(
        db=db,
        centre_id=centre_id,
    )