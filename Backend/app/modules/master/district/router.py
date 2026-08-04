from typing import Literal

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.common.enums import UserRole
from app.database.session import get_db
from app.modules.auth.dependencies import (
    get_current_user,
    require_roles,
)
from app.modules.auth.model import User
from app.shared.dependencies.module_access import Module, require_module_access

from .controller import (
    create_district_controller,
    delete_district_controller,
    get_district_controller,
    get_districts_controller,
    update_district_controller,
)
from .schema import (
    DeleteDistrictResponse,
    DistrictCreateRequest,
    DistrictListResponse,
    DistrictResponse,
    DistrictUpdateRequest,
)

router = APIRouter(
    prefix="/districts",
    tags=["District Masters"],
    dependencies=[Depends(require_module_access(Module.MASTER))],
)


# ==========================================================
# Get District List
# ==========================================================


@router.get(
    "",
    response_model=DistrictListResponse,
    status_code=status.HTTP_200_OK,
)
def get_districts(
    state_lgd_code: int | None = Query(
        default=None,
        gt=0,
    ),
    district_name: str | None = Query(
        default=None,
        max_length=100,
    ),
    status_filter: Literal["0", "1"] | None = Query(
        default=None,
        alias="status",
    ),
    page: int = Query(
        default=1,
        ge=1,
    ),
    per_page: int = Query(
        default=10,
        ge=1,
        le=100,
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_districts_controller(
        db=db,
        state_lgd_code=state_lgd_code,
        district_name=district_name,
        district_status=status_filter,
        page=page,
        per_page=per_page,
        current_user=current_user,
    )


# ==========================================================
# Create District
# ==========================================================


@router.post(
    "",
    response_model=DistrictResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_district(
    request: DistrictCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
        )
    ),
):
    return create_district_controller(
        db=db,
        request=request,
        current_user=current_user,
    )


# ==========================================================
# Get District By LGD Code
# ==========================================================


@router.get(
    "/{district_lgd_code}",
    response_model=DistrictResponse,
    status_code=status.HTTP_200_OK,
)
def get_district(
    district_lgd_code: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_district_controller(
        db=db,
        district_lgd_code=district_lgd_code,
        current_user=current_user,
    )


# ==========================================================
# Update District
# ==========================================================


@router.put(
    "/{district_lgd_code}",
    response_model=DistrictResponse,
    status_code=status.HTTP_200_OK,
)
def update_district(
    district_lgd_code: int,
    request: DistrictUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
        )
    ),
):
    return update_district_controller(
        db=db,
        district_lgd_code=district_lgd_code,
        request=request,
        current_user=current_user,
    )


# ==========================================================
# Delete District
# ==========================================================


@router.delete(
    "/{district_lgd_code}",
    response_model=DeleteDistrictResponse,
    status_code=status.HTTP_200_OK,
)
def delete_district(
    district_lgd_code: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.SUPER_ADMIN,
        )
    ),
):
    return delete_district_controller(
        db=db,
        district_lgd_code=district_lgd_code,
        current_user=current_user,
    )
