from datetime import datetime
from typing import Optional

from sqlalchemy import func, text
from sqlalchemy.orm import Session

from app.modules.mobile.assessment.constants import ACTIVE
from app.modules.mobile.assessment.model import (
    ModuleMaster,
    ParticipantDb,
    ParticipantMcq,
    ParticipantMm,
    ParticipantModule,
)


class AnswerRepository:
    """
    Writes participant answers and moves module progress.
    """

    @staticmethod
    def next_attempt_id(db: Session, participant_id: int) -> int:
        current = (
            db.query(func.coalesce(func.max(ParticipantMcq.attempt_id), 0))
            .filter(ParticipantMcq.participant_id == participant_id)
            .scalar()
        )

        return int(current or 0) + 1

    @staticmethod
    def save_mcq(db, participant_id, module_id, course_id, attempt_id, answers):
        now = datetime.now()

        for mcq_id, option_id in answers:
            db.add(
                ParticipantMcq(
                    participant_id=participant_id,
                    attempt_id=attempt_id,
                    course_id=course_id,
                    module_id=module_id,
                    mcq_id=mcq_id,
                    option_selected=str(option_id),
                    created_date=now,
                    is_active=ACTIVE,
                )
            )

    @staticmethod
    def save_scq(db, participant_id, module_id, attempt_id, answers):
        """
        Written with explicit SQL rather than the ORM.

        app/modules/centres/model.py declares ParticipantScq's primary key as
        `participant_scq_id`, but the real column is `participant_sc_id`, so
        an ORM insert emits a column that does not exist. That model is
        outside this module and is left untouched; reads elsewhere only ever
        select real columns, so they are unaffected.
        """

        if not answers:
            return

        now = datetime.now()

        statement = text(
            """
            INSERT INTO participant_scs (
                participant_id, module_id, attempt_id,
                single_choice_id, option_selected, created_date, is_active
            ) VALUES (
                :participant_id, :module_id, :attempt_id,
                :single_choice_id, :option_selected, :created_date, :is_active
            )
            """
        )

        for scq_id, option_id in answers:
            db.execute(
                statement,
                {
                    "participant_id": participant_id,
                    "module_id": module_id,
                    "attempt_id": attempt_id,
                    "single_choice_id": scq_id,
                    "option_selected": str(option_id),
                    "created_date": now,
                    "is_active": ACTIVE,
                },
            )

    @staticmethod
    def save_drop_bucket(
        db, participant_id, module_id, course_id, attempt_id, placements
    ):
        now = datetime.now()

        for item_id, bucket_id in placements:
            db.add(
                ParticipantDb(
                    participant_id=participant_id,
                    attempt_id=attempt_id,
                    # The column is misspelled "cource_id" in the database;
                    # the existing model already maps it to course_id.
                    course_id=course_id,
                    module_id=module_id,
                    bucket_id=bucket_id,
                    item_id=item_id,
                    created_date=now,
                    is_active=ACTIVE,
                )
            )

    @staticmethod
    def save_match_making(
        db, participant_id, module_id, course_id, attempt_id, pairs
    ):
        now = datetime.now()

        for question_id, left_id, right_id, is_correct in pairs:
            db.add(
                ParticipantMm(
                    participant_id=participant_id,
                    attempt_id=attempt_id,
                    course_id=course_id,
                    module_id=module_id,
                    question_id=question_id,
                    # These three are varchar columns in this table.
                    left_option=str(left_id),
                    right_option=str(right_id),
                    is_correct=str(1 if is_correct else 0),
                    created_date=now,
                    is_active=ACTIVE,
                )
            )

    # ---------------- progress ----------------

    @staticmethod
    def get_participant_module(
        db: Session,
        participant_id: int,
        module_id: int,
    ) -> Optional[ParticipantModule]:

        return (
            db.query(ParticipantModule)
            .filter(
                ParticipantModule.participant_id == participant_id,
                ParticipantModule.module_id == module_id,
            )
            .first()
        )

    @staticmethod
    def set_lock_status_for_group(
        db: Session,
        participant_id: int,
        parent_module_id: int,
        lock_status: int,
    ) -> None:
        """
        Applies to every language variant of the module, so progress is the
        same whichever language the participant is using.
        """

        module_ids = [
            row.module_id
            for row in db.query(ModuleMaster.module_id)
            .filter(ModuleMaster.parent_id == parent_module_id)
            .all()
        ]

        if not module_ids:
            return

        (
            db.query(ParticipantModule)
            .filter(
                ParticipantModule.participant_id == participant_id,
                ParticipantModule.module_id.in_(module_ids),
            )
            .update(
                {ParticipantModule.lock_status: lock_status},
                synchronize_session=False,
            )
        )

    @staticmethod
    def list_participant_module_groups(db: Session, participant_id: int):
        """
        One row per module group (parent_id) with its current lock status,
        ordered the way modules are presented.
        """

        return (
            db.query(
                ModuleMaster.parent_id.label("parent_id"),
                func.max(ParticipantModule.lock_status).label("lock_status"),
                func.min(ModuleMaster.module_name).label("module_name"),
            )
            .join(
                ParticipantModule,
                ParticipantModule.module_id == ModuleMaster.module_id,
            )
            .filter(
                ParticipantModule.participant_id == participant_id,
                ModuleMaster.deleted_at.is_(None),
            )
            .group_by(ModuleMaster.parent_id)
            .order_by(ModuleMaster.parent_id)
            .all()
        )
