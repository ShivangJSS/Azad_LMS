from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.modules.mobile.auth.controller import MobileAuthController
from app.modules.mobile.core.dependencies import get_current_participant

from app.modules.mobile.auth.password_service import PasswordService
from app.modules.mobile.auth.schema import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    MobileLoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    LogoutResponse,
    ParticipantResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
)

router = APIRouter(
    prefix="/mobile/auth",
    tags=["Mobile Authentication"],
)


@router.post(
    "/login",
    response_model=LoginResponse,
)
def login(
    request: MobileLoginRequest,
    db: Session = Depends(get_db),
):
    return MobileAuthController.login(
        db=db,
        request=request,
    )


@router.post(
    "/refresh",
    response_model=RefreshTokenResponse,
)
def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    return MobileAuthController.refresh_token(
        db=db,
        request=request,
    )


@router.post(
    "/logout",
    response_model=LogoutResponse,
)
def logout():
    return MobileAuthController.logout()


@router.get(
    "/me",
    response_model=ParticipantResponse,
)
def get_me(
    participant=Depends(get_current_participant),
    db: Session = Depends(get_db),
):
    return MobileAuthController.get_current_participant(
        db=db,
        participant_id=participant.participant_id,
    )


@router.post(
    "/forgot-password",
    response_model=ForgotPasswordResponse,
)
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    return PasswordService.forgot_password(
        db=db,
        username=request.username,
    )


@router.post(
    "/reset-password",
    response_model=ResetPasswordResponse,
)
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    return PasswordService.reset_password(
        db=db,
        reset_token=request.reset_token,
        new_password=request.new_password,
        confirm_password=request.confirm_password,
    )


@router.post(
    "/change-password",
    response_model=ResetPasswordResponse,
)
def change_password(
    request: ChangePasswordRequest,
    participant=Depends(get_current_participant),
    db: Session = Depends(get_db),
):
    return PasswordService.change_password(
        db=db,
        participant=participant,
        current_password=request.current_password,
        new_password=request.new_password,
        confirm_password=request.confirm_password,
    )