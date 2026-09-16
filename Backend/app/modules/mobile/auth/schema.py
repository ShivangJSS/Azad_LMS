from pydantic import BaseModel, Field, ConfigDict
from typing import Optional


# -------------------------
# Login Request
# -------------------------
class MobileLoginRequest(BaseModel):
    """
    Deliberately unvalidated beyond "not empty".

    Length rules here made a short wrong password fail with 422 before the
    credentials were ever checked, so the app could not tell the participant
    their details were wrong. Strength rules belong on reset, not on login.
    """

    username: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Participant username",
        examples=["ramita"],
    )

    password: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Participant password",
        examples=["Password@123"],
    )


# -------------------------
# Refresh Token Request
# -------------------------
class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(
        ...,
        description="Refresh token",
    )


# -------------------------
# Logout Request
# -------------------------
class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = Field(
        default=None,
        description="Refresh token (optional)",
    )


# -------------------------
# Participant Response
# -------------------------
class ParticipantResponse(BaseModel):
    participant_id: int
    enrollment_no: str
    participant_name: str
    username: str

    email: Optional[str] = None
    mobile_no: Optional[str] = None
    images: Optional[str] = None

    progress_status: Optional[int] = 0
    course_progress: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)


# -------------------------
# Login Response
# -------------------------
class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"

    participant: ParticipantResponse


# -------------------------
# Refresh Response
# -------------------------
class RefreshTokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"


# -------------------------
# Logout Response
# -------------------------
class LogoutResponse(BaseModel):
    message: str


# -------------------------
# Authenticated Participant
# -------------------------
class CurrentParticipantResponse(BaseModel):
    participant: ParticipantResponse


# -------------------------
# Forgot Password
# -------------------------
class ForgotPasswordRequest(BaseModel):
    username: str = Field(
        ...,
        min_length=3,
        max_length=255,
        description=(
            "Participant username. Used rather than email because most "
            "participants have no email on record."
        ),
        examples=["ramita"],
    )


class ForgotPasswordResponse(BaseModel):
    message: str

    reset_token: str = Field(
        description=(
            "Short-lived token authorising one password reset. Returned "
            "directly, matching the existing web /auth/forgot-password."
        ),
    )

    expires_in_minutes: int


# -------------------------
# Reset Password
# -------------------------
class ResetPasswordRequest(BaseModel):
    reset_token: str

    new_password: str = Field(
        ...,
        min_length=6,
        max_length=255,
    )

    confirm_password: str = Field(
        ...,
        min_length=6,
        max_length=255,
    )


class ResetPasswordResponse(BaseModel):
    message: str


# -------------------------
# Change Password (logged in)
# -------------------------
class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=6, max_length=255)
    new_password: str = Field(..., min_length=6, max_length=255)
    confirm_password: str = Field(..., min_length=6, max_length=255)