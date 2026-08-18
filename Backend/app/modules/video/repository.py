from datetime import datetime

from sqlalchemy import or_, func
from sqlalchemy.orm import Session

from app.modules.document.model import VideoMaster, LanguageMaster


class VideoRepository:
    """Data access for the standalone VIDEO (video_masters) feature.

    Reuses the existing VideoMaster + LanguageMaster models from the
    document module — no new tables/models are introduced.
    """

    # ---------------------------------------------------------
    # List (active VIDEOs) with search + pagination
    # ---------------------------------------------------------

    @staticmethod
    def _base_active_query(db: Session):
        return (
            db.query(
                VideoMaster.video_id,
                VideoMaster.video_name,
                VideoMaster.video_description,
                VideoMaster.video_url,
                VideoMaster.youtube_url,
                VideoMaster.language_id,
                LanguageMaster.language_name,
                VideoMaster.status,
            )
            .outerjoin(
                LanguageMaster,
                LanguageMaster.language_id == VideoMaster.language_id,
            )
            .filter(VideoMaster.deleted_at.is_(None))
        )

    @staticmethod
    def list_videos(db: Session, search, skip, limit):
        query = VideoRepository._base_active_query(db)

        if search:
            like = f"%{search}%"
            query = query.filter(
                or_(
                    VideoMaster.video_name.ilike(like),
                    VideoMaster.video_description.ilike(like),
                )
            )

        total = query.count()

        rows = (
            query.order_by(VideoMaster.video_id.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        return rows, total

    @staticmethod
    def list_all_for_export(db: Session, search):
        rows, _ = VideoRepository.list_videos(db, search, 0, 1_000_000)
        return rows

    # ---------------------------------------------------------
    # Detail
    # ---------------------------------------------------------

    @staticmethod
    def get_video(db: Session, video_id: int):
        return (
            db.query(
                VideoMaster.video_id,
                VideoMaster.video_unique_id,
                VideoMaster.video_name,
                VideoMaster.video_description,
                VideoMaster.video_url,
                VideoMaster.youtube_url,
                VideoMaster.language_id,
                LanguageMaster.language_name,
                VideoMaster.status,
                VideoMaster.created_at,
                VideoMaster.updated_at,
            )
            .outerjoin(
                LanguageMaster,
                LanguageMaster.language_id == VideoMaster.language_id,
            )
            .filter(
                VideoMaster.video_id == video_id,
                VideoMaster.deleted_at.is_(None),
            )
            .first()
        )

    # ---------------------------------------------------------
    # Create
    # ---------------------------------------------------------

    @staticmethod
    def create_video(db: Session, data: dict):
        # video_masters was migrated from Laravel and may not have a PK
        # sequence, so assign the next id explicitly (max + 1).
        max_id = db.query(func.max(VideoMaster.video_id)).scalar() or 0

        video = VideoMaster(
            video_id=max_id + 1,
            video_unique_id=data.get("video_unique_id"),
            video_name=data.get("video_name"),
            video_description=data.get("video_description"),
            video_url=data.get("video_url"),
            youtube_url=data.get("youtube_url"),
            language_id=data.get("language_id"),
            status=data.get("status", 1),
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )

        db.add(video)
        db.commit()
        db.refresh(video)

        return video

    # ---------------------------------------------------------
    # Update
    # ---------------------------------------------------------

    @staticmethod
    def update_video(db: Session, video_id: int, data: dict):
        video = (
            db.query(VideoMaster)
            .filter(
                VideoMaster.video_id == video_id,
                VideoMaster.deleted_at.is_(None),
            )
            .first()
        )

        if not video:
            return None

        for field in (
            "video_name",
            "video_description",
            "video_url",
            "youtube_url",
            "language_id",
            "status",
        ):
            if field in data and data[field] is not None:
                setattr(video, field, data[field])

        video.updated_at = datetime.now()

        db.commit()
        db.refresh(video)

        return video

    # ---------------------------------------------------------
    # Soft delete
    # ---------------------------------------------------------

    @staticmethod
    def soft_delete_video(db: Session, video_id: int):
        video = (
            db.query(VideoMaster)
            .filter(
                VideoMaster.video_id == video_id,
                VideoMaster.deleted_at.is_(None),
            )
            .first()
        )

        if not video:
            return None

        video.deleted_at = datetime.now()
        video.status = 0

        db.commit()

        return video

    # ---------------------------------------------------------
    # Archived versions
    #
    # There is no dedicated versioning table yet, so "archived
    # versions" are the soft-deleted rows sharing the same
    # video_unique_id as the current VIDEO. Empty until any exist.
    # ---------------------------------------------------------

    @staticmethod
    def get_archived_versions(db: Session, video_id: int):
        current = (
            db.query(VideoMaster)
            .filter(VideoMaster.video_id == video_id)
            .first()
        )

        if not current:
            return []

        query = (
            db.query(
                VideoMaster.video_id,
                VideoMaster.video_name,
                VideoMaster.video_description,
                VideoMaster.video_url,
                VideoMaster.youtube_url,
                VideoMaster.language_id,
                LanguageMaster.language_name,
                VideoMaster.created_at,
            )
            .outerjoin(
                LanguageMaster,
                LanguageMaster.language_id == VideoMaster.language_id,
            )
            .filter(VideoMaster.deleted_at.isnot(None))
        )

        if current.video_unique_id:
            query = query.filter(
                VideoMaster.video_unique_id == current.video_unique_id
            )

        return query.order_by(VideoMaster.video_id.desc()).all()
