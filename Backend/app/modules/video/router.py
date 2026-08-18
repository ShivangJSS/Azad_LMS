from fastapi import APIRouter, Depends, Query, Form, File, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.modules.video.service import VideoService


from app.shared.dependencies.module_access import Module, require_module_access

router = APIRouter(
    prefix="/video-masters",
    tags=["VIDEO Master"],
    dependencies=[Depends(require_module_access(Module.DOCUMENT_MANAGEMENT))],
)


# ==========================
# List VIDEOs
# ==========================
@router.get("")
def list_videos(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
):
    return VideoService.list_videos(
        db=db,
        search=search,
        page=page,
        limit=limit,
    )


# ==========================
# Export CSV
# (declared before /{video_id} so "export" is not read as an id)
# ==========================
@router.get("/export/csv")
def export_videos(
    search: str | None = Query(None),
    db: Session = Depends(get_db),
):
    return VideoService.export_csv(db=db, search=search)


# ==========================
# Archived Versions
# ==========================
@router.get("/{video_id}/archived-versions")
def get_archived_versions(
    video_id: int,
    db: Session = Depends(get_db),
):
    return VideoService.get_archived_versions(db=db, video_id=video_id)


# ==========================
# Get VIDEO By Id
# ==========================
@router.get("/{video_id}")
def get_video(
    video_id: int,
    db: Session = Depends(get_db),
):
    return VideoService.get_video(db=db, video_id=video_id)


# ==========================
# Create VIDEO
# ==========================
@router.post("")
async def create_video(
    video_name: str = Form(...),
    video_description: str | None = Form(None),
    youtube_url: str | None = Form(None),
    language_id: int | None = Form(None),
    status: int | None = Form(1),
    media_file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    data = {
        "video_name": video_name,
        "video_description": video_description,
        "youtube_url": youtube_url,
        "language_id": language_id,
        "status": status,
    }
    return VideoService.create_video(
        db=db,
        data=data,
        media_file=media_file,
    )


# ==========================
# Update VIDEO
# ==========================
@router.put("/{video_id}")
async def update_video(
    video_id: int,
    video_name: str | None = Form(None),
    video_description: str | None = Form(None),
    youtube_url: str | None = Form(None),
    language_id: int | None = Form(None),
    status: int | None = Form(None),
    media_file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    data = {
        "video_name": video_name,
        "video_description": video_description,
        "youtube_url": youtube_url,
        "language_id": language_id,
        "status": status,
    }
    return VideoService.update_video(
        db=db,
        video_id=video_id,
        data=data,
        media_file=media_file,
    )


# ==========================
# Delete VIDEO (soft)
# ==========================
@router.delete("/{video_id}")
def delete_video(
    video_id: int,
    db: Session = Depends(get_db),
):
    return VideoService.delete_video(db=db, video_id=video_id)
