"""
Moves module progress once an assessment is passed.
"""

from app.modules.mobile.assessment.answer_repository import AnswerRepository
from app.modules.mobile.assessment.model import ModuleMaster
from app.modules.mobile.module.constants import (
    LOCK_STATUS_ACTIVE,
    LOCK_STATUS_COMPLETED,
)
from app.modules.mobile.module.topic_repository import TopicRepository


def complete_and_unlock(db, participant_id: int, module_id: int):
    """
    Marks the module completed and opens the next locked one in the same module track.

    Returns (module_completed, next_module_id, next_module_name).
    """

    parent_id = TopicRepository.get_parent_module_id(
        db=db,
        module_id=module_id,
    )

    if parent_id is None:
        return False, None, None

    AnswerRepository.set_lock_status_for_group(
        db=db,
        participant_id=participant_id,
        parent_module_id=parent_id,
        lock_status=LOCK_STATUS_COMPLETED,
    )

    # Determine module_type and language_id of the completed module
    current_module = (
        db.query(ModuleMaster.module_type, ModuleMaster.language_id)
        .filter(
            ModuleMaster.module_id == module_id,
            ModuleMaster.deleted_at.is_(None),
        )
        .first()
    )

    module_type = current_module.module_type if current_module else None
    language_id = current_module.language_id if current_module else None

    # List groups belonging to the same module_type track
    groups = AnswerRepository.list_participant_module_groups(
        db=db,
        participant_id=participant_id,
        module_type=str(module_type) if module_type is not None else None,
    )

    seen_current = False

    for group in groups:
        if group.parent_id == parent_id:
            seen_current = True
            continue

        if not seen_current or group.lock_status == LOCK_STATUS_COMPLETED:
            continue

        # Resolve next module ID and name in the participant's language if possible
        next_id = None
        next_name = group.module_name

        if language_id:
            lang_row = (
                db.query(ModuleMaster.module_id, ModuleMaster.module_name)
                .filter(
                    ModuleMaster.parent_id == group.parent_id,
                    ModuleMaster.language_id == language_id,
                    ModuleMaster.deleted_at.is_(None),
                )
                .first()
            )
            if lang_row:
                next_id = lang_row.module_id
                next_name = lang_row.module_name

        if next_id is None:
            next_id = group.parent_id

        if group.lock_status == LOCK_STATUS_ACTIVE:
            # Already open — nothing to unlock.
            return True, next_id, next_name

        AnswerRepository.set_lock_status_for_group(
            db=db,
            participant_id=participant_id,
            parent_module_id=group.parent_id,
            lock_status=LOCK_STATUS_ACTIVE,
        )

        return True, next_id, next_name

    return True, None, None
