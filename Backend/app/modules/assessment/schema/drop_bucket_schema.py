from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


# ---------------- Bucket ---------------- #

class DropBucketOptionBase(BaseModel):
    bucket_name: str
    bucket_image: Optional[str] = None
    sort_order: Optional[int] = 1
    language_id: int


class DropBucketOptionCreate(DropBucketOptionBase):
    pass


class DropBucketOptionResponse(DropBucketOptionBase):
    bucket_id: int
    drop_bucket_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------------- Items ---------------- #

class DropBucketItemBase(BaseModel):
    bucket_id: Optional[int] = None
    item_name: str
    item_image: Optional[str] = None
    status: int

    language_id: int


class DropBucketItemCreate(DropBucketItemBase):
    pass


class DropBucketItemResponse(DropBucketItemBase):
    drop_bucket_item_id: int
    # Optional: legacy item rows can have null timestamps, and requiring them
    # here made the update endpoint 500 ("Unable to update bucket items")
    # when serialising such rows back in the response.
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ---------------- Master ---------------- #

class DropBucketBase(BaseModel):
    parent_id: int = 0

    drop_bucket_question_title: str
    drop_bucket_question_description: Optional[str] = None
    image_url: Optional[str] = None

    marks: Decimal
    status: int
    language_id: int


class DropBucketCreate(DropBucketBase):
    buckets: List[DropBucketOptionCreate] = []


class DropBucketUpdate(BaseModel):
    drop_bucket_question_title: Optional[str] = None
    drop_bucket_question_description: Optional[str] = None
    image_url: Optional[str] = None
    marks: Optional[Decimal] = None
    status: Optional[int] = None
    language_id: Optional[int] = None
    buckets: Optional[List[DropBucketOptionCreate]] = None


# ---------------- All-language bulk edit ---------------- #

class DropBucketBulkUpdate(BaseModel):
    """Edit the English question + all languages' buckets in one request.

    `buckets` is a FLAT list spanning every language; each bucket carries
    its own language_id so the backend can route it to the right master.
    """
    drop_bucket_question_title: str
    drop_bucket_question_description: Optional[str] = None
    image_url: Optional[str] = None
    marks: Decimal
    status: int
    buckets: List[DropBucketOptionCreate] = []


class DropBucketResponse(DropBucketBase):
    drop_bucket_id: Optional[int] = None

    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    bucket_name: Optional[str] = None
    bucket_image: Optional[str] = None

    buckets: List[DropBucketOptionResponse] = []

    is_translation: bool = True

    model_config = ConfigDict(from_attributes=True)



class DropBucketItemUpdate(BaseModel):
    drop_bucket_item_id: Optional[int] = None
    item_name: str
    item_image: Optional[str] = None
    status: int
    language_id: int


class DropBucketItemsUpdateRequest(BaseModel):
    items: List[DropBucketItemUpdate]