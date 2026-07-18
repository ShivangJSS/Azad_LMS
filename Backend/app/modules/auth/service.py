from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.auth.captcha import verify_captcha
from app.modules.auth.repository import AuthRepository
from app.modules.auth.security import verify_password
from app.modules.auth.jwt_handler import create_access_token
from app.modules.auth.schema import (
    LoginRequest,
    LoginResponse,
    UserResponse,
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

        # Step 2: Fetch user by email
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

        # Step 4: Generate JWT
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

        # Step 5: Return response
        return LoginResponse(
            access_token=access_token,
            user=UserResponse.model_validate(user),
        )