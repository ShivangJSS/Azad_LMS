from sqlalchemy.orm import Session

from .schema import CreateUserRequest
from .service import create_new_user


def create_user_controller(
    db: Session,
    request: CreateUserRequest,
):
    """
    Create a new user
    """
    return create_new_user(
        db=db,
        request=request,
    )
