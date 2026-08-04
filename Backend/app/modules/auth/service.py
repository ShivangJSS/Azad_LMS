from fastapi import HTTPException, status
from sqlalchemy.orm import Session


from app.modules.auth.jwt_handler import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
    verify_reset_password_token,
)


from app.modules.auth.recaptcha import verify_recaptcha


from app.modules.auth.jwt_handler import create_reset_password_token
from app.modules.auth.schema import (
    ForgotPasswordRequest,
    ForgotPasswordResponse,
    ResetPasswordRequest,
    ResetPasswordResponse,
)


from app.modules.auth.schema import (
    LoginRequest,
    LoginResponse,
    RefreshTokenResponse,
    UserResponse,
)
from app.modules.auth.schema import LogoutResponse
from app.modules.auth.captcha import verify_captcha
from app.modules.auth.repository import AuthRepository
from app.modules.auth.security import (
    verify_password,
    hash_password,
)


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
            str(user.password),
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        # Step 4: Generate tokens
        access_token = create_access_token(
            {
                "sub": str(user.id),
                "email": str(user.email),
                "role": str(user.role),  # Ensure role is string
                "state": (
                    str(user.state_lgd_code) if (user.state_lgd_code is not None) else ""
                ),  # Convert to string if not None
                "district": (
                    str(user.district_lgd_code)
                    if (user.district_lgd_code is not None)
                    else ""
                ),  # Convert to string if not None
                "centre": (
                    str(user.centre_id) if (user.centre_id is not None) else ""
                ),  # Convert to string if not None
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
        if str(user.status) != "1":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive",
            )

        # Step 5: Generate new access token
        access_token = create_access_token(
            {
                "sub": str(user.id),
                "email": str(user.email),
                "role": str(user.role),
                "state": (
                    str(user.state_lgd_code) if (user.state_lgd_code is not None) else ""
                ),
                "district": (
                    str(user.district_lgd_code)
                    if (user.district_lgd_code is not None)
                    else ""
                ),
                "centre": (
                    str(user.centre_id) if (user.centre_id is not None) else ""
                ),
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
        return LogoutResponse(message="Logged out successfully")

    @staticmethod
    def forgot_password(
        db: Session,
        request: ForgotPasswordRequest,
    ) -> ForgotPasswordResponse:
        """
        Generate a password reset token after verifying
        Google reCAPTCHA and validating the user's email.
        """

        # Step 1: Verify Google reCAPTCHA
        if not verify_recaptcha(request.recaptcha_token):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Google reCAPTCHA",
            )

        # Step 2: Find user by email
        user = AuthRepository.get_user_by_email(
            db,
            request.email,
        )

        # Step 3: Check if user exists
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User with this email does not exist.",
            )

        # Step 4: Generate reset password token
        reset_token = create_reset_password_token(user.email)

        # Step 5: Return response
        return ForgotPasswordResponse(
            message="Reset token generated successfully.",
            reset_token=reset_token,
        )

    @staticmethod
    def reset_password(
        db: Session,
        request: ResetPasswordRequest,
    ) -> ResetPasswordResponse:
        """
        Reset the user's password using a valid reset token.
        """

        # Step 1: Verify reset token
        payload = verify_reset_password_token(request.reset_token)

        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired reset token",
            )

        # Step 2: Extract email
        email = payload.get("sub")

        if not email:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid reset token",
            )

        # Step 3: Find user
        user = AuthRepository.get_user_by_email(
            db,
            email,
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )

        # Step 4: Check passwords match
        if request.new_password != request.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match",
            )

        # Step 5: Hash new password
        hashed_password = hash_password(
            request.new_password,
        )

        # Step 6: Update password
        AuthRepository.update_password(
            db,
            user,
            hashed_password,
        )

        # Step 7: Return success
        return ResetPasswordResponse(
            message="Password reset successfully.",
        )
