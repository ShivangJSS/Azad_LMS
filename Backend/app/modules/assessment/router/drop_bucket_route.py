from fastapi import APIRouter
from fastapi.params import Depends
from app.modules.assessment.model import DropBucket
from app.modules.assessment.controller.drop_bucket_controller import (
    DropBucketController,
)
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.modules.assessment.schema.drop_bucket_schema import (
    DropBucketItemResponse,
    DropBucketItemsUpdateRequest)

router = APIRouter(
    prefix="/drop-buckets",
    tags=["Assessment - Drop Bucket"],
)

# List
router.get(
    "/",
    summary="Get All Drop Buckets",
)(DropBucketController.get_all)

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


@router.get(
    "/buckets/{bucket_id}/items",
    response_model=list[DropBucketItemResponse],
 )
def get_items_by_bucket(
    bucket_id: int,
    db: Session = Depends(get_db),
 ):
    return DropBucketController.get_items_by_bucket(
        bucket_id=bucket_id,
        db=db,
    )


@router.get(
    "/buckets/{bucket_id}/items",
    response_model=list[DropBucketItemResponse],
)
def get_bucket_items(
    bucket_id: int,
    db: Session = Depends(get_db),
):
    return DropBucketController.get_items_by_bucket(
        bucket_id=bucket_id,
        db=db,
    )



@router.put(
    "/buckets/{bucket_id}/items",
    response_model=list[DropBucketItemResponse],
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