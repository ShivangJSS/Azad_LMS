"""
Moves module progress once an assessment is passed.
"""

from app.modules.mobile.assessment.answer_repository import AnswerRepository
from app.modules.mobile.module.constants import (
    LOCK_STATUS_ACTIVE,
    LOCK_STATUS_COMPLETED,
)
from app.modules.mobile.module.topic_repository import TopicRepository


def complete_and_unlock(db, participant_id: int, module_id: int):
    """
    Marks the module completed and opens the next locked one.

    Returns (module_completed, next_module_id, next_module_name).
    """

    parent_id = TopicRepository.get_parent_module_id(
        db=db,
        module_id=module_id,
    )

    if parent_id is None:
        parent_id = module_id

    AnswerRepository.set_lock_status_for_group(
        db=db,
        participant_id=participant_id,
        parent_module_id=parent_id,
        lock_status=LOCK_STATUS_COMPLETED,
    )

    groups = AnswerRepository.list_participant_module_groups(
        db=db,
        participant_id=participant_id,
    )

    # Compute the current group id: for the module we just completed,
    # the group id is the parent_id if it exists, otherwise the module_id itself.
    current_group_id = parent_id if parent_id is not None else module_id

    seen_current = False

    for group in groups:
        if group.group_id == current_group_id:
            seen_current = True
            continue

        if not seen_current or group.lock_status == LOCK_STATUS_COMPLETED:
            continue

        if group.lock_status == LOCK_STATUS_ACTIVE:
            # Already open — nothing to unlock.
            return True, group.group_id, group.module_name

        AnswerRepository.set_lock_status_for_group(
            db=db,
            participant_id=participant_id,
            parent_module_id=group.group_id,
            lock_status=LOCK_STATUS_ACTIVE,
        )

        return True, group.group_id, group.module_name

    return True, None, None
