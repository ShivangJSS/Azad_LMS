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

    language_id: int


class DropBucketItemCreate(DropBucketItemBase):
    pass


class DropBucketItemResponse(DropBucketItemBase):
    drop_bucket_item_id: int
    created_at: datetime
    updated_at: datetime

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


class DropBucketResponse(DropBucketBase):
    drop_bucket_id: int

    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    bucket_name: Optional[str] = None
    bucket_image: Optional[str] = None

    buckets: List[DropBucketOptionResponse] = []

    model_config = ConfigDict(from_attributes=True)



class DropBucketItemUpdate(BaseModel):
    drop_bucket_item_id: Optional[int] = None
    item_name: str
    item_image: Optional[str] = None
    status: int
    language_id: int


class DropBucketItemsUpdateRequest(BaseModel):
    items: List[DropBucketItemUpdate]