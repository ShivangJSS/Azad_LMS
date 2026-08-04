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

from app.database.session import get_db
from app.shared.dependencies.module_access import Module, require_module_access

from app.modules.document.schema import (
    DocumentCreateRequest,
    DocumentUpdateRequest,
    DocumentDetailResponse,
    DocumentCategoryResponse,
    DocumentListResponse,
    PaginatedDocumentListResponse,
    DocumentViewResponse,
    TranslationLanguageResponse,
    TranslationFormResponse,
)
from app.modules.document.service import DocumentService


router = APIRouter(
    prefix="",
    tags=["Document Management"],
    dependencies=[
        Depends(require_module_access(Module.DOCUMENT_MANAGEMENT)),
    ],
)


# -------------------------------------------------------
# List Documents
# -------------------------------------------------------

@router.get(
    "/documents/categories",
    response_model=list[DocumentCategoryResponse],
)
def get_document_categories(
    language_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
):
    return [
        DocumentCategoryResponse(id=row.doc_category_id, name=row.doc_category_name)
        for row in DocumentService.get_active_categories(db, language_id)
    ]

@router.get(
    "/documents/languages",
    response_model=list[TranslationLanguageResponse],
)
def get_document_languages(
    db: Session = Depends(get_db),
):
    return DocumentService.get_active_languages(db)


@router.get(
    "/documents",
    response_model=PaginatedDocumentListResponse,
)
def get_documents(
    search: Optional[str] = Query(None),
    language_id: Optional[int] = Query(None),
    doc_type: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return DocumentService.get_documents(
        db=db,
        search=search,
        language_id=language_id,
        doc_type=doc_type,
        page=page,
        per_page=per_page,
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
    document_image: UploadFile | None = File(default=None),
    media_file: UploadFile = File(...),
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
    status_filter: int | None = Query(default=None, alias="status"),
    doc_category_id: int | None = Query(default=None, gt=0),
    doc_ref_id: int | None = Query(default=None, gt=0),
    db: Session = Depends(get_db),
):
    return DocumentService.export_csv(
        db=db,
        status=status_filter,
        doc_category_id=doc_category_id,
        doc_ref_id=doc_ref_id,
    )
