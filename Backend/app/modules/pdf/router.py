from fastapi import APIRouter, Depends, Query, Form, File, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.modules.pdf.service import PdfService


from app.shared.dependencies.module_access import Module, require_module_access

router = APIRouter(
    prefix="/pdf-masters",
    tags=["PDF Master"],
    dependencies=[Depends(require_module_access(Module.DOCUMENT_MANAGEMENT))],
)


# ==========================
# List PDFs
# ==========================
@router.get("")
def list_pdfs(
    search: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1),
    db: Session = Depends(get_db),
):
    return PdfService.list_pdfs(
        db=db,
        search=search,
        page=page,
        limit=limit,
    )


# ==========================
# Export CSV
# (declared before /{pdf_id} so "export" is not read as an id)
# ==========================
@router.get("/export/csv")
def export_pdfs(
    search: str | None = Query(None),
    db: Session = Depends(get_db),
):
    return PdfService.export_csv(db=db, search=search)


# ==========================
# Archived Versions
# ==========================
@router.get("/{pdf_id}/archived-versions")
def get_archived_versions(
    pdf_id: int,
    db: Session = Depends(get_db),
):
    return PdfService.get_archived_versions(db=db, pdf_id=pdf_id)


# ==========================
# Get PDF By Id
# ==========================
@router.get("/{pdf_id}")
def get_pdf(
    pdf_id: int,
    db: Session = Depends(get_db),
):
    return PdfService.get_pdf(db=db, pdf_id=pdf_id)


# ==========================
# Create PDF
# ==========================
@router.post("")
async def create_pdf(
    pdf_name: str = Form(...),
    pdf_description: str | None = Form(None),
    cloud_url: str | None = Form(None),
    language_id: int | None = Form(None),
    status: int | None = Form(1),
    media_file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    data = {
        "pdf_name": pdf_name,
        "pdf_description": pdf_description,
        "cloud_url": cloud_url,
        "language_id": language_id,
        "status": status,
    }
    return PdfService.create_pdf(
        db=db,
        data=data,
        media_file=media_file,
    )


# ==========================
# Update PDF
# ==========================
@router.put("/{pdf_id}")
async def update_pdf(
    pdf_id: int,
    pdf_name: str | None = Form(None),
    pdf_description: str | None = Form(None),
    cloud_url: str | None = Form(None),
    language_id: int | None = Form(None),
    status: int | None = Form(None),
    media_file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    data = {
        "pdf_name": pdf_name,
        "pdf_description": pdf_description,
        "cloud_url": cloud_url,
        "language_id": language_id,
        "status": status,
    }
    return PdfService.update_pdf(
        db=db,
        pdf_id=pdf_id,
        data=data,
        media_file=media_file,
    )


# ==========================
# Delete PDF (soft)
# ==========================
@router.delete("/{pdf_id}")
def delete_pdf(
    pdf_id: int,
    db: Session = Depends(get_db),
):
    return PdfService.delete_pdf(db=db, pdf_id=pdf_id)
