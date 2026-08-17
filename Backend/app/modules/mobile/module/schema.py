from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


# -------------------------
# Module List Item
# -------------------------
class ModuleListItem(BaseModel):
    module_id: int
    parent_id: Optional[int] = None

    module_name: Optional[str] = None
    module_description: Optional[str] = None

    module_type_id: Optional[int] = None
    module_type_name: Optional[str] = None

    duration_minutes: Optional[int] = Field(
        default=None,
        description=(
            "module_duration parsed to minutes. Null when the stored value "
            "is not expressed in minutes (some rows hold '45 Days')."
        ),
    )

    duration_label: Optional[str] = Field(
        default=None,
        description="Raw module_masters.module_duration value",
    )

    module_icon: Optional[str] = Field(
        default=None,
        description=(
            "Bare filename stored under uploads/module_icons/. Returned raw, "
            "the same as the web module endpoints do."
        ),
    )

    icon_images: Optional[str] = Field(
        default=None,
        description=(
            "Legacy relative path kept from the previous LMS, e.g. "
            "'app/uploads/English/images/x.png'. Returned raw."
        ),
    )

    language_id: Optional[int] = None

    status: str = Field(
        description="locked | active | completed",
        examples=["active"],
    )

    is_locked: bool

    model_config = ConfigDict(from_attributes=True)


# -------------------------
# Module List Response
# -------------------------
class ModuleListResponse(BaseModel):
    language_id: int

    total: int = Field(
        description="Modules assigned to this participant",
    )

    completed: int = Field(
        description="Modules with lock_status = 2",
    )

    modules: list[ModuleListItem]


# -------------------------
# Module Type
# -------------------------
class ModuleTypeItem(BaseModel):
    module_type_id: int
    module_type: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# -------------------------
# Language
# -------------------------
class LanguageItem(BaseModel):
    language_id: int
    language_code: Optional[str] = None
    language_name: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# -------------------------
# Topic Item
# -------------------------
class TopicItem(BaseModel):
    topic_id: int
    topic_name: Optional[str] = None

    doc_id: Optional[int] = None
    doc_title: Optional[str] = None

    doc_type: Optional[str] = Field(
        default=None,
        description="Video | PDF | PPT",
        examples=["Video"],
    )

    duration_minutes: Optional[int] = None

    content_path: Optional[str] = Field(
        default=None,
        description=(
            "Stored path of the file, e.g. "
            "'app/uploads/English/videos/x.mp4'. Relative to the LMS upload "
            "root, not a ready-made URL."
        ),
    )

    youtube_url: Optional[str] = Field(
        default=None,
        description="Set instead of content_path for externally hosted video",
    )

    thumbnail: Optional[str] = Field(
        default=None,
        description="document_masters.doc_image, returned raw",
    )

    model_config = ConfigDict(from_attributes=True)


# -------------------------
# Module Topics Response
# -------------------------
class ModuleOverview(BaseModel):
    """
    The module's own content, shown above the topic list.
    """

    module_id: int
    module_name: Optional[str] = None
    module_description: Optional[str] = None
    module_overview: Optional[str] = None
    module_objective: Optional[str] = None

    duration_minutes: Optional[int] = None
    duration_label: Optional[str] = None

    module_type_id: Optional[int] = None
    module_icon: Optional[str] = None
    icon_images: Optional[str] = None

    has_main_content: bool = False
    has_post_assessment: bool = False

    model_config = ConfigDict(from_attributes=True)


class ModuleTopicsResponse(BaseModel):
    module_id: int
    language_id: int
    total: int

    module: Optional[ModuleOverview] = Field(
        default=None,
        description="Module overview and objective, for the detail header",
    )

    topics: list[TopicItem]
