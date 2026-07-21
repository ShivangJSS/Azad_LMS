from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.database import get_db

from .controller import create_user_controller
from .schema import CreateUserRequest, UserResponse

router = APIRouter(
    prefix="/users",
    tags=["Users"],
)


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_user(
    request: CreateUserRequest,
    db: Session = Depends(get_db),
):
    return create_user_controller(
        db=db,
        request=request,
    )

print("✅ Users Router Loaded")
