from pydantic import BaseModel, ConfigDict


class ReferenceStateResponse(BaseModel):
    code: int
    name: str


class ReferenceDistrictResponse(BaseModel):
    code: int
    name: str
    parent_code: int


class ReferenceCentreResponse(BaseModel):
    id: int
    name: str
    parent_code: int | None = None

    model_config = ConfigDict(from_attributes=True)
