"""
Request and response shapes for the activity-logging endpoints.

The participant is taken from the bearer token, never from the request body,
so — unlike the old Laravel endpoints — these payloads carry no participant_id
/ user_id for a caller to spoof.
"""

from typing import List, Optional

from pydantic import BaseModel, Field

# ---------------- time spent (whole session, minutes) ----------------


class TimeSpentRequest(BaseModel):
    time_spent_in_minutes: int = Field(ge=0)


# ---------------- time spent on a module (seconds) ----------------


class ModuleTimeRequest(BaseModel):
    module_id: int
    topic_id: Optional[int] = None
    document_id: Optional[int] = None
    time_taken: int = Field(ge=1, description="Seconds spent")


# ---------------- post-video question answers ----------------


class VideoAnswer(BaseModel):
    question_id: int
    option_id: int


class VideoQuestionAnswerRequest(BaseModel):
    video_id: int
    topic_id: int
    module_id: int
    answers: List[VideoAnswer] = Field(min_length=1)


class InsertResponse(BaseModel):
    success: bool = True
    id: int


class VideoAnswerResponse(BaseModel):
    success: bool = True
    total_answers: int


# ---------------- reading a video's questions ----------------


class VideoQuestionOption(BaseModel):
    option_id: int
    option_text: Optional[str] = None
    is_correct: bool = False


class VideoQuestionItem(BaseModel):
    type: str
    question_id: int
    question_title: Optional[str] = None
    question_description: Optional[str] = None
    marks: float = 1.0
    options: List[VideoQuestionOption] = []
