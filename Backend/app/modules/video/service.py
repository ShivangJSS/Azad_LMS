import csv
import uuid
from io import StringIO

from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.uploads import save_upload
from app.modules.video.repository import VideoRepository


def _row_to_list_item(r):
    return {
        "video_id": r.video_id,
        "video_name": r.video_name,
        "video_description": r.video_description,
        "video_url": r.video_url,
        "youtube_url": r.youtube_url,
        "language_id": r.language_id,
        "language_name": r.language_name,
        "status": r.status,
    }


class VideoService:

    @staticmethod
    def list_videos(db: Session, search, page, limit):
        skip = (page - 1) * limit

        rows, total = VideoRepository.list_videos(
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
    def get_video(db: Session, video_id: int):
        r = VideoRepository.get_video(db=db, video_id=video_id)

        if not r:
            raise HTTPException(status_code=404, detail="VIDEO not found.")

        return {
            "video_id": r.video_id,
            "video_unique_id": r.video_unique_id,
            "video_name": r.video_name,
            "video_description": r.video_description,
            "video_url": r.video_url,
            "youtube_url": r.youtube_url,
            "language_id": r.language_id,
            "language_name": r.language_name,
            "status": r.status,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
        }

    @staticmethod
    def create_video(db: Session, data: dict, media_file=None):
        clean = {k: v for k, v in data.items() if v is not None}

        if not (clean.get("video_name") or "").strip():
            raise HTTPException(status_code=422, detail="Video name is required.")

        if media_file is not None and media_file.filename:
            clean["video_url"] = save_upload(media_file, "video", "video_masters")

        clean.setdefault("status", 1)
        clean["video_unique_id"] = uuid.uuid4().hex

        video = VideoRepository.create_video(db=db, data=clean)

        return {
            "success": True,
            "message": "VIDEO created successfully.",
            "video_id": video.video_id,
        }

    @staticmethod
    def update_video(db: Session, video_id: int, data: dict, media_file=None):
        clean = {k: v for k, v in data.items() if v is not None}

        if media_file is not None and media_file.filename:
            clean["video_url"] = save_upload(media_file, "video", "video_masters")

        video = VideoRepository.update_video(
            db=db,
            video_id=video_id,
            data=clean,
        )

        if video is None:
            raise HTTPException(status_code=404, detail="VIDEO not found.")

        return {
            "success": True,
            "message": "VIDEO updated successfully.",
        }

    @staticmethod
    def delete_video(db: Session, video_id: int):
        video = VideoRepository.soft_delete_video(db=db, video_id=video_id)

        if video is None:
            raise HTTPException(status_code=404, detail="VIDEO not found.")

        return {
            "success": True,
            "message": "VIDEO deleted successfully.",
        }

    @staticmethod
    def get_archived_versions(db: Session, video_id: int):
        rows = VideoRepository.get_archived_versions(db=db, video_id=video_id)

        return [
            {
                "video_id": r.video_id,
                "video_name": r.video_name,
                "video_description": r.video_description,
                "video_url": r.video_url,
                "youtube_url": r.youtube_url,
                "language_id": r.language_id,
                "language_name": r.language_name,
                "created_at": r.created_at,
            }
            for r in rows
        ]

    @staticmethod
    def export_csv(db: Session, search):
        rows = VideoRepository.list_all_for_export(db=db, search=search)

        buffer = StringIO()
        writer = csv.writer(buffer)

        writer.writerow(
            [
                "Sr No",
                "Video Name",
                "Video Description",
                "Video URL",
                "YouTube URL",
                "Language",
                "Status",
            ]
        )

        for index, r in enumerate(rows, start=1):
            writer.writerow(
                [
                    index,
                    r.video_name or "",
                    r.video_description or "",
                    r.video_url or "",
                    r.youtube_url or "",
                    r.language_name or "",
                    "Active" if r.status == 1 else "Inactive",
                ]
            )

        buffer.seek(0)

        return StreamingResponse(
            iter([buffer.getvalue()]),
            media_type="text/csv",
            headers={
                "Content-Disposition": "attachment; filename=videos.csv"
            },
        )
