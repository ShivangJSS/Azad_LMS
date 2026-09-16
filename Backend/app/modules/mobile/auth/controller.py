from sqlalchemy.orm import Session

from app.modules.mobile.auth.schema import (
    MobileLoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    LogoutResponse,
    ParticipantResponse,
)

from app.modules.mobile.auth.service import MobileAuthService


class MobileAuthController:

    @staticmethod
    def login(
        db: Session,
        request: MobileLoginRequest,
    ) -> LoginResponse:

        return MobileAuthService.login(
            db=db,
            username=request.username,
            password=request.password,
        )

    @staticmethod
    def refresh_token(
        db: Session,
        request: RefreshTokenRequest,
    ) -> RefreshTokenResponse:

        return MobileAuthService.refresh_token(
            db=db,
            refresh_token=request.refresh_token,
        )

    @staticmethod
    def logout() -> LogoutResponse:

        return MobileAuthService.logout()

    @staticmethod
    def get_current_participant(
        db: Session,
        participant_id: int,
    ) -> ParticipantResponse:

        return MobileAuthService.get_current_participant(
            db=db,
            participant_id=participant_id,
        )