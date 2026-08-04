from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.common.enums import Status, UserRole
from app.modules.auth.model import User
from app.modules.auth.security import hash_password
from app.modules.audit_log.service import create_audit_log

from . import repository as user_repository
from .exceptions import (
    EmailAlreadyExistsError,
    UserNotFoundError,
)
from .schema import (
    CreateUserRequest,
    UpdateUserRequest,
    UserBaseResponse,
    DeleteUserResponse,
)


# ==========================================================
# Helper Methods
# ==========================================================


def _get_responsibility_for_role(
    role: UserRole,
) -> str | None:
    """
    Return responsibility name based on role.
    """

    responsibility_map = {
        UserRole.SUPER_ADMIN: "Super Admin",
        UserRole.ADMIN: "Admin",
        UserRole.STATE_HEAD: "State Head",
        UserRole.DISTRICT_HEAD: "District Head",
        UserRole.PI: "PI",
    }

    return responsibility_map.get(role)


# ==========================================================
# Map User ORM -> Response Schema
# ==========================================================


def _map_user_to_response_schema(
    user: User,
) -> UserBaseResponse:
    """
    Convert User ORM object to Pydantic response schema.
    """

    return UserBaseResponse.model_validate(user)


# ==========================================================
# Get Current Logged-in User Role
# ==========================================================


def _get_current_user_role(
    current_user: User,
) -> UserRole:
    """
    Convert database role value to UserRole enum.
    """

    try:
        return UserRole(int(current_user.role))

    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid logged-in user role.",
        )


# ==========================================================
# Get Target User Role
# ==========================================================


def _get_user_role(
    user: User,
) -> UserRole:
    """
    Convert target user's database role value
    to UserRole enum.
    """

    try:
        return UserRole(int(user.role))

    except (ValueError, TypeError):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user role.",
        )


# ==========================================================
# Allowed Role Hierarchy
# ==========================================================


def _get_allowed_roles(
    current_role: UserRole,
) -> set[UserRole]:
    """
    Role hierarchy:

    Super Admin -> Admin

    Admin ->
        State Head
        District Head
        PI
    """

    if current_role == UserRole.SUPER_ADMIN:
        return {
            UserRole.ADMIN,
        }

    if current_role == UserRole.ADMIN:
        return {
            UserRole.STATE_HEAD,
            UserRole.DISTRICT_HEAD,
            UserRole.PI,
        }

    return set()


# ==========================================================
# Check Create Permission
# ==========================================================


def _check_create_permission(
    current_user: User,
    requested_role: UserRole,
) -> None:
    """
    Check whether logged-in user can create
    requested user role.
    """

    current_role = _get_current_user_role(
        current_user
    )

    allowed_roles = _get_allowed_roles(
        current_role
    )

    if not allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to create users.",
        )

    if requested_role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to create a user with this role.",
        )


# ==========================================================
# Check Manage Permission
# ==========================================================


def _check_manage_permission(
    current_user: User,
    target_user: User,
) -> None:
    """
    Check whether logged-in user can update/delete
    target user.

    Super Admin -> Admin
    Admin -> State Head / District Head / PI
    """

    current_role = _get_current_user_role(
        current_user
    )



    target_role = _get_user_role(
        target_user
    )

    allowed_roles = _get_allowed_roles(
        current_role
    )

    if target_role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to manage this user.",
        )


# ==========================================================
# Create User
# ==========================================================


def create_new_user(
    db: Session,
    request: CreateUserRequest,
    current_user: User,
) -> UserBaseResponse:
    """
    Create new user.

    Super Admin -> Admin
    Admin -> State Head / District Head / PI
    """

    # ------------------------------------------------------
    # Check permission
    # ------------------------------------------------------

    _check_create_permission(
        current_user=current_user,
        requested_role=request.role,
    )

    # ------------------------------------------------------
    # Check duplicate email
    # ------------------------------------------------------

    existing_user = user_repository.get_user_by_email(
        db=db,
        email=request.email,
    )

    if existing_user:
        raise EmailAlreadyExistsError()

    # ------------------------------------------------------
    # Hash Password
    # ------------------------------------------------------

    hashed_password = hash_password(
        request.password
    )

    # ------------------------------------------------------
    # Create User
    # ------------------------------------------------------

    user = User(
        name=request.name,
        email=request.email,
        password=hashed_password,
        role=request.role.value,
        responsibility=_get_responsibility_for_role(
            request.role
        ),
        status=Status.ACTIVE.value,
    )

    # ------------------------------------------------------
    # Save User
    # ------------------------------------------------------

    saved_user = user_repository.create_user(
        db=db,
        user=user,
    )

    # ------------------------------------------------------
    # Audit Log
    # ------------------------------------------------------

    create_audit_log(
        db=db,
        user=current_user,
        action="CREATE",
        entity="User",
        entity_id=str(saved_user.id),
        details=(
            f"New user created with data: "
            f"{request.model_dump()}"
        ),
    )

    db.commit()

    return _map_user_to_response_schema(
        saved_user
    )


# ==========================================================
# Get All Users
# ==========================================================


def get_all_users_service(
    db: Session,
    current_user: User,
) -> list[UserBaseResponse]:
    """
    Get users based on logged-in user's role.

    Repository handles role filtering.
    """

    users = user_repository.get_all_users(
        db=db,
        current_user=current_user,
    )

    return [
        _map_user_to_response_schema(user)
        for user in users
    ]


