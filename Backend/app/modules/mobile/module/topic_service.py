import re
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.mobile.module.constants import (
    DOC_TYPE_ORDER,
    DOC_TYPE_ORDER_FALLBACK,
)
from app.modules.mobile.module.schema import (
    ModuleOverview,
    ModuleTopicsResponse,
    TopicItem,
)
from app.modules.mobile.module.topic_repository import TopicRepository

_LEADING_NUMBER = re.compile(r"^\s*(\d+)\s*$")


def _to_minutes(value: Optional[str]) -> Optional[int]:
    if value is None:
        return None

    match = _LEADING_NUMBER.match(value)

    return int(match.group(1)) if match else None


def _content_path(row) -> Optional[str]:
    """
    The file is either stored directly on the document, or on the pdf/ppt/
    video master it points at through doc_ref_id.
    """

    for value in (
        row.doc_file,
        row.pdf_url,
        row.ppt_url,
        row.video_url,
    ):
        if value:
            return value

    return None


class TopicService:

    @staticmethod
    def list_topics(
        db: Session,
        module_id: int,
        language_id: int,
    ) -> ModuleTopicsResponse:

        parent_module_id = TopicRepository.get_parent_module_id(
            db=db,
            module_id=module_id,
        )

        if parent_module_id is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Module not found.",
            )

        rows = TopicRepository.list_module_topics(
            db=db,
            parent_module_id=parent_module_id,
            language_id=language_id,
        )

        # Video first, then presentations, then documents.
        rows = sorted(
            rows,
            key=lambda row: DOC_TYPE_ORDER.get(
                (row.doc_type or "").strip(),
                DOC_TYPE_ORDER_FALLBACK,
            ),
        )

        topics = [
            TopicItem(
                topic_id=row.topic_id,
                topic_name=row.topic_name,
                doc_id=row.doc_id,
                doc_title=row.doc_title,
                doc_type=row.doc_type,
                duration_minutes=_to_minutes(row.doc_duration),
                content_path=_content_path(row),
                youtube_url=row.youtube_url or None,
                thumbnail=row.doc_image,
            )
            for row in rows
        ]

        return ModuleTopicsResponse(
            module_id=module_id,
            language_id=language_id,
            total=len(topics),
            module=TopicService._overview(db=db, module_id=module_id),
            topics=topics,
        )

    @staticmethod
    def _overview(db: Session, module_id: int) -> Optional[ModuleOverview]:

        row = TopicRepository.get_module_overview(
            db=db,
            module_id=module_id,
        )

        if row is None:
            return None

        try:
            module_type_id = int(row.module_type)
        except (TypeError, ValueError):
            module_type_id = None

        return ModuleOverview(
            module_id=row.module_id,
            module_name=row.module_name,
            module_description=row.module_description,
            module_overview=row.module_overview,
            module_objective=row.module_objective,
            duration_minutes=_to_minutes(row.duration),
            duration_label=row.duration,
            module_type_id=module_type_id,
            module_icon=row.module_icon,
            icon_images=row.icon_images,
            has_main_content=row.main_content_of_the_module == 1,
            has_post_assessment=row.post_session_assessment == 1,
        )
