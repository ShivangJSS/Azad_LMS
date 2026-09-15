from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class StateResponse(BaseModel):
    state_lgd_code: int
    state_name: str

    class Config:
        from_attributes = True


class DistrictResponse(BaseModel):
    district_lgd_code: int
    district_name: str

    class Config:
        from_attributes = True


class BlockResponse(BaseModel):
    block_lgd_code: int
    block_name: str

    class Config:
        from_attributes = True


class CentreCreateRequest(BaseModel):
    centre_name: str = Field(..., min_length=1, max_length=255)
    address: str = Field(..., min_length=1, max_length=1000)
    location: str = Field(..., min_length=1, max_length=255)

    latitude: Optional[Decimal] = Field(None, ge=-90, le=90)
    longitude: Optional[Decimal] = Field(None, ge=-180, le=180)

    pin: str = Field(..., pattern=r"^\d{6}$")
    phone_number: str = Field(..., pattern=r"^\d+$")
    email: EmailStr

    block_id: int
    district_id: int
    state_id: int

    status: int = Field(default=1, ge=0, le=1)

    @field_validator('centre_name', 'address', 'location')
    @classmethod
    def strip_and_validate_not_empty(cls, v):
        if isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError('Field cannot be empty or contain only whitespace')
        return v


class CentreResponse(BaseModel):
    centre_id: int
    centre_name: str
    address: str
    location: str

    latitude: Optional[Decimal]
    longitude: Optional[Decimal]

    pin: str
    phone_number: str
    email: EmailStr

    block_id: int
    district_id: int
    state_id: int

    status: int

    model_config = ConfigDict(from_attributes=True)


class CentreListResponse(BaseModel):
    centre_id: int
    centre_name: str
    state_name: Optional[str] = None
    district_name: Optional[str] = None
    block_name: Optional[str] = None
    phone_number: str
    status: int

    model_config = ConfigDict(from_attributes=True)


class PaginatedCentreListResponse(BaseModel):
    data: list[CentreListResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class CentreDetailResponse(BaseModel):
    centre_id: int
    centre_name: str
    address: str
    location: str

    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None

    pin: str
    phone_number: str
    email: EmailStr

    state_id: Optional[int] = None
    state_name: Optional[str] = None
    district_id: Optional[int] = None
    district_name: Optional[str] = None
    block_id: Optional[int] = None
    block_name: Optional[str] = None

    status: int

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class CentreUpdateRequest(BaseModel):
    centre_name: str = Field(..., min_length=1, max_length=255)
    address: str = Field(..., min_length=1, max_length=1000)
    location: str = Field(..., min_length=1, max_length=255)

    latitude: Optional[Decimal] = Field(None)
    longitude: Optional[Decimal] = Field(None)

    pin: str = Field(..., pattern=r"^\d{6}$")
    phone_number: str = Field(..., pattern=r"^\d+$")
    email: EmailStr

    state_id: int
    district_id: int
    block_id: int

    status: int = Field(..., ge=0, le=1)

    @field_validator('centre_name', 'address', 'location')
    @classmethod
    def strip_and_validate_not_empty(cls, v):
        if isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError('Field cannot be empty or contain only whitespace')
        return v


class CentreStatusUpdateRequest(BaseModel):
    status: int = Field(..., ge=0, le=1)


class DeleteCentreResponse(BaseModel):
    message: str
