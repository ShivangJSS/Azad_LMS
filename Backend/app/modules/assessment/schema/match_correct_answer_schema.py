from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class MatchCorrectAnswerBase(BaseModel):
    match_left_id: int
    match_right_id: int


class MatchCorrectAnswerCreate(MatchCorrectAnswerBase):
    pass


class MatchCorrectAnswerUpdate(BaseModel):
    match_left_id: Optional[int] = None
    match_right_id: Optional[int] = None


class MatchCorrectAnswerResponse(MatchCorrectAnswerBase):
    match_correct_answers_id: int
    match_making_id: int

    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)