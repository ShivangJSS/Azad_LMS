from pydantic import BaseModel, EmailStr, ConfigDict

from app.common.enums import (
    UserRole,
    Status,
)


# ==========================================
# Request Schemas
# ==========================================

class CreateUserRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: UserRole


class UpdateUserRequest(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    role: UserRole | None = None
    status: Status | None = None


# ==========================================
# Response Schemas
# ==========================================

class UserBaseResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    responsibility: str | None = None
    status: str

    model_config = ConfigDict(
        from_attributes=True
    )


class DeleteUserResponse(BaseModel):
    message: str