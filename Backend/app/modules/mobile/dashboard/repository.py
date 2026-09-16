from sqlalchemy import Integer, case, cast, distinct, func
from sqlalchemy.orm import Session

from app.modules.mobile.dashboard.model import (
    DidYouKnow,
    McqQuestionOption,
    ModuleMaster,
    ParticipantMcq,
    ParticipantModule,
    ParticipantScq,
    ScqQuestionOption,
    TimeSpentModuleLog,
)
from app.modules.mobile.module.constants import (
    ACTIVE_STATUS,
    LOCK_STATUS_COMPLETED,
)


class DashboardRepository:
    """
    Repository responsible only for database operations.
    """

    @staticmethod
    def count_modules(
        db: Session,
        participant_id: int,
    ) -> tuple[int, int]:
        """
        Return (completed, total) modules for a participant.

        ``participant_module`` carries one row per language variant, so both
        counts are taken over ``module_masters.parent_id`` — the column that
        groups the language variants of the same module.
        """

        row = (
            db.query(
                func.count(
                    distinct(ModuleMaster.parent_id)
                ).label("total"),
                func.count(
                    distinct(
                        case(
                            (
                                ParticipantModule.lock_status
                                == LOCK_STATUS_COMPLETED,
                                ModuleMaster.parent_id,
                            ),
                            else_=None,
                        )
                    )
                ).label("completed"),
            )
            .join(
                ParticipantModule,
                ParticipantModule.module_id == ModuleMaster.module_id,
            )
            .filter(
                ParticipantModule.participant_id == participant_id,
                ModuleMaster.deleted_at.is_(None),
                ModuleMaster.status == ACTIVE_STATUS,
            )
            .one()
        )

        return int(row.completed or 0), int(row.total or 0)

    @staticmethod
    def total_time_spent_seconds(
        db: Session,
        participant_id: int,
    ) -> int:
        """
        ``time_spent_module_log.user_id`` holds a participant_id.
        """

        value = (
            db.query(
                func.coalesce(
                    func.sum(TimeSpentModuleLog.time_taken),
                    0,
                )
            )
            .filter(TimeSpentModuleLog.user_id == participant_id)
            .scalar()
        )

        return int(value or 0)

    @staticmethod
    def list_tips(db: Session, language_id: int):
        """
        Active "Did You Know" tips. is_active is a varchar in this table.
        """

        return (
            db.query(
                DidYouKnow.didyouknow_id,
                DidYouKnow.didyouknow_text,
                DidYouKnow.image_url,
                DidYouKnow.language_id,
            )
            .filter(
                DidYouKnow.language_id == language_id,
                DidYouKnow.is_active == "1",
            )
            .order_by(DidYouKnow.didyouknow_id)
            .all()
        )

    @staticmethod
    def count_mcq_answers(
        db: Session,
        participant_id: int,
    ) -> tuple[int, int]:
        """
        Return (correct, attempted) MCQ options.

        ``participant_mcqs.correct_option`` is never populated by the LMS, so
        correctness is resolved through the option master instead. Deleted
        options are not excluded: most historical options carry a deleted_at
        and excluding them would score every past attempt as zero.
        """

        row = (
            db.query(
                func.count().label("attempted"),
                func.coalesce(
                    func.sum(McqQuestionOption.is_mcq_option_correct),
                    0,
                ).label("correct"),
            )
            .select_from(ParticipantMcq)
            .join(
                McqQuestionOption,
                McqQuestionOption.mcq_option_id
                == cast(ParticipantMcq.option_selected, Integer),
            )
            .filter(
                ParticipantMcq.participant_id == participant_id,
                ParticipantMcq.is_active == ACTIVE_STATUS,
            )
            .one()
        )

        return int(row.correct or 0), int(row.attempted or 0)

    @staticmethod
    def count_scq_answers(
        db: Session,
        participant_id: int,
    ) -> tuple[int, int]:
        """
        Return (correct, attempted) SCQ options.
        """

        row = (
            db.query(
                func.count().label("attempted"),
                func.coalesce(
                    func.sum(ScqQuestionOption.is_scq_option_correct),
                    0,
                ).label("correct"),
            )
            .select_from(ParticipantScq)
            .join(
                ScqQuestionOption,
                ScqQuestionOption.scq_option_id
                == cast(ParticipantScq.option_selected, Integer),
            )
            .filter(
                ParticipantScq.participant_id == participant_id,
                ParticipantScq.is_active == ACTIVE_STATUS,
            )
            .one()
        )

        return int(row.correct or 0), int(row.attempted or 0)
