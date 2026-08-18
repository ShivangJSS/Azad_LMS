from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


# ==========================
# Create Module
# ==========================

class ModuleCreate(BaseModel):
    fk_course_id: int
    module_name: str
    module_description: str
    module_type: int
    module_duration: str
    publishing_status: str
    status: int
    language_id: int = 1
    module_overview: str
    module_objective: str


# ==========================
# Update Module
# ==========================

class ModuleUpdate(BaseModel):
    fk_course_id: int
    module_name: str
    module_description: str
    module_type: int
    module_duration: str
    publishing_status: str
    status: int
    language_id: int
    module_overview: str
    module_objective: str


# ==========================
# Translation
# ==========================

class ModuleTranslation(BaseModel):
    language_id: int
    module_name: str
    module_description: str
    module_overview: str
    module_objective: str
    status: int = 1


# ==========================
# Module List Response
# ==========================

class ModuleListResponse(BaseModel):
    module_id: int
    parent_id: Optional[int] = None
    module_name: str

    fk_course_id: Optional[int] = None

    module_type: Optional[int] = None
    module_type_name: Optional[str] = None

    language_id: Optional[int] = None
    language_name: Optional[str] = None

    topic_count: int = 0

    status: int

    publishing_status: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================
# Module Details
# ==========================

class ModuleDetail(BaseModel):
    module_id: int
    parent_id: Optional[int] = None

    fk_course_id: int

    module_name: str
    module_description: Optional[str] = None

    module_type: Optional[int] = None

    module_duration: Optional[str] = None

    publishing_status: Optional[str] = None

    status: int

    language_id: int

    module_overview: Optional[str] = None
    module_objective: Optional[str] = None

    icon_images: Optional[str] = None
    module_icon: Optional[str] = None

    created_by: Optional[int] = None

    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ==========================
# Translation Response
# ==========================

class ModuleTranslation(BaseModel):
    language_id: int
    module_name: str
    module_description: str | None = None
    module_overview: str | None = None
    module_objective: str | None = None

class AssessmentResponse(BaseModel):
    assessment_id: int
    assessment_name: str

class Config:
        from_attributes = True


class ModulePostAssessmentResponse(BaseModel):
    module_id: int
    assessments: List[AssessmentResponse]



class ScqAssessmentMappingResponse(BaseModel):
    scq_id: int
    scq_question_title: str
    scq_question_description: str | None = None
    image_url: str | None = None
    marks: int | None = None
    language_id: int | None = None
    language_name: str | None = None
    status: int
    is_checked: bool


class McqAssessmentMappingResponse(BaseModel):
    mcq_id: int
    mcq_question_title: str | None = None
    mcq_question_description: str | None = None
    image_url: str | None = None
    status: int | None = None
    marks: Decimal | None = None
    language_id: int | None = None
    language_name: str | None = None
    is_checked: bool

    class Config:
        from_attributes = True

class MatchMakingAssessmentMappingResponse(BaseModel):
    match_making_id: int
    match_making_question_title: str
    match_making_question_description: Optional[str] = None
    image_url: Optional[str] = None
    status: int
    marks: Optional[float] = None
    language_id: int
    language_name: Optional[str] = None
    is_checked: bool


class DropBucketAssessmentMappingResponse(
    BaseModel
):
    drop_bucket_id: int
    drop_bucket_question_title: str
    drop_bucket_question_description: str | None = None
    image_url: str | None = None
    status: int
    marks: float | None = None
    language_id: int
    language_name: str | None = None
    is_checked: bool

class AssessmentItem(BaseModel):
    assessment_id: int
    assessment_ref_id: int


class AssessmentMappingCreateRequest(BaseModel):
    assessment_type: str
    assessments: List[AssessmentItem]



# =========================================================
# Create Main Content
# =========================================================

class MainContentCreateRequest(BaseModel):
    module_id: int
    topic_id: int
    doc_id: int


class MainContentResponse(BaseModel):
    success: bool
    message: str


# =========================================================
# Topic Dropdown
# =========================================================

class TopicDropdownResponse(BaseModel):
    topic_id: int
    topic_name: str
    module_id: int | None = None
    language_name: str | None = None

    class Config:
        from_attributes = True


# =========================================================
# Document Dropdown
# =========================================================

class DocumentDropdownResponse(BaseModel):
    doc_id: int
    doc_title: str | None = None
    doc_description: str | None = None
    doc_type: str | None = None
    language_name: str | None = None

    class Config:
        from_attributes = True


# =========================================================
# Assigned Main Content Listing
# =========================================================

class MainContentListResponse(BaseModel):
    self_paced_learning_id: int
    module_id: int
    topic_id: int
    doc_id: int

    topic_name: str | None = None

    doc_title: str | None = None
    doc_type: str | None = None

    doc_ref_id: int | None = None

    language_id: int | None = None
    language_name: str | None = None

    is_active: int | None = None

    class Config:
        from_attributes = True

# =========================================================
# Deactivate Assessment Mapping (additive)
# =========================================================

class AssessmentMappingDeactivateRequest(BaseModel):
    assessment_id: int
    assessment_type: str
    assessment_ref_id: int
