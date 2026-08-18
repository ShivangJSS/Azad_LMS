import csv
import uuid
from io import StringIO

from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.uploads import save_upload
from app.modules.pdf.repository import PdfRepository


def _row_to_list_item(r):
    return {
        "pdf_id": r.pdf_id,
        "pdf_name": r.pdf_name,
        "pdf_description": r.pdf_description,
        "pdf_url": r.pdf_url,
        "cloud_url": r.cloud_url,
        "language_id": r.language_id,
        "language_name": r.language_name,
        "status": r.status,
    }


class PdfService:

    @staticmethod
    def list_pdfs(db: Session, search, page, limit):
        skip = (page - 1) * limit

        rows, total = PdfRepository.list_pdfs(
            db=db,
            search=search,
            skip=skip,
            limit=limit,
        )

        return {
            "data": [_row_to_list_item(r) for r in rows],
            "total": total,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": (total + limit - 1) // limit if limit else 1,
            },
        }

    @staticmethod
    def get_pdf(db: Session, pdf_id: int):
        r = PdfRepository.get_pdf(db=db, pdf_id=pdf_id)

        if not r:
            raise HTTPException(status_code=404, detail="PDF not found.")

        return {
            "pdf_id": r.pdf_id,
            "pdf_unique_id": r.pdf_unique_id,
            "pdf_name": r.pdf_name,
            "pdf_description": r.pdf_description,
            "pdf_url": r.pdf_url,
            "cloud_url": r.cloud_url,
            "language_id": r.language_id,
            "language_name": r.language_name,
            "status": r.status,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
        }

    @staticmethod
    def create_pdf(db: Session, data: dict, media_file=None):
        clean = {k: v for k, v in data.items() if v is not None}

        if not (clean.get("pdf_name") or "").strip():
            raise HTTPException(status_code=422, detail="PDF name is required.")

        if media_file is not None and media_file.filename:
            clean["pdf_url"] = save_upload(media_file, "pdf", "pdf_masters")

        clean.setdefault("status", 1)
        clean["pdf_unique_id"] = uuid.uuid4().hex

        pdf = PdfRepository.create_pdf(db=db, data=clean)

        return {
            "success": True,
            "message": "PDF created successfully.",
            "pdf_id": pdf.pdf_id,
        }

    @staticmethod
    def update_pdf(db: Session, pdf_id: int, data: dict, media_file=None):
        # Only keep provided fields (Form defaults are None → untouched).
        clean = {k: v for k, v in data.items() if v is not None}

        # A newly uploaded file replaces the stored pdf_url.
        if media_file is not None and media_file.filename:
            clean["pdf_url"] = save_upload(media_file, "pdf", "pdf_masters")

        pdf = PdfRepository.update_pdf(
            db=db,
            pdf_id=pdf_id,
            data=clean,
        )

        if pdf is None:
            raise HTTPException(status_code=404, detail="PDF not found.")

        return {
            "success": True,
            "message": "PDF updated successfully.",
        }

    @staticmethod
    def delete_pdf(db: Session, pdf_id: int):
        pdf = PdfRepository.soft_delete_pdf(db=db, pdf_id=pdf_id)

        if pdf is None:
            raise HTTPException(status_code=404, detail="PDF not found.")

        return {
            "success": True,
            "message": "PDF deleted successfully.",
        }

    @staticmethod
    def get_archived_versions(db: Session, pdf_id: int):
        rows = PdfRepository.get_archived_versions(db=db, pdf_id=pdf_id)

        return [
            {
                "pdf_id": r.pdf_id,
                "pdf_name": r.pdf_name,
                "pdf_description": r.pdf_description,
                "pdf_url": r.pdf_url,
                "cloud_url": r.cloud_url,
                "language_id": r.language_id,
                "language_name": r.language_name,
                "created_at": r.created_at,
            }
            for r in rows
        ]

    @staticmethod
    def export_csv(db: Session, search):
        rows = PdfRepository.list_all_for_export(db=db, search=search)

        buffer = StringIO()
        writer = csv.writer(buffer)

        writer.writerow(
            [
                "Sr No",
                "Pdf Name",
                "Pdf Description",
                "Pdf URL",
                "Cloud URL",
                "Language",
                "Status",
            ]
        )

        for index, r in enumerate(rows, start=1):
            writer.writerow(
                [
                    index,
                    r.pdf_name or "",
                    r.pdf_description or "",
                    r.pdf_url or "",
                    r.cloud_url or "",
                    r.language_name or "",
                    "Active" if r.status == 1 else "Inactive",
                ]
            )

        buffer.seek(0)

        return StreamingResponse(
            iter([buffer.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": "attachment; filename=pdfs.csv"
            },
        )
