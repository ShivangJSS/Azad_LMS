from typing import Any, Dict, List, Optional

from pydantic import BaseModel, ConfigDict, Field


class MoodAnswerCreate(BaseModel):
    question_id: int
    selected_options: List[int]


class FeedbackCreate(BaseModel):
    """
    The participant is taken from the bearer token, never from the body, so
    one participant cannot submit feedback on behalf of another.
    """

    lms_experience: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    lms_ease: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    useful_modules: List[str] = Field(
        default_factory=list,
    )

    # Mood questionnaire answers
    mood_answers: List[MoodAnswerCreate] = Field(
        default_factory=list,
    )

    # Full questionnaire. Keys are participant_feedback columns; values are
    # a string, or a list of strings for multi-select questions.
    form_answers: Dict[str, Any] = Field(
        default_factory=dict,
        examples=[{"visual_material": "Good", "confidence_areas": ["Traffic rules"]}],
    )


# -------------------------
# Form definition
# -------------------------
class FeedbackFormField(BaseModel):
    field: str
    question: str
    type: str = Field(description="single | multiple | text")
    options: List[str] = Field(default_factory=list)


class FeedbackResponse(BaseModel):
    feedback_id: int
    message: str

    model_config = ConfigDict(from_attributes=True)


class QuestionOptionResponse(BaseModel):
    option_id: int
    question_id: int
    option_name: str
    option_icon: Optional[str] = None
    language_id: int

    model_config = ConfigDict(from_attributes=True)


class MoodQuestionResponse(BaseModel):
    question_id: int
    question_name: str
    question_description: Optional[str] = None
    question_type: str
    language_id: int

    options: List[QuestionOptionResponse] = Field(
        default_factory=list
    )

    model_config = ConfigDict(from_attributes=True)


class MoodQuestionsResponse(BaseModel):
    questions: List[MoodQuestionResponse]

    model_config = ConfigDict(from_attributes=True)
