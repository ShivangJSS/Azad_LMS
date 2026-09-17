from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.mobile.auth.repository import MobileAuthRepository
from app.modules.mobile.auth.schema import (
    ForgotPasswordResponse,
    ResetPasswordResponse,
)
from app.modules.mobile.core.constants import RESET_TOKEN_EXPIRE_MINUTES
from app.modules.mobile.core.reset_token import (
    create_reset_token,
    verify_reset_token,
)
from app.modules.mobile.core.utils import hash_password, verify_password


class PasswordService:
    """
    Forgot / reset / change password for participants.
    """

    @staticmethod
    def forgot_password(
        db: Session,
        username: str,
    ) -> ForgotPasswordResponse:

        participant = MobileAuthRepository.get_active_participant_by_username(
            db=db,
            username=username,
        )

        if participant is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active participant found with that username.",
            )

        return ForgotPasswordResponse(
            message="Reset token generated.",
            reset_token=create_reset_token(participant.participant_id),
            expires_in_minutes=RESET_TOKEN_EXPIRE_MINUTES,
        )

    @staticmethod
    def reset_password(
        db: Session,
        reset_token: str,
        new_password: str,
        confirm_password: str,
    ) -> ResetPasswordResponse:

        PasswordService._require_matching(new_password, confirm_password)

        payload = verify_reset_token(reset_token)

        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired reset token.",
            )

        participant = MobileAuthRepository.get_by_participant_id(
            db=db,
            participant_id=payload["participant_id"],
        )

        if participant is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Participant not found.",
            )

        MobileAuthRepository.update_password(
            db=db,
            participant=participant,
            hashed_password=hash_password(new_password),
        )

        return ResetPasswordResponse(
            message="Password reset successfully.",
        )

    @staticmethod
    def change_password(
        db: Session,
        participant,
        current_password: str,
        new_password: str,
        confirm_password: str,
    ) -> ResetPasswordResponse:

        PasswordService._require_matching(new_password, confirm_password)

        if not verify_password(current_password, participant.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Current password is incorrect.",
            )

        MobileAuthRepository.update_password(
            db=db,
            participant=participant,
            hashed_password=hash_password(new_password),
        )

        return ResetPasswordResponse(
            message="Password changed successfully.",
        )

    @staticmethod
    def _require_matching(new_password: str, confirm_password: str) -> None:
        if new_password != confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password and confirmation do not match.",
            )
