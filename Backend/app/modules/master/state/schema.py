from typing import Literal, Optional

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
)


# ==========================================================
# Create State Request
# ==========================================================

class StateCreateRequest(BaseModel):

    state_lgd_code: int = Field(
        ...,
        gt=0,
        le=32767,  # SmallInteger max value
    )

    state_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
    )

    status: Literal["0", "1"]

    @field_validator("state_name")
    @classmethod
    def validate_state_name(cls, value: str) -> str:

        value = " ".join(value.split())

        if not value:
            raise ValueError("State name is required")

        return value


# ==========================================================
# Update State Request
# ==========================================================

class StateUpdateRequest(BaseModel):

    state_name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=100,
    )

    status: Optional[Literal["0", "1"]] = None

    @field_validator("state_name")
    @classmethod
    def validate_state_name(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value

        value = " ".join(value.split())

        if not value:
            raise ValueError("State name cannot be empty")

        return value


# ==========================================================
# State Response
# ==========================================================

class StateResponse(BaseModel):

    state_lgd_code: int
    state_name: str
    status: str

    model_config = ConfigDict(
        from_attributes=True
    )


# ==========================================================
# State List Response
# ==========================================================

class StateListResponse(BaseModel):

    data: list[StateResponse]

    total: int

    page: int

    per_page: int

    total_pages: int


# ==========================================================
# Delete State Response
# ==========================================================

class DeleteStateResponse(BaseModel):

    message: str