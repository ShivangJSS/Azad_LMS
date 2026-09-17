from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# -------------------------
# Did You Know tip
# -------------------------
class DidYouKnowItem(BaseModel):
    didyouknow_id: int
    text: Optional[str] = None

    image_url: Optional[str] = Field(
        default=None,
        description="Stored file name, returned raw",
    )

    language_id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)


# -------------------------
# Dashboard Stats Response
# -------------------------
class DashboardStatsResponse(BaseModel):
    modules_completed: int = Field(
        description="Modules with lock_status = 2",
        examples=[2],
    )

    total_modules: int = Field(
        description="Modules assigned to this participant",
        examples=[8],
    )

    average_score: float = Field(
        description=(
            "Percentage of selected assessment options that were correct, "
            "across MCQ and SCQ answers. 0 when nothing is attempted."
        ),
        examples=[92.31],
    )

    questions_attempted: int = Field(
        description="Assessment options the participant selected",
        examples=[39],
    )

    time_invested_minutes: int = Field(
        description="Sum of time_spent_module_log.time_taken, in minutes",
        examples=[41],
    )

    time_invested_seconds: int = Field(
        description="Sum of time_spent_module_log.time_taken, in seconds",
        examples=[2481],
    )

    overall_progress: float = Field(
        description="modules_completed / total_modules, from 0.0 to 1.0",
        examples=[0.25],
    )
