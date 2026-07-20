from typing import Optional

from pydantic import BaseModel, EmailStr


# -------------------------
# Login Request
# -------------------------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    captcha_answer: int
    captcha_token: str


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
    