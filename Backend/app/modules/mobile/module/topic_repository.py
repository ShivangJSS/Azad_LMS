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
