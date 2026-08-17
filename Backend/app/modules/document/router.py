from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    Query,
    UploadFile,
    status,
)
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.modules.auth.constants import UserRole
from app.modules.auth.dependencies import require_roles

from app.modules.document.schema import (
    DocumentCreateRequest,
    DocumentUpdateRequest,
    DocumentDetailResponse,
    DocumentListResponse,
    DocumentViewResponse,
    TranslationFormResponse,
)
from app.modules.document.service import DocumentService


router = APIRouter(
    prefix="/document-management",
    tags=["Document Management"],
)


# -------------------------------------------------------
# List Documents
# -------------------------------------------------------

@router.get(
    "/documents",
    response_model=list[DocumentListResponse],
)
def get_documents(
    search: Optional[str] = Query(None),
    language_id: Optional[int] = Query(None),
    doc_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return DocumentService.get_documents(
        db=db,
        search=search,
        language_id=language_id,
        doc_type=doc_type,
    )


# -------------------------------------------------------
# Get Document
# -------------------------------------------------------

@router.get(
    "/documents/{doc_id}",
    response_model=DocumentViewResponse,
)
def get_document_by_id(
    doc_id: int,
    db: Session = Depends(get_db),
):
    return DocumentService.get_document_by_id(
        db=db,
        doc_id=doc_id,
    )


# -------------------------------------------------------
# Create Document
# -------------------------------------------------------

@router.post(
    "/documents",
    status_code=status.HTTP_201_CREATED,
)
async def create_document(
    request: DocumentCreateRequest = Depends(DocumentCreateRequest.as_form),
    document_image: UploadFile | None = File(None),
    media_file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    return await DocumentService.create_document(
        db=db,
        request=request,
        document_image=document_image,
        media_file=media_file,
    )


# -------------------------------------------------------
# Update Document
# -------------------------------------------------------

@router.put(
    "/documents/{doc_id}",
    status_code=status.HTTP_200_OK,
)
async def update_document(
    doc_id: int,
    request: DocumentUpdateRequest = Depends(DocumentUpdateRequest.as_form),
    document_image: UploadFile | None = File(None),
    media_file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    return await DocumentService.update_document(
        db=db,
        doc_id=doc_id,
        request=request,
        document_image=document_image,
        media_file=media_file,
    )


# -------------------------------------------------------
# Delete Document
# -------------------------------------------------------

@router.delete(
    "/documents/{doc_id}",
    status_code=status.HTTP_200_OK,
)
def delete_document(
    doc_id: int,
    db: Session = Depends(get_db),
):
    return DocumentService.delete_document(
        db=db,
        doc_id=doc_id,
    )


# -------------------------------------------------------
# Translation Form
# IMPORTANT:
# Keep this BEFORE translation/{language_id}
# -------------------------------------------------------

@router.get(
    "/documents/{document_id}/translation/form",
    response_model=TranslationFormResponse,
)
def get_translation_form(
    document_id: int,
    db: Session = Depends(get_db),
):
    return DocumentService.get_translation_form(
        db=db,
        document_id=document_id,
    )


# -------------------------------------------------------
# Get Translation
# -------------------------------------------------------

@router.get(
    "/documents/{document_id}/translation/{language_id}",
)
def get_translation(
    document_id: int,
    language_id: int,
    db: Session = Depends(get_db),
):
    return DocumentService.get_translation(
        db=db,
        document_id=document_id,
        language_id=language_id,
    )


# -------------------------------------------------------
# Save Translation
# -------------------------------------------------------

@router.post(
    "/documents/{document_id}/translation/save",
    status_code=status.HTTP_200_OK,
)
async def save_translation(
    document_id: int,
    language_id: int = Form(...),
    title: str = Form(...),
    description: str | None = Form(None),
    document_image: UploadFile | None = File(None),
    media_file: UploadFile | None = File(None),
    db: Session = Depends(get_db),
):
    return await DocumentService.save_translation(
        db=db,
        document_id=document_id,
        language_id=language_id,
        title=title,
        description=description,
        document_image=document_image,
        media_file=media_file,
    )


# -------------------------------------------------------
# Export CSV
# -------------------------------------------------------

@router.get(
    "/documents/export/csv",
    response_class=StreamingResponse,
)
def export_csv(
    status: int | None = None,
    doc_category_id: int | None = None,
    doc_ref_id: int | None = None,
    db: Session = Depends(get_db),
):
    return DocumentService.export_csv(
        db=db,
        status=status,
        doc_category_id=doc_category_id,
        doc_ref_id=doc_ref_id,
    )