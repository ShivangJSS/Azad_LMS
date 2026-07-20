from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.auth.jwt_handler import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
)

from app.modules.auth.schema import (
    LoginRequest,
    LoginResponse,
    RefreshTokenResponse,
    UserResponse,
)
from app.modules.auth.schema import LogoutResponse

from app.modules.auth.constants import ACTIVE
from app.modules.auth.captcha import verify_captcha
from app.modules.auth.repository import AuthRepository
from app.modules.auth.security import verify_password


class AuthService:

    @staticmethod
    def login(
        db: Session,
        login_data: LoginRequest,
    ) -> LoginResponse:

        # Step 1: Validate Captcha
        if not verify_captcha(
            login_data.captcha_token,
            login_data.captcha_answer,
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired captcha",
            )

        # Step 2: Fetch user
        user = AuthRepository.get_user_by_email(
            db,
            login_data.email,
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        # Step 3: Verify password
        if not verify_password(
            login_data.password,
            user.password,
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        # Step 4: Generate tokens
        access_token = create_access_token(
            {
                "sub": str(user.id),
                "email": user.email,
                "role": str(user.role),
                "state": user.state_lgd_code,
                "district": user.district_lgd_code,
                "centre": user.centre_id,
            }
        )

        refresh_token = create_refresh_token(user.id)

        # Step 5: Return response
        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )

    @staticmethod
    def refresh_access_token(
        db: Session,
        refresh_token: str,
    ) -> RefreshTokenResponse:

        # Step 1: Verify refresh token
        payload = verify_refresh_token(refresh_token)

        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
            )

        # Step 2: Get user ID
        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        # Step 3: Fetch user
        user = AuthRepository.get_user_by_id(
            db,
            int(user_id),
        )

        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )

        # Step 4: Check status
        if user.status != ACTIVE:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive",
            )

        # Step 5: Generate new access token
        access_token = create_access_token(
            {
                "sub": str(user.id),
                "email": user.email,
                "role": str(user.role),
                "state": user.state_lgd_code,
                "district": user.district_lgd_code,
                "centre": user.centre_id,
            }
        )

        # Step 6: Return response
        return RefreshTokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
        )
    @staticmethod
    def logout() -> LogoutResponse:
        """
        Logout user.

        Since JWT is stateless, the backend simply returns success.
        The frontend should delete the access token and refresh token.
        """

        return LogoutResponse(
            message="Logged out successfully"
        )