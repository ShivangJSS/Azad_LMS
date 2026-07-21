from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.common.enums import UserStatus
from app.modules.auth.security import hash_password

from app.modules.auth.model import User
from .repository import create_user, get_user_by_email
from .schema import CreateUserRequest


def create_new_user(
    db: Session,
    request: CreateUserRequest,
):
    """
    Create a new user
    """

    # Check if email already exists
    existing_user = get_user_by_email(
        db=db,
        email=request.email,
    )

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists.",
        )

    # Hash password
    hashed_password = hash_password(request.password)

    # Create User Model
    user = User(
        name=request.name,
        email=request.email,
        password=hashed_password,
        role=request.role.value,  # If role is enum then use request.role.value
        status=UserStatus.ACTIVE.value,
    )

    # Save user in database
    saved_user = create_user(
        db=db,
        user=user,
    )

    return saved_user
