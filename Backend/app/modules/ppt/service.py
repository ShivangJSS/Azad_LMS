import csv
import uuid
from io import StringIO

from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.uploads import save_upload
from app.modules.ppt.repository import PptRepository


def _row_to_list_item(r):
    return {
        "ppt_id": r.ppt_id,
        "ppt_name": r.ppt_name,
        "ppt_description": r.ppt_description,
        "ppt_url": r.ppt_url,
        "cloud_url": r.cloud_url,
        "language_id": r.language_id,
        "language_name": r.language_name,
        "status": r.status,
    }


class PptService:

    @staticmethod
    def list_ppts(db: Session, search, page, limit):
        skip = (page - 1) * limit

        rows, total = PptRepository.list_ppts(
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
    def get_ppt(db: Session, ppt_id: int):
        r = PptRepository.get_ppt(db=db, ppt_id=ppt_id)

        if not r:
            raise HTTPException(status_code=404, detail="PPT not found.")

        return {
            "ppt_id": r.ppt_id,
            "ppt_unique_id": r.ppt_unique_id,
            "ppt_name": r.ppt_name,
            "ppt_description": r.ppt_description,
            "ppt_url": r.ppt_url,
            "cloud_url": r.cloud_url,
            "language_id": r.language_id,
            "language_name": r.language_name,
            "status": r.status,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
        }

    @staticmethod
    def create_ppt(db: Session, data: dict, media_file=None):
        clean = {k: v for k, v in data.items() if v is not None}

        if not (clean.get("ppt_name") or "").strip():
            raise HTTPException(status_code=422, detail="PPT name is required.")

        if media_file is not None and media_file.filename:
            clean["ppt_url"] = save_upload(media_file, "ppt", "ppt_masters")

        clean.setdefault("status", 1)
        clean["ppt_unique_id"] = uuid.uuid4().hex

        ppt = PptRepository.create_ppt(db=db, data=clean)

        return {
            "success": True,
            "message": "PPT created successfully.",
            "ppt_id": ppt.ppt_id,
        }

    @staticmethod
    def update_ppt(db: Session, ppt_id: int, data: dict, media_file=None):
        clean = {k: v for k, v in data.items() if v is not None}

        if media_file is not None and media_file.filename:
            clean["ppt_url"] = save_upload(media_file, "ppt", "ppt_masters")

        ppt = PptRepository.update_ppt(
            db=db,
            ppt_id=ppt_id,
            data=clean,
        )

        if ppt is None:
            raise HTTPException(status_code=404, detail="PPT not found.")

        return {
            "success": True,
            "message": "PPT updated successfully.",
        }

    @staticmethod
    def delete_ppt(db: Session, ppt_id: int):
        ppt = PptRepository.soft_delete_ppt(db=db, ppt_id=ppt_id)

        if ppt is None:
            raise HTTPException(status_code=404, detail="PPT not found.")

        return {
            "success": True,
            "message": "PPT deleted successfully.",
        }

    @staticmethod
    def get_archived_versions(db: Session, ppt_id: int):
        rows = PptRepository.get_archived_versions(db=db, ppt_id=ppt_id)

        return [
            {
                "ppt_id": r.ppt_id,
                "ppt_name": r.ppt_name,
                "ppt_description": r.ppt_description,
                "ppt_url": r.ppt_url,
                "cloud_url": r.cloud_url,
                "language_id": r.language_id,
                "language_name": r.language_name,
                "created_at": r.created_at,
            }
            for r in rows
        ]

    @staticmethod
    def export_csv(db: Session, search):
        rows = PptRepository.list_all_for_export(db=db, search=search)

        buffer = StringIO()
        writer = csv.writer(buffer)

        writer.writerow(
            [
                "Sr No",
                "Ppt Name",
                "Ppt Description",
                "Ppt URL",
                "Cloud URL",
                "Language",
                "Status",
            ]
        )

        for index, r in enumerate(rows, start=1):
            writer.writerow(
                [
                    index,
                    r.ppt_name or "",
                    r.ppt_description or "",
                    r.ppt_url or "",
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
                "Content-Disposition": "attachment; filename=ppts.csv"
            },
        )
