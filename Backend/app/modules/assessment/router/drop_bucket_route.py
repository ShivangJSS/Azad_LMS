from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.modules.assessment.controller.drop_bucket_controller import (
    DropBucketController,
)
from app.modules.assessment.schema.drop_bucket_schema import (
    DropBucketItemResponse,
    DropBucketItemsUpdateRequest,
    DropBucketCreate,
)

from app.shared.dependencies.module_access import Module, require_module_access

router = APIRouter(
    prefix="/drop-buckets",
    tags=["Assessment - Drop Bucket"],
    dependencies=[Depends(require_module_access(Module.ASSESSMENT))],
)

# List
router.get(
    "/",
    summary="Get All Drop Buckets",
)(DropBucketController.get_all)

# View all languages (flat) — single edit page
router.get(
    "/{parent_id}/all",
    summary="Get Drop Bucket with all languages' buckets",
)(DropBucketController.get_all_languages)

# Bulk save all languages (flat)
router.put(
    "/{parent_id}/all",
    summary="Bulk update Drop Bucket across all languages",
)(DropBucketController.bulk_update)

# All items of a question across its buckets (Show Items / Edit Items)
router.get(
    "/{drop_bucket_id}/items",
    summary="Get all items of a question across its buckets",
)(DropBucketController.get_question_items)

# View
router.get(
    "/{parent_id}",
    summary="Get Drop Bucket by Parent & Language",
)(DropBucketController.get_by_id)

# Create
router.post(
    "/",
    summary="Create Drop Bucket",
    status_code=201,
)(DropBucketController.create)

# Update
router.put(
    "/{drop_bucket_id}",
    summary="Update Drop Bucket",
)(DropBucketController.update)

# Delete
router.delete(
    "/{drop_bucket_id}",
    summary="Delete Drop Bucket",
)(DropBucketController.delete)


# Fetch Items by Bucket ID
@router.get(
    "/buckets/{bucket_id}/items",
    response_model=list[DropBucketItemResponse],
    summary="Get Bucket Items",
)
def get_bucket_items(
    bucket_id: int,
    language_id: int = Query(1),
    db: Session = Depends(get_db),
):
    return DropBucketController.get_items_by_bucket(
        bucket_id=bucket_id,
        language_id=language_id,
        db=db,
    )


# Update Items for Bucket
@router.put(
    "/buckets/{bucket_id}/items",
    response_model=list[DropBucketItemResponse],
    summary="Update Bucket Items",
)
def update_bucket_items(
    bucket_id: int,
    payload: DropBucketItemsUpdateRequest,
    db: Session = Depends(get_db),
):
    return DropBucketController.update_bucket_items(
        bucket_id=bucket_id,
        payload=payload,
        db=db,
    )


# Save Translation
@router.put(
    "/{parent_id}/translation",
    summary="Save Drop Bucket Translation",
)
def save_translation(
    parent_id: int,
    payload: DropBucketCreate,
    db: Session = Depends(get_db),
):
    return DropBucketController.save_translation(
        parent_id=parent_id,
        payload=payload,
        db=db,
    )
