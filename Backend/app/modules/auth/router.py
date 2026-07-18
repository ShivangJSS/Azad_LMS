from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.modules.auth.captcha import generate_captcha


from app.database.database import get_db
from app.modules.auth.schema import LoginRequest, LoginResponse
from app.modules.auth.service import AuthService

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

##get captcha endpoint

@router.get("/captcha")
def get_captcha():
    """
    Generate a new captcha.
    """
    return generate_captcha()





@router.post(
    "/login",
    response_model=LoginResponse,
    summary="User Login",
)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    Authenticate user and return JWT access token.
    """
    return AuthService.login(
        db=db,
        login_data=login_data,
    )


