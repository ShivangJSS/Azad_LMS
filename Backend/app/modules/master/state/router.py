from typing import Literal

from fastapi import (
    APIRouter,
    Depends,
    Query,
    status,
)
from sqlalchemy.orm import Session

from app.common.enums import UserRole
from app.database.session import get_db
from app.modules.auth.dependencies import (
    get_current_user,
    require_roles,
)

from .controller import (
    create_state_controller,
    delete_state_controller,
    get_state_controller,
    get_states_controller,
    update_state_controller,
)

from .schema import (
    DeleteStateResponse,
    StateCreateRequest,
    StateListResponse,
    StateResponse,
    StateUpdateRequest,
)

from app.modules.auth.model import User
from app.shared.dependencies.module_access import Module, require_module_access


router = APIRouter(
    prefix="/states",
    tags=["State Masters"],
    dependencies=[Depends(require_module_access(Module.MASTER))],
)


@router.get(
    "",
    response_model=StateListResponse,
)
def get_states(
    state_name: str | None = Query(
        None,
        max_length=255,
    ),
    status_filter: Literal["0", "1"] | None = Query(
        None,
        alias="status",
    ),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_states_controller(
        db=db,
        state_name=state_name,
        status=status_filter,
        page=page,
        per_page=per_page,
        current_user=current_user,
    )


@router.post(
    "",
    response_model=StateResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_state(
    request: StateCreateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
        )
    ),
):
    return create_state_controller(
        db=db,
        request=request,
        current_user=current_user,
    )


@router.get(
    "/{state_lgd_code}",
    response_model=StateResponse,
)
def get_state(
    state_lgd_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_state_controller(
        db=db,
        state_lgd_code=state_lgd_code,
        current_user=current_user,
    )


@router.put(
    "/{state_lgd_code}",
    response_model=StateResponse,
)
def update_state(
    state_lgd_code: str,
    request: StateUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
        )
    ),
):
    return update_state_controller(
        db=db,
        state_lgd_code=state_lgd_code,
        request=request,
        current_user=current_user,
    )


@router.delete(
    "/{state_lgd_code}",
    response_model=DeleteStateResponse,
)
def delete_state(
    state_lgd_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(UserRole.SUPER_ADMIN)
    ),
):
    return delete_state_controller(
        db=db,
        state_lgd_code=state_lgd_code,
        current_user=current_user,
    )
