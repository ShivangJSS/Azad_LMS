from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


# ---------------- Match Making Master ---------------- #

class MatchMakingBase(BaseModel):
    parent_id: int = 0

    match_making_question_title: str
    match_making_question_description: Optional[str] = None
    image_url: Optional[str] = None

    marks: Decimal
    status: int
    language_id: int


class MatchMakingCreate(MatchMakingBase):
    pass


class MatchMakingUpdate(BaseModel):
    match_making_question_title: Optional[str] = None
    match_making_question_description: Optional[str] = None
    image_url: Optional[str] = None

    marks: Optional[Decimal] = None
    status: Optional[int] = None
    language_id: Optional[int] = None


class MatchMakingResponse(MatchMakingBase):
    match_making_id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    deleted_at: Optional[datetime] = None

    # Add this
    is_translation: bool = True

    model_config = ConfigDict(from_attributes=True)




class MatchLeftItemBase(BaseModel):
    match_left_text: str
    sort_order: Optional[str] = None
    language_id: int


class MatchLeftItemCreate(MatchLeftItemBase):
    pass


class MatchLeftItemUpdate(BaseModel):
    match_left_text: Optional[str] = None
    sort_order: Optional[str] = None
    language_id: Optional[int] = None


class MatchLeftItemResponse(MatchLeftItemBase):
    match_left_id: int
    match_making_id: int

    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)



class MatchRightItemBase(BaseModel):
    match_right_text: str
    sort_order: Optional[str] = None
    language_id: int


class MatchRightItemCreate(MatchRightItemBase):
    pass


class MatchRightItemUpdate(BaseModel):
    match_right_text: Optional[str] = None
    sort_order: Optional[str] = None
    language_id: Optional[int] = None


class MatchRightItemResponse(MatchRightItemBase):
    match_right_id: int
    match_making_id: int

    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)