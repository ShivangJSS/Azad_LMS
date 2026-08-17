from datetime import datetime
from typing import Optional
from app.modules.document.schema import DocumentCreateRequest
from sqlalchemy import BigInteger, and_, cast
from sqlalchemy.orm import Session
from app.modules.module.model import ModuleMaster
import csv
import io
from app.modules.dashboard.model import DocumentCategory
from app.modules.document.model import (
    DocumentMaster,


    
   
    TopicMaster,
    LanguageMaster,
    PdfMaster,
    PptMaster,
    VideoMaster,
)


class DocumentRepository:


    @staticmethod
    def get_pdf(db: Session, pdf_id: int):
     return db.query(PdfMaster).filter(
        PdfMaster.pdf_id == pdf_id
    ).first()


    @staticmethod
    def get_ppt(db: Session, ppt_id: int):
     return db.query(PptMaster).filter(
        PptMaster.ppt_id == ppt_id
    ).first()


    @staticmethod
    def get_video(db: Session, video_id: int):
     return db.query(VideoMaster).filter(
        VideoMaster.video_id == video_id
    ).first()




    @staticmethod
    def get_documents(
        db: Session,
        search: Optional[str] = None,
        language_id: Optional[int] = None,
        doc_type: Optional[str] = None,
    ):

        query = (
            db.query(
                DocumentMaster.doc_id,
                DocumentMaster.doc_title,
                DocumentMaster.doc_type,
                DocumentMaster.status,

                ModuleMaster.module_name.label("module_name"),
                TopicMaster.topic_name.label("topic_name"),
                LanguageMaster.language_name.label("language_name"),

               
                PdfMaster.pdf_name.label("pdf_name"),
                PdfMaster.pdf_url.label("pdf_url"),
                PdfMaster.cloud_url.label("pdf_cloud_url"),

                PptMaster.ppt_name.label("ppt_name"),
                PptMaster.ppt_url.label("ppt_url"),
                PptMaster.cloud_url.label("ppt_cloud_url"),

                VideoMaster.video_name.label("video_name"),
                VideoMaster.video_url.label("video_url"),
                VideoMaster.youtube_url.label("youtube_url"),
            )

            .outerjoin(
                ModuleMaster,
                DocumentMaster.module_id == ModuleMaster.module_id,
            )

            .outerjoin(
                TopicMaster,
                DocumentMaster.topic_id == TopicMaster.topic_id,
            )

            .outerjoin(
                LanguageMaster,
                DocumentMaster.language_id == LanguageMaster.language_id,
            )

            .outerjoin(
                 PdfMaster,
                 and_(
                      DocumentMaster.doc_type == "PDF",
                      DocumentMaster.doc_ref_id == PdfMaster.pdf_id,
                    ),
                 )

           .outerjoin(
                PptMaster,
                and_(
                     DocumentMaster.doc_type == "PPT",
                     DocumentMaster.doc_ref_id == PptMaster.ppt_id,
               ),
            )
            .outerjoin(
                 VideoMaster,
                 and_(
                        DocumentMaster.doc_type == "Video",
                        DocumentMaster.doc_ref_id == VideoMaster.video_id,
                 ),
             )

           .filter(
                DocumentMaster.deleted_at.is_(None),
                DocumentMaster.parent_id == DocumentMaster.doc_id,
)
        )

        if language_id:
            query = query.filter(
                DocumentMaster.language_id == language_id
            )

        if doc_type:
            query = query.filter(
                DocumentMaster.doc_type == doc_type
            )

        if search:
            query = query.filter(
                DocumentMaster.doc_title.ilike(f"%{search}%")
            )

        return (
            query.order_by(DocumentMaster.doc_id.desc())
            .all()
        )




    @staticmethod
    def get_document_by_id(
      db: Session,
      doc_id: int,
):

      return (
        db.query(
            DocumentMaster.doc_id,
            DocumentMaster.parent_id,
            DocumentMaster.doc_title,
            DocumentMaster.doc_description,
            DocumentMaster.doc_category_id,
            DocumentMaster.doc_image,
            DocumentMaster.doc_file,
            DocumentMaster.doc_type,
            DocumentMaster.doc_ref_id,

            DocumentMaster.module_id,
            ModuleMaster.module_name.label("module_name"),

            DocumentMaster.topic_id,
            TopicMaster.topic_name.label("topic_name"),

            DocumentMaster.language_id,
            LanguageMaster.language_name.label("language_name"),

# PDF
            PdfMaster.pdf_name.label("pdf_name"),
            PdfMaster.pdf_url.label("pdf_url"),
            PdfMaster.cloud_url.label("pdf_cloud_url"),

# PPT
            PptMaster.ppt_name.label("ppt_name"),
            PptMaster.ppt_url.label("ppt_url"),
            PptMaster.cloud_url.label("ppt_cloud_url"),

# VIDEO
            VideoMaster.video_name.label("video_name"),
            VideoMaster.video_url.label("video_url"),
            VideoMaster.youtube_url.label("youtube_url"),

            DocumentMaster.self_paced_learning,
            DocumentMaster.pre_session_assessment,
            DocumentMaster.main_content_of_the_module,
            DocumentMaster.post_session_assessment,

            DocumentMaster.doc_duration,
            DocumentMaster.status,
            DocumentMaster.created_at,
            DocumentMaster.updated_at,
        )
        .outerjoin(
            ModuleMaster,
            DocumentMaster.module_id == ModuleMaster.module_id,
        )
        .outerjoin(
            TopicMaster,
            DocumentMaster.topic_id == TopicMaster.topic_id,
        )
        .outerjoin(
            LanguageMaster,
            DocumentMaster.language_id == LanguageMaster.language_id,
        )

        .outerjoin(
             PdfMaster,
             and_(
                DocumentMaster.doc_type == "PDF",
                DocumentMaster.doc_ref_id == PdfMaster.pdf_id,
    ),
)

        .outerjoin(
              PptMaster,
              and_(
                   DocumentMaster.doc_type == "PPT",
                   DocumentMaster.doc_ref_id == PptMaster.ppt_id,
    ),
)

        .outerjoin(
              VideoMaster,
              and_(
                   DocumentMaster.doc_type == "Video",
                   DocumentMaster.doc_ref_id == VideoMaster.video_id,
    ),
)




        .filter(
            DocumentMaster.doc_id == doc_id,
            DocumentMaster.deleted_at.is_(None),
        )
        .first()
    )

    @staticmethod
    def get_document(
     db: Session,
     doc_id: int,
):
     return (
        db.query(DocumentMaster)
        .filter(
            DocumentMaster.doc_id == doc_id,
            DocumentMaster.deleted_at.is_(None),
        )
        .first()
    )


    @staticmethod
    def delete_document(
     db: Session,
     document: DocumentMaster,
):
     document.deleted_at = datetime.utcnow()

     db.commit()

     return document



    @staticmethod
    def get_document_translations(
     db: Session,
     parent_id: int,
):
     return (
        db.query(
            DocumentMaster.doc_id,
            DocumentMaster.parent_id,
            DocumentMaster.language_id,
            LanguageMaster.language_name.label("language_name"),
        )
        .join(
            LanguageMaster,
            DocumentMaster.language_id == LanguageMaster.language_id,
        )
        .filter(
            DocumentMaster.parent_id == parent_id,
            DocumentMaster.deleted_at.is_(None),
        )
        .order_by(DocumentMaster.language_id)
        .all()
    )






    @staticmethod
    def create_pdf(db: Session,
        pdf_name: str,
        pdf_description: str | None,
        pdf_url: str,
        status: int,
        language_id: int,
    ) -> PdfMaster:

        pdf = PdfMaster(
            pdf_name=pdf_name,
            pdf_description=pdf_description,
            pdf_url=pdf_url,
            status=status,
            language_id=language_id,
        )

        db.add(pdf)
        db.flush()

        return pdf

    # ---------------- PPT ---------------- #

    def create_ppt(
        db: Session,
        ppt_name: str,
        ppt_description: str | None,
        ppt_url: str,
        status: int,
        language_id: int,
    ) -> PptMaster:

        ppt = PptMaster(
            ppt_name=ppt_name,
            ppt_description=ppt_description,
            ppt_url=ppt_url,
            status=status,
            language_id=language_id,
        )

        db.add(ppt)
        db.flush()

        return ppt

    # ---------------- VIDEO ---------------- #

    def create_video(
        db: Session,
        video_name: str,
        video_description: str | None,
        video_url: str,
        status: int,
        language_id: int,
    ) -> VideoMaster:

        video = VideoMaster(
            video_name=video_name,
            video_description=video_description,
            video_url=video_url,
            status=status,
            language_id=language_id,
        )

        db.add(video)
        db.flush()

        return video

   # ---------------- DOCUMENT ---------------- #

    @staticmethod
    def create_document(
     db: Session,
     request: DocumentCreateRequest,
     doc_image: str | None,
     doc_ref_id: int,
    ) -> DocumentMaster:

     document = DocumentMaster(
        doc_title=request.doc_title,
        doc_description=request.doc_description,
        doc_category_id=request.doc_category_id,
        doc_image=doc_image,
        doc_type=request.doc_type,
        doc_ref_id=doc_ref_id,
        status=request.status,
        module_id=request.module_id,
        submodule_id=request.submodule_id,
        topic_id=request.topic_id,
        language_id=request.language_id,
        self_paced_learning=request.self_paced_learning,
        pre_session_assessment=request.pre_session_assessment,
        main_content_of_the_module=request.main_content_of_the_module,
        post_session_assessment=request.post_session_assessment,
        doc_duration=request.doc_duration,
    )

     db.add(document)
     db.flush()

     document.parent_id = document.doc_id
     db.flush()

     return document




