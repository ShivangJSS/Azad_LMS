from datetime import datetime
from typing import Optional

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



