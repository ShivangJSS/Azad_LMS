from sqlalchemy.orm import Session

from app.modules.mobile.dashboard.repository import DashboardRepository
from app.modules.mobile.dashboard.schema import (
    DashboardStatsResponse,
    DidYouKnowItem,
)

SECONDS_PER_MINUTE = 60


class DashboardService:

    @staticmethod
    def get_stats(
        db: Session,
        participant_id: int,
    ) -> DashboardStatsResponse:

        # -----------------------------
        # Module progress
        # -----------------------------
        completed, total = DashboardRepository.count_modules(
            db=db,
            participant_id=participant_id,
        )

        overall_progress = (
            round(completed / total, 4)
            if total
            else 0.0
        )

        # -----------------------------
        # Assessment score
        # -----------------------------
        mcq_correct, mcq_attempted = DashboardRepository.count_mcq_answers(
            db=db,
            participant_id=participant_id,
        )

        scq_correct, scq_attempted = DashboardRepository.count_scq_answers(
            db=db,
            participant_id=participant_id,
        )

        correct = mcq_correct + scq_correct
        attempted = mcq_attempted + scq_attempted

        average_score = (
            round(correct * 100 / attempted, 2)
            if attempted
            else 0.0
        )

        # -----------------------------
        # Time invested
        # -----------------------------
        seconds = DashboardRepository.total_time_spent_seconds(
            db=db,
            participant_id=participant_id,
        )

        # -----------------------------
        # Response
        # -----------------------------
        return DashboardStatsResponse(
            modules_completed=completed,
            total_modules=total,
            average_score=average_score,
            questions_attempted=attempted,
            time_invested_minutes=seconds // SECONDS_PER_MINUTE,
            time_invested_seconds=seconds,
            overall_progress=overall_progress,
        )

    @staticmethod
    def get_tips(
        db: Session,
        language_id: int,
    ) -> list[DidYouKnowItem]:

        return [
            DidYouKnowItem(
                didyouknow_id=row.didyouknow_id,
                text=row.didyouknow_text,
                image_url=row.image_url,
                language_id=row.language_id,
            )
            for row in DashboardRepository.list_tips(
                db=db,
                language_id=language_id,
            )
        ]
