"""
Works out *which* questions a module's assessment is made of, and *in which
language* they should be served.

Those are two separate jobs, and the web LMS has always kept them separate:
the assessment is configured once per module group, against whichever language
variant the admin happened to have open, while the question text is picked per
request. A module that has no assessment rows of its own is therefore not
missing its assessment — it reads its siblings' through the shared parent.
"""

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.modules.mobile.assessment.constants import ACTIVE
from app.modules.mobile.assessment.model import (
    AssessmentMapping,
    ModuleMaster,
    PostSessionAssessment,
)


def _primary_assessment_id(db: Session, module_id: int) -> int | None:
    """
    Returns the primary active PostSessionAssessment for the module.
    This matches Web Admin behavior, which orders by assessment_id ascending
    and manages the primary container (assessments[0]).
    """
    row = (
        db.query(PostSessionAssessment.assessment_id)
        .filter(
            PostSessionAssessment.module_id == module_id,
            PostSessionAssessment.is_active == ACTIVE,
            PostSessionAssessment.deleted_at.is_(None),
        )
        .order_by(PostSessionAssessment.assessment_id.asc())
        .first()
    )
    return row[0] if row else None


def _mapped_refs(
    db: Session,
    module_ids: list[int],
    assessment_type: str,
) -> list[int]:
    """
    module -> post_session_assessment -> assessment_mapping -> ref id of the
    question, whichever kind it is.
    """

    if not module_ids:
        return []

    assessment_ids = []
    for mid in module_ids:
        aid = _primary_assessment_id(db, mid)
        if aid is not None:
            assessment_ids.append(aid)

    if not assessment_ids:
        return []

    rows = (
        db.query(AssessmentMapping.assessment_ref_id)
        .filter(
            AssessmentMapping.assessment_id.in_(assessment_ids),
            AssessmentMapping.assessment_type == assessment_type,
            AssessmentMapping.is_active == ACTIVE,
        )
        .distinct()
        .all()
    )

    return sorted({row.assessment_ref_id for row in rows if row.assessment_ref_id})



def _base_module(db: Session, module_id: int) -> int | None:
    """
    The module group's canonical row: a translation points at it through
    parent_id, and it points at itself.
    """

    row = (
        db.query(ModuleMaster.module_id, ModuleMaster.parent_id)
        .filter(ModuleMaster.module_id == module_id)
        .first()
    )

    return None if row is None else (row.parent_id or row.module_id)


def _module_family(db: Session, base: int, module_id: int) -> list[int]:
    """
    The module's sibling translations: everything sharing its parent, minus
    itself.
    """

    rows = (
        db.query(ModuleMaster.module_id)
        .filter(
            or_(
                ModuleMaster.parent_id == base,
                ModuleMaster.module_id == base,
            ),
            ModuleMaster.deleted_at.is_(None),
        )
        .all()
    )

    return sorted({r.module_id for r in rows if r.module_id != module_id})


def ref_ids(
    db: Session,
    module_id: int,
    assessment_type: str,
) -> tuple[list[int], bool]:
    """
    Returns (ref_ids, borrowed).

    In the Web LMS architecture, post-session assessment configuration is canonical
    on the base module (English): every language version of a module shares the primary
    assessment container of the base module. Questions are assigned to the base module
    and translated dynamically per language request.

    If the canonical base module has an active post-session assessment container,
    its configuration is authoritative across all language variants in the module family.
    Sibling/translation modules with legacy or stale assessment containers are bypassed so
    that newly assigned or updated questions on the Web Admin stay 100% in sync across all languages.
    """

    base = _base_module(db, module_id)

    # 1. Authoritative check on the canonical base module:
    if base is not None:
        base_assessment_id = _primary_assessment_id(db, base)
        if base_assessment_id is not None:
            ids = _mapped_refs(db, [base], assessment_type)
            return ids, (module_id != base)

    # 2. Standalone module without base assessment container: check module itself
    ids = _mapped_refs(db, [module_id], assessment_type)
    if ids:
        return ids, False

    # 3. Fallback to sibling family only if the base module has no assessment container
    if base is not None:
        family = _module_family(db, base, module_id)
        return _mapped_refs(db, family, assessment_type), True

    return [], False


def in_language(db: Session, model, pk, ids: list[int], language_id: int):
    """
    Swaps question ids for their counterpart in the requested language.

    Each id is resolved to its base (parent_id, else itself), the sibling
    carrying the requested language is taken, and the base row itself stands in
    wherever that translation has not been authored yet — so an untranslated
    question still renders instead of silently disappearing.
    """

    if not ids:
        return []

    column = pk.key

    seeds = (
        db.query(model)
        .filter(pk.in_(ids), model.deleted_at.is_(None))
        .all()
    )

    bases = {row.parent_id or getattr(row, column) for row in seeds}

    if not bases:
        return []

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

    # One row per logical question: borrowing from several siblings at once
    # otherwise yields the same question several times over.
    chosen: dict[int, object] = {}

    for row in variants:
        chosen.setdefault(row.parent_id or getattr(row, column), row)

    missing = bases - set(chosen)

    if missing:
        for row in (
            db.query(model)
            .filter(
                pk.in_(missing),
                model.status == ACTIVE,
                model.deleted_at.is_(None),
            )
            .all()
        ):
            chosen.setdefault(getattr(row, column), row)

    return [chosen[base] for base in sorted(chosen)]
