from fastapi import APIRouter, Depends, Query, Form, File, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.modules.ppt.service import PptService


from app.shared.dependencies.module_access import Module, require_module_access

router = APIRouter(
    prefix="/ppt-masters",
    tags=["PPT Master"],
    dependencies=[Depends(require_module_access(Module.DOCUMENT_MANAGEMENT))],
)


# ==========================
# List PPTs
# ==========================
@router.get("")
def list_ppts(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
):
    return PptService.list_ppts(
        db=db,
        search=search,
        page=page,
        limit=limit,
    )


# ==========================
# Export CSV
# (declared before /{ppt_id} so "export" is not read as an id)
# ==========================
@router.get("/export/csv")
def export_ppts(
    search: str | None = Query(None),
    db: Session = Depends(get_db),
):
    return PptService.export_csv(db=db, search=search)


# ==========================
# Archived Versions
# ==========================
@router.get("/{ppt_id}/archived-versions")
def get_archived_versions(
    ppt_id: int,
    db: Session = Depends(get_db),
):
    return PptService.get_archived_versions(db=db, ppt_id=ppt_id)


# ==========================
# Get PPT By Id
# ==========================
@router.get("/{ppt_id}")
def get_ppt(
    ppt_id: int,
    db: Session = Depends(get_db),
):
    return PptService.get_ppt(db=db, ppt_id=ppt_id)


# ==========================
# Create PPT
# ==========================
@router.post("")
async def create_ppt(
    ppt_name: str = Form(...),
    ppt_description: str | None = Form(None),
    cloud_url: str | None = Form(None),
    language_id: int | None = Form(None),
    status: int | None = Form(1),
    media_file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    data = {
        "ppt_name": ppt_name,
        "ppt_description": ppt_description,
        "cloud_url": cloud_url,
        "language_id": language_id,
        "status": status,
    }
    return PptService.create_ppt(
        db=db,
        data=data,
        media_file=media_file,
    )


# ==========================
# Update PPT
# ==========================
@router.put("/{ppt_id}")
async def update_ppt(
    ppt_id: int,
    ppt_name: str | None = Form(None),
    ppt_description: str | None = Form(None),
    cloud_url: str | None = Form(None),
    language_id: int | None = Form(None),
    status: int | None = Form(None),
    media_file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    data = {
        "ppt_name": ppt_name,
        "ppt_description": ppt_description,
        "cloud_url": cloud_url,
        "language_id": language_id,
        "status": status,
    }
    return PptService.update_ppt(
        db=db,
        ppt_id=ppt_id,
        data=data,
        media_file=media_file,
    )


# ==========================
# Delete PPT (soft)
# ==========================
@router.delete("/{ppt_id}")
def delete_ppt(
    ppt_id: int,
    db: Session = Depends(get_db),
):
    return PptService.delete_ppt(db=db, ppt_id=ppt_id)
