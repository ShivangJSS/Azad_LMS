import re
from typing import Optional

from sqlalchemy.orm import Session

from app.modules.mobile.assessment.answer_repository import AnswerRepository
from app.modules.mobile.module.constants import (
    LOCK_STATUS_ACTIVE,
    LOCK_STATUS_COMPLETED,
    LOCK_STATUS_LOCKED,
    LOCK_STATUS_MAP,
    MODULE_STATUS_LOCKED,
)
from app.modules.mobile.module.repository import MobileModuleRepository
from app.modules.mobile.module.schema import (
    LanguageItem,
    ModuleListItem,
    ModuleListResponse,
    ModuleTypeItem,
)

_LEADING_NUMBER = re.compile(r"^\s*(\d+)\s*$")


def _to_minutes(value: Optional[str]) -> Optional[int]:
    """
    module_duration is a free-text column. Only plain numeric values are
    minutes; anything else ('45 Days') is left to the caller as a label.
    """

    if value is None:
        return None

    match = _LEADING_NUMBER.match(value)

    return int(match.group(1)) if match else None


def _to_int(value) -> Optional[int]:
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


class MobileModuleService:

    @staticmethod
    def list_modules(
        db: Session,
        participant_id: int,
        language_id: int,
        module_type: Optional[int] = None,
    ) -> ModuleListResponse:

        rows = MobileModuleRepository.list_participant_modules(
            db=db,
            participant_id=participant_id,
            language_id=language_id,
            module_type=module_type,
        )

        type_names = {
            str(row.module_type_id): row.module_type
            for row in MobileModuleRepository.list_module_types(db=db)
        }

        # Group rows by module_type to handle progression per track
        from collections import defaultdict

        grouped_by_type = defaultdict(list)
        for row in rows:
            grouped_by_type[row.module_type].append(row)

        # Enforce progression rules per track:
        # 1. The first module of each track is ALWAYS open (ACTIVE or COMPLETED).
        # 2. A subsequent module is only unlocked if the preceding module is COMPLETED.
        # 3. Synchronize database state if any lock_status needs self-healing.
        effective_statuses = {}
        db_dirty = False

        for m_type, m_rows in grouped_by_type.items():
            prev_completed = False
            for idx, row in enumerate(m_rows):
                if idx == 0:
                    # First module must ALWAYS be opened
                    if row.lock_status == LOCK_STATUS_COMPLETED:
                        eff_status = LOCK_STATUS_COMPLETED
                        prev_completed = True
                    else:
                        eff_status = LOCK_STATUS_ACTIVE
                        prev_completed = False
                        if row.lock_status != LOCK_STATUS_ACTIVE:
                            AnswerRepository.set_lock_status_for_group(
                                db=db,
                                participant_id=participant_id,
                                parent_module_id=row.parent_id,
                                lock_status=LOCK_STATUS_ACTIVE,
                            )
                            db_dirty = True
                else:
                    # Subsequent module: only open if immediately preceding module is completed
                    if prev_completed:
                        if row.lock_status == LOCK_STATUS_COMPLETED:
                            eff_status = LOCK_STATUS_COMPLETED
                            prev_completed = True
                        else:
                            eff_status = LOCK_STATUS_ACTIVE
                            prev_completed = False
                            if row.lock_status != LOCK_STATUS_ACTIVE:
                                AnswerRepository.set_lock_status_for_group(
                                    db=db,
                                    participant_id=participant_id,
                                    parent_module_id=row.parent_id,
                                    lock_status=LOCK_STATUS_ACTIVE,
                                )
                                db_dirty = True
                    else:
                        eff_status = LOCK_STATUS_LOCKED
                        prev_completed = False
                        if row.lock_status != LOCK_STATUS_LOCKED:
                            AnswerRepository.set_lock_status_for_group(
                                db=db,
                                participant_id=participant_id,
                                parent_module_id=row.parent_id,
                                lock_status=LOCK_STATUS_LOCKED,
                            )
                            db_dirty = True

                effective_statuses[row.module_id] = eff_status

        if db_dirty:
            db.commit()

        modules = []
        completed = 0

        for row in rows:
            eff_lock = effective_statuses.get(row.module_id, row.lock_status)

            if eff_lock == LOCK_STATUS_COMPLETED:
                completed += 1

            module_status = LOCK_STATUS_MAP.get(
                eff_lock,
                MODULE_STATUS_LOCKED,
            )

            modules.append(
                ModuleListItem(
                    module_id=row.module_id,
                    parent_id=row.parent_id,
                    module_name=row.module_name,
                    module_description=row.module_description,
                    module_type_id=_to_int(row.module_type),
                    module_type_name=type_names.get(row.module_type),
                    duration_minutes=_to_minutes(row.module_duration),
                    duration_label=row.module_duration,
                    module_icon=row.module_icon,
                    icon_images=row.icon_images,
                    language_id=row.language_id,
                    status=module_status,
                    is_locked=module_status == MODULE_STATUS_LOCKED,
                )
            )

        return ModuleListResponse(
            language_id=language_id,
            total=len(modules),
            completed=completed,
            modules=modules,
        )

    @staticmethod
    def list_module_types(db: Session) -> list[ModuleTypeItem]:

        return [
            ModuleTypeItem(
                module_type_id=row.module_type_id,
                module_type=row.module_type,
            )
            for row in MobileModuleRepository.list_module_types(db=db)
        ]

    @staticmethod
    def list_languages(db: Session) -> list[LanguageItem]:

        return [
            LanguageItem(
                language_id=row.language_id,
                language_code=row.language_code,
                language_name=row.language_name,
            )
            for row in MobileModuleRepository.list_languages(db=db)
        ]
