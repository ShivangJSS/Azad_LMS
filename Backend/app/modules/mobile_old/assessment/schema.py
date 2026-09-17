from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


# -------------------------
# Shared pieces
# -------------------------
class OptionItem(BaseModel):
    option_id: int
    option_text: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class BucketItem(BaseModel):
    bucket_id: int
    bucket_name: Optional[str] = None
    bucket_image: Optional[str] = None


class DraggableItem(BaseModel):
    item_id: int
    item_name: Optional[str] = None
    item_image: Optional[str] = None


class MatchItem(BaseModel):
    item_id: int
    text: Optional[str] = None


# -------------------------
# Question
# -------------------------
class QuestionItem(BaseModel):
    """
    One question of any type. Only the fields relevant to `type` are filled,
    so the app can render all four kinds from a single list.
    """

    type: str = Field(description="MCQ | SCQ | DB | MM")

    question_id: int
    question_title: Optional[str] = None
    question_description: Optional[str] = None
    image_url: Optional[str] = None
    marks: float = 1.0

    # MCQ / SCQ
    allows_multiple: bool = False
    options: List[OptionItem] = Field(default_factory=list)

    # Drop bucket
    buckets: List[BucketItem] = Field(default_factory=list)
    items: List[DraggableItem] = Field(default_factory=list)

    # Match making
    left_items: List[MatchItem] = Field(default_factory=list)
    right_items: List[MatchItem] = Field(default_factory=list)


class ModuleAssessmentResponse(BaseModel):
    module_id: int
    language_id: int
    total_questions: int
    pass_percentage: float
    questions: List[QuestionItem]


# -------------------------
# Submit
# -------------------------
class BucketPlacement(BaseModel):
    item_id: int
    bucket_id: int


class MatchPair(BaseModel):
    left_id: int
    right_id: int


class AnswerItem(BaseModel):
    type: str = Field(description="MCQ | SCQ | DB | MM")
    question_id: int

    # MCQ / SCQ
    selected_options: List[int] = Field(default_factory=list)

    # Drop bucket
    placements: List[BucketPlacement] = Field(default_factory=list)

    # Match making
    pairs: List[MatchPair] = Field(default_factory=list)


class SubmitAssessmentRequest(BaseModel):
    answers: List[AnswerItem] = Field(default_factory=list)


class QuestionResult(BaseModel):
    type: str
    question_id: int

    is_correct: bool = Field(description="True only when fully correct")

    score: float = Field(
        description="Credit earned for this question, from 0.0 to 1.0",
    )

    correct_options: List[int] = Field(default_factory=list)


class SubmitAssessmentResponse(BaseModel):
    module_id: int
    attempt_id: int

    total_questions: int
    correct_answers: int = Field(
        description="Questions answered fully correctly",
    )

    wrong_answers: int = Field(
        description="total_questions - correct_answers",
    )

    partially_correct: int = Field(
        default=0,
        description=(
            "Of the wrong answers, how many earned some credit. Shown so a "
            "half-right multi-select does not just look like a miss."
        ),
    )

    score_percentage: float = Field(
        description="correct_answers / total_questions, as a percentage",
    )

    pass_percentage: float

    passed: bool
    module_completed: bool

    next_module_id: Optional[int] = None
    next_module_name: Optional[str] = None

    results: List[QuestionResult] = Field(default_factory=list)
