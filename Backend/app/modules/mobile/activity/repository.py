"""
Database access for activity logging and post-video questions.

The three log tables have no id sequence in this database, so `_next_id`
allocates the next id as ``max(id) + 1`` — the same approach the assessment
feature already uses for attempt ids. It is taken inside the request's
transaction, immediately before the insert.
"""

from collections import defaultdict
from datetime import datetime

from sqlalchemy import func, text
from sqlalchemy.orm import Session

from app.modules.mobile.activity.model import (
    ParticipantTimeSpentLog,
    PostVideoQuestionScore,
    VideoQuestion,
)
from app.modules.mobile.assessment.constants import ACTIVE
from app.modules.mobile.assessment.model import (
    McqMaster,
    McqQuestionOption,
    ScqMaster,
    ScqQuestionOption,
)
from app.modules.mobile.assessment.ref_resolver import in_language

_TYPE_MCQ = "MCQ"
_TYPE_SCQ = "SCQ"


def _next_id(db: Session, model) -> int:
    current = db.query(func.coalesce(func.max(model.id), 0)).scalar()
    return int(current or 0) + 1


def _next_id_table(db: Session, table: str) -> int:
    """
    Next id for a table addressed by name rather than model — used for
    time_spent_module_log, whose model lives outside this package.
    """

    current = db.execute(text(f"SELECT COALESCE(MAX(id), 0) FROM {table}")).scalar()
    return int(current or 0) + 1


class ActivityRepository:

    # ---------------- writes ----------------

    @staticmethod
    def add_time_spent(
        db: Session,
        participant_id: int,
        minutes: int,
    ) -> int:
        row = ParticipantTimeSpentLog(
            id=_next_id(db, ParticipantTimeSpentLog),
            participant_id=participant_id,
            time_spent_in_minutes=minutes,
            created_at=datetime.now(),
        )
        db.add(row)
        db.commit()
        return row.id

    @staticmethod
    def add_module_time(
        db: Session,
        user_id: int,
        module_id: int,
        topic_id: int,
        document_id: int,
        time_taken: int,
    ) -> int:
        # time_spent_module_log's model lives outside this package and does not
        # map created_at, so both the id and the insert are written explicitly
        # here — keeping the activity feature independent of that model.
        new_id = _next_id_table(db, "time_spent_module_log")

        db.execute(
            text(
                "INSERT INTO time_spent_module_log "
                "(id, user_id, module_id, topic_id, document_id, "
                " time_taken, created_at) "
                "VALUES (:id, :user_id, :module_id, :topic_id, "
                " :document_id, :time_taken, :created_at)"
            ),
            {
                "id": new_id,
                "user_id": user_id,
                "module_id": module_id,
                "topic_id": topic_id,
                "document_id": document_id,
                "time_taken": time_taken,
                "created_at": datetime.now(),
            },
        )
        db.commit()
        return new_id

    @staticmethod
    def add_video_answers(
        db: Session,
        participant_id: int,
        video_id: int,
        topic_id: int,
        module_id: int,
        answers: list[tuple[int, int]],
    ) -> int:
        now = datetime.now()
        next_id = _next_id(db, PostVideoQuestionScore)

        for offset, (question_id, option_id) in enumerate(answers):
            db.add(
                PostVideoQuestionScore(
                    id=next_id + offset,
                    video_id=video_id,
                    topic_id=topic_id,
                    module_id=module_id,
                    participant_id=participant_id,
                    question_id=question_id,
                    option_id=option_id,
                    created_at=now,
                )
            )

        db.commit()
        return len(answers)

    # ---------------- read: a video's questions ----------------

    @staticmethod
    def video_questions(db: Session, video_id: int, language_id: int):
        """
        The active questions attached to a video, each resolved into the
        requested language and returned with its options. Mirrors the shape the
        old topic endpoint embedded under every video.
        """

        links = (
            db.query(VideoQuestion.question_id, VideoQuestion.question_type)
            .filter(
                VideoQuestion.video_id == video_id,
                VideoQuestion.is_active == ACTIVE,
                VideoQuestion.deleted_at.is_(None),
            )
            .all()
        )

        mcq_ids = [
            row.question_id
            for row in links
            if (row.question_type or "").upper() == _TYPE_MCQ
        ]
        scq_ids = [
            row.question_id
            for row in links
            if (row.question_type or "").upper() == _TYPE_SCQ
        ]

        out = []
        out += ActivityRepository._mcq_items(db, mcq_ids, language_id)
        out += ActivityRepository._scq_items(db, scq_ids, language_id)
        return out

    @staticmethod
    def _mcq_items(db: Session, ids: list[int], language_id: int):
        rows = in_language(db, McqMaster, McqMaster.mcq_id, ids, language_id)
        if not rows:
            return []

        options = ActivityRepository._options(
            db,
            McqQuestionOption,
            McqQuestionOption.mcq_id,
            [r.mcq_id for r in rows],
        )

        return [
            {
                "type": _TYPE_MCQ,
                "question_id": r.mcq_id,
                "question_title": r.mcq_question_title,
                "question_description": r.mcq_question_description,
                "marks": float(r.marks or 1),
                "options": [
                    {
                        "option_id": o.mcq_option_id,
                        "option_text": o.mcq_option_text,
                        "is_correct": o.is_mcq_option_correct == 1,
                    }
                    for o in options.get(r.mcq_id, [])
                ],
            }
            for r in rows
        ]

    @staticmethod
    def _scq_items(db: Session, ids: list[int], language_id: int):
        rows = in_language(db, ScqMaster, ScqMaster.scq_id, ids, language_id)
        if not rows:
            return []

        options = ActivityRepository._options(
            db,
            ScqQuestionOption,
            ScqQuestionOption.scq_id,
            [r.scq_id for r in rows],
        )

        return [
            {
                "type": _TYPE_SCQ,
                "question_id": r.scq_id,
                "question_title": r.scq_question_title,
                "question_description": r.scq_question_description,
                "marks": float(r.marks or 1),
                "options": [
                    {
                        "option_id": o.scq_option_id,
                        "option_text": o.scq_option_text,
                        "is_correct": o.is_scq_option_correct == 1,
                    }
                    for o in options.get(r.scq_id, [])
                ],
            }
            for r in rows
        ]

    @staticmethod
    def _options(db: Session, model, fk, question_ids: list[int]):
        if not question_ids:
            return {}

        rows = (
            db.query(model)
            .filter(
                fk.in_(question_ids),
                model.status == ACTIVE,
                model.deleted_at.is_(None),
            )
            .order_by(fk)
            .all()
        )

        grouped = defaultdict(list)
        for row in rows:
            grouped[getattr(row, fk.key)].append(row)
        return grouped
