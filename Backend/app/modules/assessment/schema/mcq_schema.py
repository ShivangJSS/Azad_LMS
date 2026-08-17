from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


# -----------------------------------
# MCQ Option
# -----------------------------------

class McqOptionBase(BaseModel):
    mcq_option_text: str = Field(..., max_length=500)
    is_mcq_option_correct: int = Field(..., ge=0, le=1)
    status: int = 1
    language_id: int


class McqOptionCreate(McqOptionBase):
    pass


class McqOptionUpdate(BaseModel):
    mcq_option_text: Optional[str] = Field(None, max_length=500)
    is_mcq_option_correct: Optional[int] = Field(None, ge=0, le=1)
    status: Optional[int] = None
    language_id: Optional[int] = None


class McqOptionResponse(McqOptionBase):
    model_config = ConfigDict(from_attributes=True)

    mcq_option_id: int
    mcq_id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


# -----------------------------------
# MCQ Base
# -----------------------------------

class McqBase(BaseModel):
    parent_id: Optional[int] = None
    mcq_question_title: str = Field(..., max_length=500)
    mcq_question_description: Optional[str] = None
    image_url: Optional[str] = None
    marks: Decimal
    status: int = 1
    language_id: int


# -----------------------------------
# Create MCQ
# -----------------------------------

class McqCreate(McqBase):
    options: List[McqOptionCreate]


# -----------------------------------
# Update MCQ
# -----------------------------------

class McqUpdate(BaseModel):
    parent_id: Optional[int] = None
    mcq_question_title: Optional[str] = Field(None, max_length=500)
    mcq_question_description: Optional[str] = None
    image_url: Optional[str] = None
    marks: Optional[Decimal] = None
    status: Optional[int] = None
    language_id: Optional[int] = None
    options: Optional[List[McqOptionUpdate]] = None


# -----------------------------------
# Response
# -----------------------------------

class McqResponse(McqBase):
    model_config = ConfigDict(from_attributes=True)

    mcq_id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    options: List[McqOptionResponse] = []


# -----------------------------------
# List Response
# -----------------------------------

class McqListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    mcq_id: int
    mcq_question_title: str
    mcq_question_description: Optional[str]
    image_url: Optional[str]
    marks: Decimal
    status: int
    language_id: int


class McqListResponse(BaseModel):
    total: int
    items: List[McqListItem]
    