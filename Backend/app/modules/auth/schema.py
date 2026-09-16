import re
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator

# Login identifier can be an email or a username: letters, digits and
# . _ - @ + only. All DB access is via parameterised ORM queries, so this is
# defence-in-depth that rejects the quotes/spaces/semicolons/comment markers
# used in SQL-injection payloads before they reach the service layer.
_LOGIN_ID_REGEX = re.compile(r"^[A-Za-z0-9._@+-]+$")


# -------------------------
# Login Request
# -------------------------
class LoginRequest(BaseModel):
    email: str = Field(..., min_length=1, max_length=255)
    password: str = Field(..., max_length=255)
    captcha_answer: int = Field(..., ge=0)
    captcha_token: str = Field(..., min_length=1)

    @field_validator("email")
    @classmethod
    def validate_login_identifier(cls, value: str) -> str:
        value = value.strip()
        if not _LOGIN_ID_REGEX.match(value):
            raise ValueError("Invalid username or email format.")
        return value


# -------------------------
# refresh Request
# -------------------------


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class RefreshTokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


# -------------------------
# User Information
# -------------------------
class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    responsibility: Optional[str] = None
    state_lgd_code: Optional[int] = None
    district_lgd_code: Optional[int] = None
    block_lgd_code: Optional[int] = None
    centre_id: Optional[int] = None

    class Config:
        from_attributes = True


# -------------------------
# Login Response
# -------------------------
class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    refresh_token: str
    user: UserResponse


# -------------------------
# JWT Payload
# -------------------------
class TokenPayload(BaseModel):
    sub: str
    role: str
    exp: int


# -------------------------
# LOGOUT
# -------------------------


class LogoutResponse(BaseModel):
    message: str


# -------------------------
# Forgot Password
# -------------------------


class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    recaptcha_token: str


class ForgotPasswordResponse(BaseModel):
    message: str
    reset_token: str


# -------------------------
# Reset Password
# -------------------------


class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str
    confirm_password: str


class ResetPasswordResponse(BaseModel):
    message: str
