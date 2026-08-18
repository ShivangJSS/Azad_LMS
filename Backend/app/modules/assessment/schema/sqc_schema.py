from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class ScqOptionBase(BaseModel):
    scq_option_text: str
    is_scq_option_correct: int
    status: int = 1
    language_id: int


class ScqOptionCreate(ScqOptionBase):
    pass


class ScqOptionUpdate(ScqOptionBase):
    pass


class ScqOptionResponse(ScqOptionBase):
    model_config = ConfigDict(from_attributes=True)

    scq_option_id: int
    scq_id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


class ScqBase(BaseModel):
    parent_id: Optional[int] = None
    scq_question_title: str
    scq_question_description: Optional[str] = None
    image_url: Optional[str] = None
    marks: Decimal
    status: int = 1
    language_id: int


class ScqCreate(ScqBase):
    options: List[ScqOptionCreate]


class ScqUpdate(BaseModel):
    parent_id: Optional[int] = None
    scq_question_title: Optional[str] = None
    scq_question_description: Optional[str] = None
    image_url: Optional[str] = None
    marks: Optional[Decimal] = None
    status: Optional[int] = None
    language_id: Optional[int] = None
    options: Optional[List[ScqOptionUpdate]] = None


class ScqResponse(ScqBase):
    model_config = ConfigDict(from_attributes=True)

    scq_id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    options: List[ScqOptionResponse] = []


class ScqListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    scq_id: int
    parent_id: int
    scq_question_title: str
    scq_question_description: Optional[str]
    image_url: Optional[str]
    marks: Decimal
    status: int
    language_id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
