from typing import Optional

from sqlalchemy import String, cast
from sqlalchemy.orm import Session

from app.modules.mobile.module.constants import ACTIVE_STATUS
from app.modules.mobile.module.model import (
    LanguageMaster,
    ModuleMaster,
    ModuleType,
    ParticipantModule,
)


class MobileModuleRepository:
    """
    Repository responsible only for database operations.

    Topic and document queries live in topic_repository.py.
    """

    @staticmethod
    def list_participant_modules(
        db: Session,
        participant_id: int,
        language_id: int,
        module_type: Optional[int] = None,
    ):
        """
        Modules assigned to a participant, in a single language.

        ``module_masters`` holds one row per language, and
        ``participant_module`` holds one row per participant per language
        variant, so filtering on language_id already yields one row per
        module.
        """

        query = (
            db.query(
                ModuleMaster.module_id,
                ModuleMaster.parent_id,
                ModuleMaster.module_name,
                ModuleMaster.module_description,
                cast(
                    ModuleMaster.module_type,
                    String,
                ).label("module_type"),
                cast(
                    ModuleMaster.module_duration,
                    String,
                ).label("module_duration"),
                ModuleMaster.module_icon,
                ModuleMaster.icon_images,
                ModuleMaster.language_id,
                ParticipantModule.lock_status,
            )
            .join(
                ParticipantModule,
                ParticipantModule.module_id == ModuleMaster.module_id,
            )
            .filter(
                ParticipantModule.participant_id == participant_id,
                ModuleMaster.language_id == language_id,
                ModuleMaster.deleted_at.is_(None),
                ModuleMaster.status == ACTIVE_STATUS,
            )
        )

        if module_type is not None:
            query = query.filter(
                cast(
                    ModuleMaster.module_type,
                    String,
                ) == str(module_type)
            )

        return query.order_by(ModuleMaster.module_id).all()

    @staticmethod
    def list_module_types(db: Session):
        """
        Active module types, used to label each module.
        """

        return (
            db.query(
                ModuleType.module_type_id,
                ModuleType.module_type,
            )
            .filter(
                ModuleType.deleted_at.is_(None),
                ModuleType.status == ACTIVE_STATUS,
            )
            .order_by(ModuleType.module_type_id)
            .all()
        )

    @staticmethod
    def list_languages(db: Session):
        """
        Active languages the content is published in.
        """

        return (
            db.query(
                LanguageMaster.language_id,
                LanguageMaster.language_code,
                LanguageMaster.language_name,
            )
            .filter(
                LanguageMaster.deleted_at.is_(None),
                LanguageMaster.is_active == ACTIVE_STATUS,
            )
            .order_by(LanguageMaster.language_id)
            .all()
        )
