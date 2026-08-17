from sqlalchemy.orm import Session

from app.modules.mobile.assessment.constants import ACTIVE
from app.modules.mobile.assessment.model import (
    AssessmentMapping,
    DropBucket,
    DropBucketItem,
    DropBucketMaster,
    MatchCorrectAnswer,
    MatchLeftItem,
    MatchMakingMaster,
    MatchRightItem,
    McqMaster,
    McqQuestionOption,
    PostSessionAssessment,
    ScqMaster,
    ScqQuestionOption,
)


def _ref_ids(db: Session, module_id: int, assessment_type: str) -> list[int]:
    """
    module -> post_session_assessment -> assessment_mapping -> ref id of the
    question, whichever kind it is.
    """

    rows = (
        db.query(AssessmentMapping.assessment_ref_id)
        .select_from(PostSessionAssessment)
        .join(
            AssessmentMapping,
            (
                AssessmentMapping.assessment_id
                == PostSessionAssessment.assessment_id
            )
            & (AssessmentMapping.assessment_type == assessment_type)
            & (AssessmentMapping.is_active == ACTIVE),
        )
        .filter(
            PostSessionAssessment.module_id == module_id,
            PostSessionAssessment.is_active == ACTIVE,
            PostSessionAssessment.deleted_at.is_(None),
        )
        .distinct()
        .all()
    )

    return sorted({row.assessment_ref_id for row in rows if row.assessment_ref_id})


class QuestionRepository:
    """
    Reads the question banks. Only live rows are served: older option rows are
    kept soft-deleted alongside their replacements and must never be offered.
    """

    # ---------------- MCQ ----------------

    @staticmethod
    def mcq_questions(db: Session, module_id: int):
        ids = _ref_ids(db, module_id, "MCQ")

        if not ids:
            return []

        return (
            db.query(McqMaster)
            .filter(
                McqMaster.mcq_id.in_(ids),
                McqMaster.deleted_at.is_(None),
                McqMaster.status == ACTIVE,
            )
            .order_by(McqMaster.mcq_id)
            .all()
        )

    @staticmethod
    def mcq_options(db: Session, mcq_ids: list[int]):
        if not mcq_ids:
            return []

        return (
            db.query(McqQuestionOption)
            .filter(
                McqQuestionOption.mcq_id.in_(mcq_ids),
                McqQuestionOption.deleted_at.is_(None),
                McqQuestionOption.status == ACTIVE,
            )
            .order_by(
                McqQuestionOption.mcq_id,
                McqQuestionOption.mcq_option_id,
            )
            .all()
        )

    # ---------------- SCQ ----------------

    @staticmethod
    def scq_questions(db: Session, module_id: int):
        ids = _ref_ids(db, module_id, "SCQ")

        if not ids:
            return []

        return (
            db.query(ScqMaster)
            .filter(
                ScqMaster.scq_id.in_(ids),
                ScqMaster.deleted_at.is_(None),
                ScqMaster.status == ACTIVE,
            )
            .order_by(ScqMaster.scq_id)
            .all()
        )

    @staticmethod
    def scq_options(db: Session, scq_ids: list[int]):
        if not scq_ids:
            return []

        return (
            db.query(ScqQuestionOption)
            .filter(
                ScqQuestionOption.scq_id.in_(scq_ids),
                ScqQuestionOption.deleted_at.is_(None),
                ScqQuestionOption.status == ACTIVE,
            )
            .order_by(
                ScqQuestionOption.scq_id,
                ScqQuestionOption.scq_option_id,
            )
            .all()
        )

    # ---------------- Drop bucket ----------------

    @staticmethod
    def drop_bucket_questions(db: Session, module_id: int):
        ids = _ref_ids(db, module_id, "DB")

        if not ids:
            return []

        return (
            db.query(DropBucketMaster)
            .filter(
                DropBucketMaster.drop_bucket_id.in_(ids),
                DropBucketMaster.deleted_at.is_(None),
                DropBucketMaster.status == ACTIVE,
            )
            .order_by(DropBucketMaster.drop_bucket_id)
            .all()
        )

    @staticmethod
    def buckets(db: Session, drop_bucket_ids: list[int], language_id: int):
        """
        Unlike every other question bank, one drop_bucket_id owns buckets in
        all four languages, so the language filter is required here or the
        participant sees each bucket repeated four times.
        """

        if not drop_bucket_ids:
            return []

        return (
            db.query(DropBucket)
            .filter(
                DropBucket.drop_bucket_id.in_(drop_bucket_ids),
                DropBucket.language_id == language_id,
                DropBucket.deleted_at.is_(None),
                DropBucket.status == ACTIVE,
            )
            .order_by(DropBucket.bucket_id)
            .all()
        )

    @staticmethod
    def bucket_items(db: Session, bucket_ids: list[int], language_id: int):
        """
        An item's own bucket_id is the correct answer for that item.
        """

        if not bucket_ids:
            return []

        return (
            db.query(DropBucketItem)
            .filter(
                DropBucketItem.bucket_id.in_(bucket_ids),
                DropBucketItem.language_id == language_id,
                DropBucketItem.deleted_at.is_(None),
                DropBucketItem.status == ACTIVE,
            )
            .order_by(DropBucketItem.drop_bucket_item_id)
            .all()
        )

    # ---------------- Match making ----------------

    @staticmethod
    def match_questions(db: Session, module_id: int):
        ids = _ref_ids(db, module_id, "MM")

        if not ids:
            return []

        return (
            db.query(MatchMakingMaster)
            .filter(
                MatchMakingMaster.match_making_id.in_(ids),
                MatchMakingMaster.deleted_at.is_(None),
                MatchMakingMaster.status == ACTIVE,
            )
            .order_by(MatchMakingMaster.match_making_id)
            .all()
        )

    @staticmethod
    def match_sides(db: Session, match_ids: list[int]):
        if not match_ids:
            return [], [], []

        left = (
            db.query(MatchLeftItem)
            .filter(
                MatchLeftItem.match_making_id.in_(match_ids),
                MatchLeftItem.deleted_at.is_(None),
            )
            .order_by(MatchLeftItem.match_left_id)
            .all()
        )

        right = (
            db.query(MatchRightItem)
            .filter(
                MatchRightItem.match_making_id.in_(match_ids),
                MatchRightItem.deleted_at.is_(None),
            )
            .order_by(MatchRightItem.match_right_id)
            .all()
        )

        answers = (
            db.query(MatchCorrectAnswer)
            .filter(
                MatchCorrectAnswer.match_making_id.in_(match_ids),
                MatchCorrectAnswer.deleted_at.is_(None),
            )
            .all()
        )

        return left, right, answers
