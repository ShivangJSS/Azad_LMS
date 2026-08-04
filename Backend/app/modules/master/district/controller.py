from sqlalchemy.orm import Session

from app.modules.auth.model import User

from .schema import (
    DeleteDistrictResponse,
    DistrictCreateRequest,
    DistrictListResponse,
    DistrictResponse,
    DistrictUpdateRequest,
)
from .service import (
    create_district_service,
    delete_district_service,
    get_district_service,
    get_districts_service,
    update_district_service,
)


def create_district_controller(
    db: Session,
    request: DistrictCreateRequest,
    current_user: User,
) -> DistrictResponse:

    return create_district_service(
        db=db,
        request=request,
        current_user=current_user,
    )


def get_districts_controller(
    db: Session,
    state_lgd_code: int | None,
    district_name: str | None,
    district_status: str | None,
    page: int,
    per_page: int,
    current_user: User,
) -> DistrictListResponse:

    return get_districts_service(
        db=db,
        state_lgd_code=state_lgd_code,
        district_name=district_name,
        district_status=district_status,
        page=page,
        per_page=per_page,
        current_user=current_user,
    )


def get_district_controller(
    db: Session,
    district_lgd_code: int,
    current_user: User,
) -> DistrictResponse:

    return get_district_service(
        db=db,
        district_lgd_code=district_lgd_code,
        current_user=current_user,
    )


def update_district_controller(
    db: Session,
    district_lgd_code: int,
    request: DistrictUpdateRequest,
    current_user: User,
) -> DistrictResponse:

    return update_district_service(
        db=db,
        district_lgd_code=district_lgd_code,
        request=request,
        current_user=current_user,
    )


def delete_district_controller(
    db: Session,
    district_lgd_code: int,
    current_user: User,
) -> DeleteDistrictResponse:

    return delete_district_service(
        db=db,
        district_lgd_code=district_lgd_code,
        current_user=current_user,
    )