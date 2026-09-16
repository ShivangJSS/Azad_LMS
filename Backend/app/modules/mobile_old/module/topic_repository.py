from typing import Optional

from sqlalchemy import String, and_, cast
from sqlalchemy.orm import Session

from app.modules.mobile.module.constants import (
    DOC_TYPE_PDF,
    DOC_TYPE_PPT,
    DOC_TYPE_VIDEO,
    MAPPING_ACTIVE_STATUS,
)
from app.modules.mobile.module.model import (
    DocumentMaster,
    ModuleMaster,
    PdfMaster,
    PptMaster,
    TopicMapping,
    TopicMaster,
    VideoMaster,
)


class TopicRepository:
    """
    Database access for the topics and documents that sit inside a module.
    """

    @staticmethod
    def get_parent_module_id(
        db: Session,
        module_id: int,
    ) -> Optional[int]:
        """
        topic_mapping is only populated for the canonical module of each
        language group, which is module_masters.parent_id.
        """

        return (
            db.query(ModuleMaster.parent_id)
            .filter(
                ModuleMaster.module_id == module_id,
                ModuleMaster.deleted_at.is_(None),
            )
            .scalar()
        )

    @staticmethod
    def get_module_overview(db: Session, module_id: int):
        """
        The module's own content — what the LMS calls the main content of the
        module — shown above its topic list.
        """

        return (
            db.query(
                ModuleMaster.module_id,
                ModuleMaster.module_name,
                ModuleMaster.module_description,
                ModuleMaster.module_overview,
                ModuleMaster.module_objective,
                cast(ModuleMaster.module_duration, String).label("duration"),
                cast(ModuleMaster.module_type, String).label("module_type"),
                ModuleMaster.module_icon,
                ModuleMaster.icon_images,
                ModuleMaster.main_content_of_the_module,
                ModuleMaster.post_session_assessment,
            )
            .filter(
                ModuleMaster.module_id == module_id,
                ModuleMaster.deleted_at.is_(None),
            )
            .first()
        )

    @staticmethod
    def list_module_topics(
        db: Session,
        parent_module_id: int,
        language_id: int,
    ):
        """
        Topics of a module with the document attached to each one.

        Topics and documents carry one row per language, grouped by their
        parent_id in the same way modules are, so the mapping is resolved
        against the canonical id and then translated into `language_id`.
        """

        return (
            db.query(
                TopicMaster.topic_id,
                TopicMaster.topic_name,
                DocumentMaster.doc_id,
                DocumentMaster.doc_title,
                DocumentMaster.doc_type,
                cast(
                    DocumentMaster.doc_duration,
                    String,
                ).label("doc_duration"),
                DocumentMaster.doc_image,
                DocumentMaster.doc_file,
                PdfMaster.pdf_url,
                PptMaster.ppt_url,
                VideoMaster.video_url,
                VideoMaster.youtube_url,
            )
            .select_from(TopicMapping)
            .join(
                TopicMaster,
                and_(
                    TopicMaster.parent_id == TopicMapping.topic_id,
                    TopicMaster.language_id == language_id,
                ),
            )
            .outerjoin(
                DocumentMaster,
                and_(
                    DocumentMaster.parent_id == TopicMapping.doc_id,
                    DocumentMaster.language_id == language_id,
                    DocumentMaster.deleted_at.is_(None),
                ),
            )
            .outerjoin(
                PdfMaster,
                and_(
                    DocumentMaster.doc_type == DOC_TYPE_PDF,
                    PdfMaster.pdf_id == DocumentMaster.doc_ref_id,
                ),
            )
            .outerjoin(
                PptMaster,
                and_(
                    DocumentMaster.doc_type == DOC_TYPE_PPT,
                    PptMaster.ppt_id == DocumentMaster.doc_ref_id,
                ),
            )
            .outerjoin(
                VideoMaster,
                and_(
                    DocumentMaster.doc_type == DOC_TYPE_VIDEO,
                    VideoMaster.video_id == DocumentMaster.doc_ref_id,
                ),
            )
            .filter(
                TopicMapping.module_id == parent_module_id,
                TopicMapping.status == MAPPING_ACTIVE_STATUS,
            )
            .order_by(TopicMapping.topic_mapping_id)
            .all()
        )

    @staticmethod
    def list_participant_content_paths(db: Session, participant_id: int) -> list[str]:
        """Return media paths belonging to modules assigned to a participant."""
        assigned_module_rows = (
            db.query(ModuleMaster.module_id, ModuleMaster.parent_id)
            .join(
                ParticipantModule,
                ParticipantModule.module_id == ModuleMaster.module_id,
            )
            .filter(
                ParticipantModule.participant_id == participant_id,
                ModuleMaster.deleted_at.is_(None),
            )
            .all()
        )

        module_ids = {
            module_id
            for module_id, parent_id in assigned_module_rows
            for module_id in (module_id, parent_id)
            if module_id is not None
        }
        if not module_ids:
            return []

        rows = (
            db.query(
                DocumentMaster.doc_file,
                PdfMaster.pdf_url,
                PptMaster.ppt_url,
                VideoMaster.video_url,
            )
            .select_from(TopicMapping)
            .join(
                DocumentMaster,
                and_(
                    DocumentMaster.parent_id == TopicMapping.doc_id,
                    DocumentMaster.deleted_at.is_(None),
                ),
            )
            .outerjoin(
                PdfMaster,
                and_(
                    DocumentMaster.doc_type == DOC_TYPE_PDF,
                    PdfMaster.pdf_id == DocumentMaster.doc_ref_id,
                ),
            )
            .outerjoin(
                PptMaster,
                and_(
                    DocumentMaster.doc_type == DOC_TYPE_PPT,
                    PptMaster.ppt_id == DocumentMaster.doc_ref_id,
                ),
            )
            .outerjoin(
                VideoMaster,
                and_(
                    DocumentMaster.doc_type == DOC_TYPE_VIDEO,
                    VideoMaster.video_id == DocumentMaster.doc_ref_id,
                ),
            )
            .filter(
                TopicMapping.module_id.in_(module_ids),
                TopicMapping.status == MAPPING_ACTIVE_STATUS,
            )
            .all()
        )

        return [
            path
            for row in rows
            for path in (row.doc_file, row.pdf_url, row.ppt_url, row.video_url)
            if path
        ]
