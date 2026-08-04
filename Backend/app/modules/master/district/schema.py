from typing import Literal

from pydantic import BaseModel, Field, field_validator


class DistrictCreateRequest(BaseModel):
    district_lgd_code: int = Field(
        ...,
        gt=0,
    )

    district_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    state_lgd_code: int = Field(
        ...,
        gt=0,
    )

    status: Literal["0", "1"] = "1"

    @field_validator("district_name")
    @classmethod
    def validate_district_name(cls, value: str) -> str:
        value = " ".join(value.split())

        if not value:
            raise ValueError("District name is required")

        return value


class DistrictUpdateRequest(BaseModel):
    district_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    state_lgd_code: int = Field(
        ...,
        gt=0,
    )

    status: Literal["0", "1"]

    @field_validator("district_name")
    @classmethod
    def validate_district_name(cls, value: str) -> str:
        value = " ".join(value.split())

        if not value:
            raise ValueError("District name is required")

        return value


class DistrictResponse(BaseModel):
    district_lgd_code: int
    district_name: str
    state_lgd_code: int
    state_name: str | None = None
    status: str


class DistrictListResponse(BaseModel):
    data: list[DistrictResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class DeleteDistrictResponse(BaseModel):
    message: str