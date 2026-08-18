from datetime import datetime

from sqlalchemy import or_, func
from sqlalchemy.orm import Session

from app.modules.document.model import PdfMaster, LanguageMaster


class PdfRepository:
    """Data access for the standalone PDF (pdf_masters) feature.

    Reuses the existing PdfMaster + LanguageMaster models from the
    document module — no new tables/models are introduced.
    """

    # ---------------------------------------------------------
    # List (active PDFs) with search + pagination
    # ---------------------------------------------------------

    @staticmethod
    def _base_active_query(db: Session):
        return (
            db.query(
                PdfMaster.pdf_id,
                PdfMaster.pdf_name,
                PdfMaster.pdf_description,
                PdfMaster.pdf_url,
                PdfMaster.cloud_url,
                PdfMaster.language_id,
                LanguageMaster.language_name,
                PdfMaster.status,
            )
            .outerjoin(
                LanguageMaster,
                LanguageMaster.language_id == PdfMaster.language_id,
            )
            .filter(PdfMaster.deleted_at.is_(None))
        )

    @staticmethod
    def list_pdfs(db: Session, search, skip, limit):
        query = PdfRepository._base_active_query(db)

        if search:
            like = f"%{search}%"
            query = query.filter(
                or_(
                    PdfMaster.pdf_name.ilike(like),
                    PdfMaster.pdf_description.ilike(like),
                )
            )

        total = query.count()

        rows = (
            query.order_by(PdfMaster.pdf_id.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

        return rows, total

    @staticmethod
    def list_all_for_export(db: Session, search):
        rows, _ = PdfRepository.list_pdfs(db, search, 0, 1_000_000)
        return rows

    # ---------------------------------------------------------
    # Detail
    # ---------------------------------------------------------

    @staticmethod
    def get_pdf(db: Session, pdf_id: int):
        return (
            db.query(
                PdfMaster.pdf_id,
                PdfMaster.pdf_unique_id,
                PdfMaster.pdf_name,
                PdfMaster.pdf_description,
                PdfMaster.pdf_url,
                PdfMaster.cloud_url,
                PdfMaster.language_id,
                LanguageMaster.language_name,
                PdfMaster.status,
                PdfMaster.created_at,
                PdfMaster.updated_at,
            )
            .outerjoin(
                LanguageMaster,
                LanguageMaster.language_id == PdfMaster.language_id,
            )
            .filter(
                PdfMaster.pdf_id == pdf_id,
                PdfMaster.deleted_at.is_(None),
            )
            .first()
        )

    # ---------------------------------------------------------
    # Create
    # ---------------------------------------------------------

    @staticmethod
    def create_pdf(db: Session, data: dict):
        # pdf_masters was migrated from Laravel and may not have a PK
        # sequence, so assign the next id explicitly (max + 1).
        max_id = db.query(func.max(PdfMaster.pdf_id)).scalar() or 0

        pdf = PdfMaster(
            pdf_id=max_id + 1,
            pdf_unique_id=data.get("pdf_unique_id"),
            pdf_name=data.get("pdf_name"),
            pdf_description=data.get("pdf_description"),
            pdf_url=data.get("pdf_url"),
            cloud_url=data.get("cloud_url"),
            language_id=data.get("language_id"),
            status=data.get("status", 1),
            created_at=datetime.now(),
            updated_at=datetime.now(),
        )

        db.add(pdf)
        db.commit()
        db.refresh(pdf)

        return pdf

    # ---------------------------------------------------------
    # Update
    # ---------------------------------------------------------

    @staticmethod
    def update_pdf(db: Session, pdf_id: int, data: dict):
        pdf = (
            db.query(PdfMaster)
            .filter(
                PdfMaster.pdf_id == pdf_id,
                PdfMaster.deleted_at.is_(None),
            )
            .first()
        )

        if not pdf:
            return None

        for field in (
            "pdf_name",
            "pdf_description",
            "pdf_url",
            "cloud_url",
            "language_id",
            "status",
        ):
            if field in data and data[field] is not None:
                setattr(pdf, field, data[field])

        pdf.updated_at = datetime.now()

        db.commit()
        db.refresh(pdf)

        return pdf

    # ---------------------------------------------------------
    # Soft delete
    # ---------------------------------------------------------

    @staticmethod
    def soft_delete_pdf(db: Session, pdf_id: int):
        pdf = (
            db.query(PdfMaster)
            .filter(
                PdfMaster.pdf_id == pdf_id,
                PdfMaster.deleted_at.is_(None),
            )
            .first()
        )

        if not pdf:
            return None

        pdf.deleted_at = datetime.now()
        pdf.status = 0

        db.commit()

        return pdf

    # ---------------------------------------------------------
    # Archived versions
    #
    # There is no dedicated versioning table yet, so "archived
    # versions" are the soft-deleted rows sharing the same
    # pdf_unique_id as the current PDF. Empty until any exist.
    # ---------------------------------------------------------

    @staticmethod
    def get_archived_versions(db: Session, pdf_id: int):
        current = (
            db.query(PdfMaster)
            .filter(PdfMaster.pdf_id == pdf_id)
            .first()
        )

        if not current:
            return []

        query = (
            db.query(
                PdfMaster.pdf_id,
                PdfMaster.pdf_name,
                PdfMaster.pdf_description,
                PdfMaster.pdf_url,
                PdfMaster.cloud_url,
                PdfMaster.language_id,
                LanguageMaster.language_name,
                PdfMaster.created_at,
            )
            .outerjoin(
                LanguageMaster,
                LanguageMaster.language_id == PdfMaster.language_id,
            )
            .filter(PdfMaster.deleted_at.isnot(None))
        )

        if current.pdf_unique_id:
            query = query.filter(
                PdfMaster.pdf_unique_id == current.pdf_unique_id
            )

        return query.order_by(PdfMaster.pdf_id.desc()).all()
