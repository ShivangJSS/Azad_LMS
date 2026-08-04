from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.common.enums import UserRole
from app.database.session import get_db
from app.modules.auth.dependencies import (
    get_current_user,
    require_roles,
)
from app.modules.auth.model import User
from app.shared.dependencies.module_access import Module, require_module_access

from .service import (
    create_new_user,
    delete_user_service,
    get_all_users_service,
    get_user_by_id_service,
    update_user_service,
)

from .schema import (
    CreateUserRequest,
    DeleteUserResponse,
    UpdateUserRequest,
    UserBaseResponse,
)


router = APIRouter(
    prefix="/users",
    tags=["Users"],
    dependencies=[Depends(require_module_access(Module.CREATE_USER))],
)


# ==========================================================
# Create User
# Super Admin -> Admin
# Admin -> State Head / District Head / PI
# ==========================================================

@router.post(
    "",
    response_model=UserBaseResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    request: CreateUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
        )
    ),
):
    return create_new_user(
        db=db,
        request=request,
        current_user=current_user,
    )


# ==========================================================
# Get All Users
# Filtering/visibility handled by service/repository
# ==========================================================

@router.get(
    "",
    response_model=list[UserBaseResponse],
    status_code=status.HTTP_200_OK,
)
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_all_users_service(
        db=db,
        current_user=current_user,
    )


# ==========================================================
# Get User By ID
# Permission handled by service
# ==========================================================

@router.get(
    "/{user_id}",
    response_model=UserBaseResponse,
    status_code=status.HTTP_200_OK,
)
def get_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_user_by_id_service(
        db=db,
        user_id=user_id,
        current_user=current_user,
    )


# ==========================================================
# Update User
# Super Admin -> Admin
# Admin -> State Head / District Head / PI
# ==========================================================

@router.put(
    "/{user_id}",
    response_model=UserBaseResponse,
    status_code=status.HTTP_200_OK,
)
def update_user(
    user_id: int,
    request: UpdateUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
        )
    ),
):
    return update_user_service(
        db=db,
        user_id=user_id,
        request=request,
        current_user=current_user,
    )


# ==========================================================
# Delete User
# Super Admin -> Admin
# Admin -> State Head / District Head / PI
# ==========================================================

@router.delete(
    "/{user_id}",
    response_model=DeleteUserResponse,
    status_code=status.HTTP_200_OK,
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_roles(
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
        )
    ),
):
    return delete_user_service(
        db=db,
        user_id=user_id,
        current_user=current_user,
    )
