from sqlalchemy.orm import Session

from .schema import (
    StateCreateRequest,
    StateUpdateRequest,
)
from .service import (
    create_state_service,
    delete_state_service,
    get_state_service,
    get_states_service,
    update_state_service,
)
from app.modules.auth.model import User


def create_state_controller(
    db: Session, request: StateCreateRequest, current_user: User
):
    return create_state_service(db=db, request=request, current_user=current_user)


def get_states_controller(
    db: Session,
    state_name: str | None,
    status: str | None,
    page: int,
    per_page: int,
    current_user: User,
):
    return get_states_service(
        db=db,
        state_name=state_name,
        status=status,
        page=page,
        per_page=per_page,
        current_user=current_user,
    )


def get_state_controller(
    db: Session,
    state_lgd_code: str,
    current_user: User,
):
    return get_state_service(
        db=db,
        state_lgd_code=state_lgd_code,
        current_user=current_user,
    )


def update_state_controller(
    db: Session,
    state_lgd_code: str,
    request: StateUpdateRequest,
    current_user: User,
):
    return update_state_service(
        db=db,
        state_lgd_code=state_lgd_code,
        request=request,
        current_user=current_user,
    )


def delete_state_controller(
    db: Session,
    state_lgd_code: str,
    current_user: User,
):
    return delete_state_service(
        db=db,
        state_lgd_code=state_lgd_code,
        current_user=current_user,
    )
