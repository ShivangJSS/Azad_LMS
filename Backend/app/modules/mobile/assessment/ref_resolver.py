"""
Resolves assessment questions strictly from the mappings
configured for the requested module.

Flow:
    module
        -> post_session_assessment
        -> assessment_mapping
        -> question/reference IDs

No parent/sibling module fallback is allowed.
"""

from sqlalchemy.orm import Session

from app.modules.mobile.assessment.constants import ACTIVE
from app.modules.mobile.assessment.model import (
    AssessmentMapping,
    PostSessionAssessment,
)


# def _mapped_refs(
#     db: Session,
#     module_ids: list[int],
#     assessment_type: str,
# ) -> list[int]:
#     """
#     Return ONLY active question/reference IDs mapped
#     to the exact requested module.
#     """

#     if not module_ids:
#         return []

#     rows = (
#         db.query(AssessmentMapping.assessment_ref_id)
#         .join(
#             PostSessionAssessment,
#             PostSessionAssessment.assessment_id
#             == AssessmentMapping.assessment_id,
#         )
#         .filter(
#             # EXACT module only
#             PostSessionAssessment.module_id.in_(module_ids),

#             # Assessment active and not deleted
#             PostSessionAssessment.is_active == ACTIVE,
#             PostSessionAssessment.deleted_at.is_(None),

#             # Exact assessment type
#             AssessmentMapping.assessment_type == assessment_type,

#             # Mapping active
#             AssessmentMapping.is_active == ACTIVE,

#             # Valid question/reference
#             AssessmentMapping.assessment_ref_id.isnot(None),
#         )
#         .distinct()
#         .all()
#     )

#     return [
#         int(row.assessment_ref_id)
#         for row in rows
#         if row.assessment_ref_id is not None
#     ]

def _mapped_refs(
    db: Session,
    module_ids: list[int],
    assessment_type: str,
) -> list[int]:
    """
    Return ONLY active question/reference IDs from the
    first active post-session assessment of the requested module.

    Web currently uses postAssessments[0], so Mobile must use
    the same assessment source.
    """

    if not module_ids:
        return []

    # Web uses the first post-session assessment.
    assessment_row = (
        db.query(PostSessionAssessment.assessment_id)
        .filter(
            PostSessionAssessment.module_id.in_(module_ids),
            PostSessionAssessment.is_active == ACTIVE,
            PostSessionAssessment.deleted_at.is_(None),
        )
        .order_by(PostSessionAssessment.assessment_id.asc())
        .first()
    )

    if assessment_row is None:
        return []

    assessment_id = assessment_row.assessment_id

    rows = (
        db.query(AssessmentMapping.assessment_ref_id)
        .filter(
            AssessmentMapping.assessment_id == assessment_id,
            AssessmentMapping.assessment_type == assessment_type,
            AssessmentMapping.is_active == ACTIVE,
            AssessmentMapping.assessment_ref_id.isnot(None),
        )
        .distinct()
        .all()
    )

    return [
        int(row.assessment_ref_id)
        for row in rows
        if row.assessment_ref_id is not None
    ]
def ref_ids(
    db: Session,
    module_id: int,
    assessment_type: str,
) -> tuple[list[int], bool]:
    """
    Get mappings for the requested module ONLY.

    borrowed is always False because mappings are never
    borrowed from parent or sibling modules.
    """

    ids = _mapped_refs(
        db=db,
        module_ids=[module_id],
        assessment_type=assessment_type,
    )

    return ids, False


def in_language(
    db: Session,
    model,
    pk,
    ids: list[int],
    language_id: int,
):
    """
    Resolve already-mapped question IDs to the requested language.

    This function NEVER decides which questions are configured.
    It only resolves the language version of the IDs supplied
    by AssessmentMapping.
    """

    if not ids:
        return []

    column = pk.key

    # Only configured/mapped IDs can enter this function.
    seeds = (
        db.query(model)
        .filter(
            pk.in_(ids),
            model.deleted_at.is_(None),
        )
        .all()
    )

    if not seeds:
        return []

    # Logical/base question IDs
    bases = {
        row.parent_id or getattr(row, column)
        for row in seeds
    }

    if not bases:
        return []

    # Requested language
    variants = (
        db.query(model)
        .filter(
            model.parent_id.in_(bases),
            model.language_id == language_id,
            model.status == ACTIVE,
            model.deleted_at.is_(None),
        )
        .all()
    )

    chosen: dict[int, object] = {}

    for row in variants:
        logical_id = row.parent_id or getattr(row, column)
        chosen.setdefault(logical_id, row)

    # No translation -> use mapped base question
    missing = bases - set(chosen)

    if missing:
        base_rows = (
            db.query(model)
            .filter(
                pk.in_(missing),
                model.status == ACTIVE,
                model.deleted_at.is_(None),
            )
            .all()
        )

        for row in base_rows:
            logical_id = getattr(row, column)
            chosen.setdefault(logical_id, row)

    return [
        chosen[base]
        for base in sorted(chosen)
        if base in chosen
    ]