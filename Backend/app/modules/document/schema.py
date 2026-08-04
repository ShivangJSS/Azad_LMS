from datetime import datetime
from typing import Optional

from fastapi import File, Form, UploadFile
from pydantic import BaseModel, ConfigDict

class DocumentListResponse(BaseModel):
    doc_id: int
    doc_title: str
    doc_type: Optional[str]
    module_name: Optional[str]
    topic_name: Optional[str]
    language_name: Optional[str]
    status: Optional[int]


class PaginatedDocumentListResponse(BaseModel):
    data: list[DocumentListResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class DocumentCategoryResponse(BaseModel):
    id: int
    name: str


class DocumentDetailResponse(BaseModel):
    doc_id: int
    parent_id: Optional[int]

    doc_title: Optional[str]
    doc_description: Optional[str]

    doc_category_id: Optional[int]

    doc_image: Optional[str]
    doc_file: Optional[str]

    doc_type: Optional[str]
    doc_ref_id: Optional[int]

    module_id: Optional[int]
    module_name: Optional[str]

    topic_id: Optional[int]
    topic_name: Optional[str]

    language_id: Optional[int]
    language_name: Optional[str]

    # ---------- PDF ----------
    pdf_name: Optional[str]
    pdf_url: Optional[str]
    pdf_cloud_url: Optional[str]

    # ---------- PPT ----------
    ppt_name: Optional[str]
    ppt_url: Optional[str]
    ppt_cloud_url: Optional[str]

    # ---------- VIDEO ----------
    video_name: Optional[str]
    video_url: Optional[str]
    youtube_url: Optional[str]

    self_paced_learning: Optional[int]
    pre_session_assessment: Optional[int]
    main_content_of_the_module: Optional[int]
    post_session_assessment: Optional[int]

    doc_duration: Optional[str]

    status: Optional[int]

    created_at: Optional[datetime]
    updated_at: Optional[datetime]

class DocumentTranslationResponse(BaseModel):
    doc_id: int
    parent_id: int
    language_id: int
    language_name: str

    model_config = ConfigDict(from_attributes=True)


class DocumentViewResponse(BaseModel):
    document: DocumentDetailResponse
    translations: list[DocumentTranslationResponse]



# app/modules/document/schema.py


class DocumentCreateRequest(BaseModel):
    doc_title: str
    doc_description: Optional[str] = None

    doc_category_id: int
    doc_type: str
    status: int

    module_id: Optional[int] = None
    submodule_id: Optional[int] = None
    topic_id: Optional[int] = None

    language_id: int = 1

    self_paced_learning: int = 0
    pre_session_assessment: int = 0
    main_content_of_the_module: int = 0
    post_session_assessment: int = 0

    doc_duration: Optional[str] = None

    @classmethod
    def as_form(
        cls,
        doc_title: str = Form(...),
        doc_description: Optional[str] = Form(None),

        doc_category_id: int = Form(...),
        doc_type: str = Form(...),
        status: int = Form(...),

        module_id: Optional[int] = Form(None),
        submodule_id: Optional[int] = Form(None),
        topic_id: Optional[int] = Form(None),

        language_id: int = Form(1),

        self_paced_learning: int = Form(0),
        pre_session_assessment: int = Form(0),
        main_content_of_the_module: int = Form(0),
        post_session_assessment: int = Form(0),

        doc_duration: Optional[str] = Form(None),
    ):
        return cls(
            doc_title=doc_title,
            doc_description=doc_description,
            doc_category_id=doc_category_id,
            doc_type=doc_type,
            status=status,
            module_id=module_id,
            submodule_id=submodule_id,
            topic_id=topic_id,
            language_id=language_id,
            self_paced_learning=self_paced_learning,
            pre_session_assessment=pre_session_assessment,
            main_content_of_the_module=main_content_of_the_module,
            post_session_assessment=post_session_assessment,
            doc_duration=doc_duration,
        )





class DocumentUpdateRequest(BaseModel):
     doc_title: str
     doc_description: Optional[str] = None

     doc_category_id: int
     doc_type: str
     status: int

     module_id: Optional[int] = None
     submodule_id: Optional[int] = None
     topic_id: Optional[int] = None

     language_id: int = 1

     self_paced_learning: int = 0
     pre_session_assessment: int = 0
     main_content_of_the_module: int = 0
     post_session_assessment: int = 0

     doc_duration: Optional[str] = None

     @classmethod
     def as_form(
        cls,
        doc_title: str = Form(...),
        doc_description: Optional[str] = Form(None),

        doc_category_id: int = Form(...),
        doc_type: str = Form(...),
        status: int = Form(...),

        module_id: Optional[int] = Form(None),
        submodule_id: Optional[int] = Form(None),
        topic_id: Optional[int] = Form(None),

        language_id: int = Form(1),

        self_paced_learning: int = Form(0),
        pre_session_assessment: int = Form(0),
        main_content_of_the_module: int = Form(0),
        post_session_assessment: int = Form(0),

        doc_duration: Optional[str] = Form(None),
    ):
        return cls(
            doc_title=doc_title,
            doc_description=doc_description,
            doc_category_id=doc_category_id,
            doc_type=doc_type,
            status=status,
            module_id=module_id,
            submodule_id=submodule_id,
            topic_id=topic_id,
            language_id=language_id,
            self_paced_learning=self_paced_learning,
            pre_session_assessment=pre_session_assessment,
            main_content_of_the_module=main_content_of_the_module,
            post_session_assessment=post_session_assessment,
            doc_duration=doc_duration,
        )

class TranslationLanguageResponse(BaseModel):
    language_id: int
    language_name: str


class ExistingTranslationResponse(BaseModel):
    doc_id: int
    language_id: int
    doc_title: str


class TranslationFormResponse(BaseModel):
    document: DocumentDetailResponse
    languages: list[TranslationLanguageResponse]
    translations: list[ExistingTranslationResponse]
