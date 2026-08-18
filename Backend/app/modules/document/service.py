from typing import Optional
from fastapi import HTTPException,status, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy.engine.row import Row
from app.modules.document.model import DocumentMaster
from app.utils.file_upload import save_file
from app.modules.document.repository import DocumentRepository
import csv
import io
from datetime import datetime
from fastapi.responses import StreamingResponse
from app.modules.document.schema import (
    DocumentCreateRequest,
    DocumentUpdateRequest,
)

class DocumentService:

    @staticmethod
    def get_active_languages(db: Session):
        """Read-only language lookup for Document Management."""
        return DocumentRepository.get_active_languages(db)

    @staticmethod
    def get_active_categories(
        db: Session,
        language_id: int | None = None,
    ):
        """Read-only category lookup filtered by the selected language."""
        return DocumentRepository.get_active_categories(db, language_id)

    @staticmethod
    def get_documents(
        db: Session,
        search: Optional[str] = None,
        language_id: Optional[int] = None,
        doc_type: Optional[str] = None,
        page: int = 1,
        per_page: int = 10,
    ) -> dict[str, list[Row] | int]:
        documents, total = DocumentRepository.get_documents(
            db=db,
            search=search,
            language_id=language_id,
            doc_type=doc_type,
            page=page,
            per_page=per_page,
        )

        return {
            "data": documents,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page if total else 0,
        }



    @staticmethod
    def get_document_by_id(
     db: Session,
     doc_id: int,
):

     document = DocumentRepository.get_document_by_id(
        db=db,
        doc_id=doc_id,
    )

     if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

     parent_id = (
     document.parent_id
     if document.parent_id != document.doc_id
     else document.doc_id
)

     translations = DocumentRepository.get_document_translations(
     db=db,
     parent_id=parent_id,
)

     return {
      "document": document,
      "translations": translations,
}




    @staticmethod
    def delete_document(
     db: Session,
     doc_id: int,
):

     document = DocumentRepository.get_document(
        db=db,
        doc_id=doc_id,
    )

     if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

     DocumentRepository.delete_document(
        db=db,
        document=document,
    )

     return {
        "message": "Document deleted successfully"
    }




    @staticmethod
    async def create_document(
        db: Session,
        request: DocumentCreateRequest,
        document_image: UploadFile | None,
        media_file: UploadFile | None,
    ) -> DocumentMaster:

        # Reject a duplicate document title within the same language (exact match).
        existing = (
            db.query(DocumentMaster)
            .filter(
                DocumentMaster.doc_title == request.doc_title,
                DocumentMaster.language_id == request.language_id,
                DocumentMaster.deleted_at.is_(None),
            )
            .first()
        )
        if existing is not None:
            raise HTTPException(
                status_code=400,
                detail="A document with this title already exists in this language.",
            )

        try:
            doc_image = None
            doc_ref_id = None

            # Upload document image
            if document_image:
                doc_image = await save_file(document_image, "documents")

            # PDF
            if request.doc_type.upper() == "PDF":
                if not media_file:
                    raise HTTPException(
                        status_code=400,
                        detail="PDF file is required."
                    )

                pdf_path = await save_file(media_file, "pdfs")

                pdf = DocumentRepository.create_pdf(
                    db=db,
                    pdf_name=request.doc_title,
                    pdf_description=request.doc_description,
                    pdf_url=pdf_path,
                    status=request.status,
                    language_id=request.language_id,
                )

                doc_ref_id = pdf.pdf_id

            # PPT
            elif request.doc_type.upper() == "PPT":
                if not media_file:
                    raise HTTPException(
                        status_code=400,
                        detail="PPT file is required."
                    )

                ppt_path = await save_file(media_file, "ppts")

                ppt = DocumentRepository.create_ppt(
                    db=db,
                    ppt_name=request.doc_title,
                    ppt_description=request.doc_description,
                    ppt_url=ppt_path,
                    status=request.status,
                    language_id=request.language_id,
                )

                doc_ref_id = ppt.ppt_id

            # VIDEO
            elif request.doc_type.upper() == "VIDEO":
                if not media_file:
                    raise HTTPException(
                        status_code=400,
                        detail="Video file is required."
                    )

                video_path = await save_file(media_file, "videos")

                video = DocumentRepository.create_video(
                    db=db,
                    video_name=request.doc_title,
                    video_description=request.doc_description,
                    video_url=video_path,
                    status=request.status,
                    language_id=request.language_id,
                )

                doc_ref_id = video.video_id

            else:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid document type: {request.doc_type}"
                )

            document = DocumentRepository.create_document(
                db=db,
                request=request,
                doc_image=doc_image,
                doc_ref_id=doc_ref_id,
            )

            db.commit()
            db.refresh(document)

            return document

        except Exception:
            db.rollback()
            raise


    @staticmethod
    async def update_document(
     db: Session,
     doc_id: int,
     request: DocumentUpdateRequest,
     document_image: UploadFile | None,
     media_file: UploadFile | None,
):

     document = DocumentRepository.get_document(
        db=db,
        doc_id=doc_id,
    )

     if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

     try:

        # ---------------- IMAGE ---------------- #

        doc_image = None

        if document_image:
            doc_image = await save_file(document_image, "documents")

        # ---------------- PDF ---------------- #

        if request.doc_type.upper() == "PDF":

            if media_file:

                pdf = DocumentRepository.get_pdf(
                    db=db,
                    pdf_id=document.doc_ref_id,
                )

                if not pdf:
                    raise HTTPException(
                        status_code=404,
                        detail="PDF record not found."
                    )

                pdf_path = await save_file(
                    media_file,
                    "pdfs",
                )

                DocumentRepository.update_pdf(
                    pdf=pdf,
                    pdf_name=request.doc_title,
                    pdf_description=request.doc_description,
                    pdf_url=pdf_path,
                    status=request.status,
                    language_id=request.language_id,
                )

        # ---------------- PPT ---------------- #

        elif request.doc_type.upper() == "PPT":

            if media_file:

                ppt = DocumentRepository.get_ppt(
                    db=db,
                    ppt_id=document.doc_ref_id,
                )

                if not ppt:
                    raise HTTPException(
                        status_code=404,
                        detail="PPT record not found."
                    )

                ppt_path = await save_file(
                    media_file,
                    "ppts",
                )

                DocumentRepository.update_ppt(
                    ppt=ppt,
                    ppt_name=request.doc_title,
                    ppt_description=request.doc_description,
                    ppt_url=ppt_path,
                    status=request.status,
                    language_id=request.language_id,
                )

        # ---------------- VIDEO ---------------- #

        elif request.doc_type.upper() == "VIDEO":

            if media_file:

                video = DocumentRepository.get_video(
                    db=db,
                    video_id=document.doc_ref_id,
                )

                if not video:
                    raise HTTPException(
                        status_code=404,
                        detail="Video record not found."
                    )

                video_path = await save_file(
                    media_file,
                    "videos",
                )

                DocumentRepository.update_video(
                    video=video,
                    video_name=request.doc_title,
                    video_description=request.doc_description,
                    video_url=video_path,
                    status=request.status,
                    language_id=request.language_id,
                )

        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid document type."
            )

        # ---------------- DOCUMENT ---------------- #

        DocumentRepository.update_document(
            document=document,
            request=request,
            doc_image=doc_image,
        )

        db.commit()
        db.refresh(document)

        return {
            "message": "Document updated successfully.",
            "document": document,
        }

     except HTTPException:
        db.rollback()
        raise

     except Exception:
        db.rollback()
        raise   

    @staticmethod
    def get_translation(
        db: Session,
        document_id: int,
        language_id: int,
    ):
        # Get parent document
        parent = DocumentRepository.get_document(
            db=db,
            doc_id=document_id,
        )

        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Document not found",
            )

        # Base language requested?
        is_parent_language = parent.language_id == language_id

        if is_parent_language:
            translation = parent
        else:
            translation = DocumentRepository.get_translation(
                db=db,
                parent_id=document_id,
                language_id=language_id,
            )

        if not translation:
            return {
                "success": False,
                "data": None,
            }

        image_url = translation.doc_image
        file_url = None
        file_name = None
        ppt_viewer_url = None

        doc_type = (translation.doc_type or "").upper()

        if doc_type == "PDF":
            pdf = DocumentRepository.get_pdf(
                db=db,
                pdf_id=translation.doc_ref_id,
            )
            if pdf:
                file_url = pdf.pdf_url
                file_name = pdf.pdf_name

        elif doc_type == "PPT":
            ppt = DocumentRepository.get_ppt(
                db=db,
                ppt_id=translation.doc_ref_id,
            )
            if ppt:
                file_url = ppt.ppt_url
                file_name = ppt.ppt_name

        elif doc_type == "VIDEO":
            video = DocumentRepository.get_video(
                db=db,
                video_id=translation.doc_ref_id,
            )
            if video:
                file_url = video.video_url
                file_name = video.video_name

        return {
            "success": True,
            "data": {
                "title": translation.doc_title,
                "description": translation.doc_description,
                "image_url": image_url,
                "file_url": file_url,
                "file_name": file_name,
                "ppt_viewer_url": ppt_viewer_url,
                "doc_type": doc_type,
            },
        }


    @staticmethod
    async def save_translation(
     db: Session,
     document_id: int,
     language_id: int,
     title: str,
     description: str | None,
     document_image: UploadFile | None,
     media_file: UploadFile | None,
  ):
     parent = DocumentRepository.get_document(
        db=db,
        doc_id=document_id,
    )

     if not parent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )

     translation = DocumentRepository.get_translation(
        db=db,
        parent_id=parent.parent_id,
        language_id=language_id,
    )

     try:

        # ---------------- IMAGE ---------------- #

        doc_image = None

        if document_image:
            doc_image = await save_file(
                document_image,
                "documents",
            )

        doc_ref_id = None

        # ---------------- PDF ---------------- #

        if parent.doc_type.upper() == "PDF":

            if translation:

                pdf = DocumentRepository.get_pdf(
                    db=db,
                    pdf_id=translation.doc_ref_id,
                )

                if media_file:

                    pdf_path = await save_file(
                        media_file,
                        "pdfs",
                    )

                    if pdf:

                        DocumentRepository.update_pdf(
                            pdf=pdf,
                            pdf_name=title,
                            pdf_description=description,
                            pdf_url=pdf_path,
                            status=parent.status,
                            language_id=language_id,
                        )

                        doc_ref_id = pdf.pdf_id

                    else:

                        pdf = DocumentRepository.create_pdf(
                            db=db,
                            pdf_name=title,
                            pdf_description=description,
                            pdf_url=pdf_path,
                            status=parent.status,
                            language_id=language_id,
                        )

                        doc_ref_id = pdf.pdf_id

                else:
                    doc_ref_id = translation.doc_ref_id

            else:

                if not media_file:
                    raise HTTPException(
                        status_code=400,
                        detail="PDF file is required.",
                    )

                pdf_path = await save_file(
                    media_file,
                    "pdfs",
                )

                pdf = DocumentRepository.create_pdf(
                    db=db,
                    pdf_name=title,
                    pdf_description=description,
                    pdf_url=pdf_path,
                    status=parent.status,
                    language_id=language_id,
                )

                doc_ref_id = pdf.pdf_id

        # ---------------- PPT ---------------- #

        elif parent.doc_type.upper() == "PPT":

            if translation:

                ppt = DocumentRepository.get_ppt(
                    db=db,
                    ppt_id=translation.doc_ref_id,
                )

                if media_file:

                    ppt_path = await save_file(
                        media_file,
                        "ppts",
                    )

                    if ppt:

                        DocumentRepository.update_ppt(
                            ppt=ppt,
                            ppt_name=title,
                            ppt_description=description,
                            ppt_url=ppt_path,
                            status=parent.status,
                            language_id=language_id,
                        )

                        doc_ref_id = ppt.ppt_id

                    else:

                        ppt = DocumentRepository.create_ppt(
                            db=db,
                            ppt_name=title,
                            ppt_description=description,
                            ppt_url=ppt_path,
                            status=parent.status,
                            language_id=language_id,
                        )

                        doc_ref_id = ppt.ppt_id

                else:
                    doc_ref_id = translation.doc_ref_id

            else:

                if not media_file:
                    raise HTTPException(
                        status_code=400,
                        detail="PPT file is required.",
                    )

                ppt_path = await save_file(
                    media_file,
                    "ppts",
                )

                ppt = DocumentRepository.create_ppt(
                    db=db,
                    ppt_name=title,
                    ppt_description=description,
                    ppt_url=ppt_path,
                    status=parent.status,
                    language_id=language_id,
                )

                doc_ref_id = ppt.ppt_id

        # ---------------- VIDEO ---------------- #

        elif parent.doc_type.upper() == "VIDEO":

            if translation:

                video = DocumentRepository.get_video(
                    db=db,
                    video_id=translation.doc_ref_id,
                )

                if media_file:

                    video_path = await save_file(
                        media_file,
                        "videos",
                    )

                    if video:

                        DocumentRepository.update_video(
                            video=video,
                            video_name=title,
                            video_description=description,
                            video_url=video_path,
                            status=parent.status,
                            language_id=language_id,
                        )

                        doc_ref_id = video.video_id

                    else:

                        video = DocumentRepository.create_video(
                            db=db,
                            video_name=title,
                            video_description=description,
                            video_url=video_path,
                            status=parent.status,
                            language_id=language_id,
                        )

                        doc_ref_id = video.video_id

                else:
                    doc_ref_id = translation.doc_ref_id

            else:

                if not media_file:
                    raise HTTPException(
                        status_code=400,
                        detail="Video file is required.",
                    )

                video_path = await save_file(
                    media_file,
                    "videos",
                )

                video = DocumentRepository.create_video(
                    db=db,
                    video_name=title,
                    video_description=description,
                    video_url=video_path,
                    status=parent.status,
                    language_id=language_id,
                )

                doc_ref_id = video.video_id

        else:

            raise HTTPException(
                status_code=400,
                detail="Invalid document type.",
            )

        # ---------------- DOCUMENT ---------------- #

        if translation:

            DocumentRepository.update_translation_document(
                translation=translation,
                title=title,
                description=description,
                doc_image=doc_image,
                doc_ref_id=doc_ref_id,
            )

            document = translation

        else:

            document = DocumentRepository.create_translation_document(
                db=db,
                parent=parent,
                language_id=language_id,
                title=title,
                description=description,
                doc_image=doc_image,
                doc_ref_id=doc_ref_id,
            )

        db.commit()
        db.refresh(document)

        return {
            "message": "Translation saved successfully.",
            "document": document,
        }

     except HTTPException:
        db.rollback()
        raise

     except Exception:
        db.rollback()
        raise

    @staticmethod
    def get_translation_form(
     db: Session,
     document_id: int,
):
     document = DocumentRepository.get_document_by_id(
        db=db,
        doc_id=document_id,
    )

     if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found",
        )

     languages = DocumentRepository.get_active_languages(db)

     translations = DocumentRepository.get_existing_translations(
        db=db,
        parent_id=document.parent_id,
        base_language=document.language_id,
    )

     return {
        "document": document,
        "languages": languages,
        "translations": translations,
    }




    @staticmethod
    def export_csv(
     db: Session,
     status: int | None = None,
     doc_category_id: int | None = None,
     doc_ref_id: int | None = None,
):

     rows = DocumentRepository.export_documents(
        db=db,
        status=status,
        doc_category_id=doc_category_id,
        doc_ref_id=doc_ref_id,
    )

     output = io.StringIO()

     writer = csv.writer(output)

     writer.writerow([
        "ID",
        "Document Title",
        "Description",
        "Document Type Name",
        "Document Category",
        "Reference ID",
        "Status",
        "Created At",
        "Updated At",
    ])

     for row in rows:

        writer.writerow([
            row.doc_id,
            row.doc_title,
            row.doc_description,
            row.category_name or "",
            row.doc_type,
            row.doc_ref_id,
            "Active" if row.status == 1 else "Inactive",
            row.created_at.strftime("%d/%m/%Y %H:%M:%S")
            if row.created_at else "",
            row.updated_at.strftime("%d/%m/%Y %H:%M:%S")
            if row.updated_at else "",
        ])

     output.seek(0)

     filename = (
        f"documentmasters_export_"
        f"{datetime.now().strftime('%Y_%m_%d_%H_%M_%S')}.csv"
    )

     return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition":
            f'attachment; filename="{filename}"'
        },
    )
