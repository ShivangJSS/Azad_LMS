from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.modules.mobile.assessment.routes import router as assessment_router
from app.modules.mobile.core.dependencies import get_current_participant
from app.modules.mobile.media.routes import router as media_router
from app.modules.mobile.profile.routes import router as profile_router
from app.modules.mobile.module.constants import DEFAULT_LANGUAGE_ID
from app.modules.mobile.module.schema import (
    LanguageItem,
    ModuleListResponse,
    ModuleTopicsResponse,
    ModuleTypeItem,
)
from app.modules.mobile.module.service import MobileModuleService
from app.modules.mobile.module.topic_service import TopicService

router = APIRouter(
    prefix="/mobile/module",
    tags=["Mobile Module"],
)

# Assessment and media ride on this router so they need no registration in
# main.py. Media is included first so its path never falls through to the
# {module_id} routes below.
router.include_router(media_router)
router.include_router(profile_router)
router.include_router(assessment_router)


@router.get(
    "/list",
    response_model=ModuleListResponse,
)
def list_modules(
    language_id: int = Query(
        default=DEFAULT_LANGUAGE_ID,
        ge=1,
        description="language_master.language_id (1 = English)",
    ),
    module_type: Optional[int] = Query(
        default=None,
        ge=1,
        description="module_type.module_type_id (1 = Technical)",
    ),
    participant=Depends(get_current_participant),
    db: Session = Depends(get_db),
):
    return MobileModuleService.list_modules(
        db=db,
        participant_id=participant.participant_id,
        language_id=language_id,
        module_type=module_type,
    )


@router.get(
    "/types",
    response_model=list[ModuleTypeItem],
)
def list_module_types(
    participant=Depends(get_current_participant),
    db: Session = Depends(get_db),
):
    return MobileModuleService.list_module_types(db=db)


@router.get(
    "/languages",
    response_model=list[LanguageItem],
)
def list_languages(
    participant=Depends(get_current_participant),
    db: Session = Depends(get_db),
):
    """
    Languages the participant can switch the app content to. Lives under the
    module prefix because language selection only affects module content.
    """
    return MobileModuleService.list_languages(db=db)


@router.get(
    "/{module_id}/topics",
    response_model=ModuleTopicsResponse,
)
def list_module_topics(
    module_id: int,
    language_id: int = Query(
        default=DEFAULT_LANGUAGE_ID,
        ge=1,
        description="language_master.language_id (1 = English)",
    ),
    participant=Depends(get_current_participant),
    db: Session = Depends(get_db),
):
    return TopicService.list_topics(
        db=db,
        module_id=module_id,
        language_id=language_id,
    )
