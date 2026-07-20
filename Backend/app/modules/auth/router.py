from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.modules.auth.captcha import generate_captcha


from app.modules.auth.schema import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
     ResetPasswordRequest,
    ResetPasswordResponse,
)
from app.database.database import get_db

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




@router.post(
    "/refresh",
    response_model=RefreshTokenResponse,
)
def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    return AuthService.refresh_access_token(
        db,
        request.refresh_token,
    )



@router.post(
    "/logout",
    response_model=LogoutResponse,
    summary="User Logout",
)
def logout():
    """
    Logout user.
    Frontend should remove stored JWT tokens.
    """
    return AuthService.logout()



#==========================================================
#forgot password router
#=========================================================

@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
    summary="Forgot Password",
)
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    return AuthService.forgot_password(
        db=db,
        request=request,
    )

@router.post(
    "/reset-password",
    response_model=ResetPasswordResponse,
)
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    """
    Reset password using a valid reset token.
    """
    return AuthService.reset_password(
        db,
        request,
    )