# ==========================================================
# Get User By ID
# ==========================================================


def get_user_by_id_service(
    db: Session,
    user_id: int,
    current_user: User,
) -> UserBaseResponse:
    """
    Get user by ID.
    """

    # ------------------------------------------------------
    # Find User
    # ------------------------------------------------------

    user = user_repository.get_user_by_id(
        db=db,
        user_id=user_id,
    )

    if not user:
        raise UserNotFoundError()

    # ------------------------------------------------------
    # User can always view own account
    # ------------------------------------------------------

    if current_user.id == user_id:
        return _map_user_to_response_schema(
            user
        )

    # ------------------------------------------------------
    # Get Roles
    # ------------------------------------------------------

    current_role = _get_current_user_role(
        current_user
    )

    target_role = _get_user_role(
        user
    )

    allowed_roles = _get_allowed_roles(
        current_role
    )

    # ------------------------------------------------------
    # Check Permission
    # ------------------------------------------------------

    if target_role not in allowed_roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this user.",
        )

    return _map_user_to_response_schema(
        user
    )


# ==========================================================
# Update User
# ==========================================================


def update_user_service(
    db: Session,
    user_id: int,
    request: UpdateUserRequest,
    current_user: User,
) -> UserBaseResponse:
    """
    Update user based on role hierarchy.
    """

    # ------------------------------------------------------
    # Find User
    # ------------------------------------------------------

    user = user_repository.get_user_by_id(
        db=db,
        user_id=user_id,
    )

    if not user:
        raise UserNotFoundError()

    # ------------------------------------------------------
    # Check Manage Permission
    # ------------------------------------------------------

    _check_manage_permission(
        current_user=current_user,
        target_user=user,
    )

    # ------------------------------------------------------
    # Store Old Data
    # ------------------------------------------------------

    old_user_data = {
        column.name: getattr(
            user,
            column.name,
        )
        for column in user.__table__.columns
        if column.name != "password"
    }

    # ------------------------------------------------------
    # Get Update Data
    # ------------------------------------------------------

    update_data = request.model_dump(
        exclude_unset=True
    )

    # ------------------------------------------------------
    # Email Validation
    # ------------------------------------------------------

    if (
        "email" in update_data
        and update_data["email"] is not None
    ):

        existing_user = (
            user_repository.get_user_by_email(
                db=db,
                email=update_data["email"],
            )
        )

        if (
            existing_user is not None
            and existing_user.id != user_id
        ):
            raise EmailAlreadyExistsError()

    # ------------------------------------------------------
    # Role Change Validation
    # ------------------------------------------------------

    if (
        "role" in update_data
        and update_data["role"] is not None
    ):

        requested_role = update_data["role"]

        _check_create_permission(
            current_user=current_user,
            requested_role=requested_role,
        )

        user.responsibility = (
            _get_responsibility_for_role(
                requested_role
            )
        )

    # ------------------------------------------------------
    # Password
    # ------------------------------------------------------

    if (
        "password" in update_data
        and update_data["password"]
    ):
        update_data["password"] = hash_password(
            update_data["password"]
        )

    # ------------------------------------------------------
    # Apply Updates
    # ------------------------------------------------------

    for key, value in update_data.items():

        if value is None:
            continue

        if key in ["role", "status"]:
            setattr(
                user,
                key,
                value.value,
            )

        else:
            setattr(
                user,
                key,
                value,
            )

    # ------------------------------------------------------
    # Save User
    # ------------------------------------------------------

    updated_user = user_repository.update_user(
        db=db,
        user=user,
    )

    # ------------------------------------------------------
    # Audit Log
    # ------------------------------------------------------

    create_audit_log(
        db=db,
        user=current_user,
        action="UPDATE",
        entity="User",
        entity_id=str(user_id),
        details=(
            f"User updated from {old_user_data} "
            f"to {request.model_dump(exclude_unset=True)}"
        ),
    )

    db.commit()

    return _map_user_to_response_schema(
        updated_user
    )


# ==========================================================
# Delete User
# ==========================================================


def delete_user_service(
    db: Session,
    user_id: int,
    current_user: User,
) -> DeleteUserResponse:
    """
    Delete user based on role hierarchy.
    """

    # ------------------------------------------------------
    # Find User
    # ------------------------------------------------------

    user = user_repository.get_user_by_id(
        db=db,
        user_id=user_id,
    )

    if not user:
        raise UserNotFoundError()

    # ------------------------------------------------------
    # Prevent Self Delete
    # ------------------------------------------------------

    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot delete your own account.",
        )

    # ------------------------------------------------------
    # Permission Check
    # ------------------------------------------------------

    _check_manage_permission(
        current_user=current_user,
        target_user=user,
    )

    # ------------------------------------------------------
    # Delete User
    # ------------------------------------------------------

    user_repository.delete_user(
        db=db,
        user=user,
    )

    # ------------------------------------------------------
    # Audit Log
    # ------------------------------------------------------

    create_audit_log(
        db=db,
        user=current_user,
        action="DELETE",
        entity="User",
        entity_id=str(user_id),
    )

    db.commit()

    return DeleteUserResponse(
        message="User deleted successfully."
    )