# ---------------- PPT ---------------- #



# ---------------- PDF ---------------- #

    @staticmethod
    def update_pdf(
     pdf: PdfMaster,
     pdf_name: str,
     pdf_description: str | None,
     pdf_url: str,
     status: int,
     language_id: int,
 ) -> PdfMaster:

     pdf.pdf_name = pdf_name
     pdf.pdf_description = pdf_description
     pdf.pdf_url = pdf_url
     pdf.status = status
     pdf.language_id = language_id

     return pdf


# ---------------- PPT ---------------- #

    @staticmethod
    def update_ppt(
     ppt: PptMaster,
     ppt_name: str,
     ppt_description: str | None,
     ppt_url: str,
     status: int,
     language_id: int,
 ) -> PptMaster:

     ppt.ppt_name = ppt_name
     ppt.ppt_description = ppt_description
     ppt.ppt_url = ppt_url
     ppt.status = status
     ppt.language_id = language_id

     return ppt


# ---------------- VIDEO ---------------- #

    @staticmethod
    def update_video(
      video: VideoMaster,
      video_name: str,
      video_description: str | None,
      video_url: str,
      status: int,
      language_id: int,
  ) -> VideoMaster:

      video.video_name = video_name
      video.video_description = video_description
      video.video_url = video_url
      video.status = status
      video.language_id = language_id

      return video



    @staticmethod
    def update_document(
     document: DocumentMaster,
     request,
     doc_image: str | None,
):

     document.doc_title = request.doc_title
     document.doc_description = request.doc_description
     document.doc_category_id = request.doc_category_id
     document.doc_type = request.doc_type
     document.status = request.status

     document.module_id = request.module_id
     document.submodule_id = request.submodule_id
     document.topic_id = request.topic_id

     document.language_id = request.language_id

     document.self_paced_learning = request.self_paced_learning
     document.pre_session_assessment = request.pre_session_assessment
     document.main_content_of_the_module = request.main_content_of_the_module
     document.post_session_assessment = request.post_session_assessment

     document.doc_duration = request.doc_duration

     if doc_image is not None:
        document.doc_image = doc_image

     return document


    @staticmethod
    def get_translation(
     db: Session,
     parent_id: int,
     language_id: int,
):
     return (
        db.query(DocumentMaster)
        .filter(
            DocumentMaster.parent_id == parent_id,
            DocumentMaster.language_id == language_id,
            DocumentMaster.deleted_at.is_(None),
        )
        .first()
    )


    @staticmethod
    def create_translation_document(
     db: Session,
     parent: DocumentMaster,
     language_id: int,
     title: str,
     description: str | None,
     doc_image: str | None,
     doc_ref_id: int,
) -> DocumentMaster:

     translation = DocumentMaster(
        parent_id=parent.parent_id,          # Link with original document

        doc_title=title,
        doc_description=description,

        doc_category_id=parent.doc_category_id,

        doc_image=doc_image,
        doc_file=None,

        doc_type=parent.doc_type,
        doc_ref_id=doc_ref_id,

        status=parent.status,

        module_id=parent.module_id,
        submodule_id=parent.submodule_id,
        topic_id=parent.topic_id,

        language_id=language_id,

        self_paced_learning=parent.self_paced_learning,
        pre_session_assessment=parent.pre_session_assessment,
        main_content_of_the_module=parent.main_content_of_the_module,
        post_session_assessment=parent.post_session_assessment,

        doc_duration=parent.doc_duration,
    )

     db.add(translation)
     db.flush()

     return translation


    @staticmethod
    def update_translation_document(
     translation: DocumentMaster,
     title: str,
     description: str | None,
     doc_image: str | None,
     doc_ref_id: int | None,
):

     translation.doc_title = title
     translation.doc_description = description

     if doc_image is not None:
        translation.doc_image = doc_image

     if doc_ref_id is not None:
        translation.doc_ref_id = doc_ref_id

     return translation


    @staticmethod
    def get_active_languages(db: Session):
     return (
        db.query(
            LanguageMaster.language_id,
            LanguageMaster.language_name,
        )
        .filter(
            LanguageMaster.is_active == 1,
            LanguageMaster.language_id.in_([1, 2, 3, 4]),
        )
        .order_by(LanguageMaster.language_id)
        .all()
    )

    @staticmethod
    def get_existing_translations(
     db: Session,
     parent_id: int,
     base_language: int,
):
     return (
        db.query(
            DocumentMaster.doc_id,
            DocumentMaster.language_id,
            DocumentMaster.doc_title,
        )
        .filter(
            DocumentMaster.parent_id == parent_id,
            DocumentMaster.language_id != base_language,
            DocumentMaster.deleted_at.is_(None),
        )
        .order_by(DocumentMaster.language_id)
        .all()
    )

     document = DocumentRepository.get_document_by_id(
     db=db,
     doc_id=document_id,
)


    @staticmethod 
    def export_documents(
     db: Session,
     status: int | None = None,
     doc_category_id: int | None = None,
     doc_ref_id: int | None = None,
):
     query = (
        db.query(
            DocumentMaster.doc_id,
            DocumentMaster.doc_title,
            DocumentMaster.doc_description,
            DocumentCategory.doc_category_name.label("category_name"),
            DocumentMaster.doc_type,
            DocumentMaster.doc_ref_id,
            DocumentMaster.status,
            DocumentMaster.created_at,
            DocumentMaster.updated_at,
        )
        .outerjoin(
           DocumentCategory,
            DocumentMaster.doc_category_id
            == DocumentCategory.doc_category_id,
        )
        .filter(DocumentMaster.deleted_at.is_(None))
    )

     if status is not None:
        query = query.filter(DocumentMaster.status == status)

     if doc_category_id is not None:
        query = query.filter(
            DocumentMaster.doc_category_id == doc_category_id
        )

     if doc_ref_id is not None:
        query = query.filter(
            DocumentMaster.doc_ref_id == doc_ref_id
        )

     return query.order_by(DocumentMaster.doc_id).all()