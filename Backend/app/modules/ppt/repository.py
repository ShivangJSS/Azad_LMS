from datetime import datetime

from sqlalchemy import or_, func
from sqlalchemy.orm import Session

from app.modules.document.model import PptMaster, LanguageMaster


class PptRepository:
    """Data access for the standalone PPT (ppt_masters) feature.

    Reuses the existing PptMaster + LanguageMaster models from the
    document module — no new tables/models are introduced.
    """

    # ---------------------------------------------------------
    # List (active PPTs) with search + pagination
    # ---------------------------------------------------------

    @staticmethod
    def _base_active_query(db: Session):
        return (
            db.query(
                PptMaster.ppt_id,
                PptMaster.ppt_name,
                PptMaster.ppt_description,
                PptMaster.ppt_url,
                PptMaster.cloud_url,
                PptMaster.language_id,
                LanguageMaster.language_name,
                PptMaster.status,
            )
            .outerjoin(
                LanguageMaster,
                LanguageMaster.language_id == PptMaster.language_id,
            )
            .filter(PptMaster.deleted_at.is_(None))
        )

    @staticmethod
    def list_ppts(db: Session, search, skip, limit):
        query = PptRepository._base_active_query(db)

        if search:
            like = f"%{search}%"
            query = query.filter(
                or_(
                    PptMaster.ppt_name.ilike(like),
                    PptMaster.ppt_description.ilike(like),
                )
            )

        total = query.count()

        rows = (
            query.order_by(PptMaster.ppt_id.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        return rows, total

    @staticmethod
    def list_all_for_export(db: Session, search):
        rows, _ = PptRepository.list_ppts(db, search, 0, 1_000_000)
        return rows

    # ---------------------------------------------------------
    # Detail
    # ---------------------------------------------------------

    @staticmethod
    def get_ppt(db: Session, ppt_id: int):
        return (
            db.query(
                PptMaster.ppt_id,
                PptMaster.ppt_unique_id,
                PptMaster.ppt_name,
                PptMaster.ppt_description,
                PptMaster.ppt_url,
                PptMaster.cloud_url,
                PptMaster.language_id,
                LanguageMaster.language_name,
                PptMaster.status,
                PptMaster.created_at,
                PptMaster.updated_at,
            )
            .outerjoin(
                LanguageMaster,
                LanguageMaster.language_id == PptMaster.language_id,
            )
            .filter(
                PptMaster.ppt_id == ppt_id,
                PptMaster.deleted_at.is_(None),
            )
            .first()
        )

    # ---------------------------------------------------------
    # Create
    # ---------------------------------------------------------

    @staticmethod
    def create_ppt(db: Session, data: dict):
        # ppt_masters was migrated from Laravel and may not have a PK
        # sequence, so assign the next id explicitly (max + 1) instead of
        # relying on autoincrement — mirrors how other tables are handled.
        max_id = db.query(func.max(PptMaster.ppt_id)).scalar() or 0

        ppt = PptMaster(
            ppt_id=max_id + 1,
            ppt_unique_id=data.get("ppt_unique_id"),
            ppt_name=data.get("ppt_name"),
            ppt_description=data.get("ppt_description"),
            ppt_url=data.get("ppt_url"),
            cloud_url=data.get("cloud_url"),
            language_id=data.get("language_id"),
            status=data.get("status", 1),
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )

        db.add(ppt)
        db.commit()
        db.refresh(ppt)

        return ppt

    # ---------------------------------------------------------
    # Update
    # ---------------------------------------------------------

    @staticmethod
    def update_ppt(db: Session, ppt_id: int, data: dict):
        ppt = (
            db.query(PptMaster)
            .filter(
                PptMaster.ppt_id == ppt_id,
                PptMaster.deleted_at.is_(None),
            )
            .first()
        )

        if not ppt:
            return None

        for field in (
            "ppt_name",
            "ppt_description",
            "ppt_url",
            "cloud_url",
            "language_id",
            "status",
        ):
            if field in data and data[field] is not None:
                setattr(ppt, field, data[field])

        ppt.updated_at = datetime.now()

        db.commit()
        db.refresh(ppt)

        return ppt

    # ---------------------------------------------------------
    # Soft delete
    # ---------------------------------------------------------

    @staticmethod
    def soft_delete_ppt(db: Session, ppt_id: int):
        ppt = (
            db.query(PptMaster)
            .filter(
                PptMaster.ppt_id == ppt_id,
                PptMaster.deleted_at.is_(None),
            )
            .first()
        )

        if not ppt:
            return None

        ppt.deleted_at = datetime.now()
        ppt.status = 0

        db.commit()

        return ppt

    # ---------------------------------------------------------
    # Archived versions
    #
    # There is no dedicated versioning table yet, so "archived
    # versions" are the soft-deleted rows sharing the same
    # ppt_unique_id as the current PPT. Empty until any exist.
    # ---------------------------------------------------------

    @staticmethod
    def get_archived_versions(db: Session, ppt_id: int):
        current = (
            db.query(PptMaster)
            .filter(PptMaster.ppt_id == ppt_id)
            .first()
        )

        if not current:
            return []

        query = (
            db.query(
                PptMaster.ppt_id,
                PptMaster.ppt_name,
                PptMaster.ppt_description,
                PptMaster.ppt_url,
                PptMaster.cloud_url,
                PptMaster.language_id,
                LanguageMaster.language_name,
                PptMaster.created_at,
            )
            .outerjoin(
                LanguageMaster,
                LanguageMaster.language_id == PptMaster.language_id,
            )
            .filter(PptMaster.deleted_at.isnot(None))
        )

        if current.ppt_unique_id:
            query = query.filter(
                PptMaster.ppt_unique_id == current.ppt_unique_id
            )

        return query.order_by(PptMaster.ppt_id.desc()).all()
