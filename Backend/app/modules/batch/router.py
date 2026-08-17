from typing import Optional

from fastapi import (
    APIRouter,
    Depends,
    Query,
    status,
)
from sqlalchemy.orm import Session

from app.database.database import get_db

# Uncomment after enabling authentication
# from app.modules.auth.constants import UserRole
# from app.modules.auth.dependencies import require_roles
# from app.modules.auth.model import User

from app.modules.batch.schema import (
    BatchCreateRequest,
    BatchDetailResponse,
    BatchListResponse,
    BatchParticipantResponse,
    BatchResponse,
    BatchStatusUpdateRequest,
    BatchUpdateRequest,
)
from app.modules.batch.services import BatchService


router = APIRouter(
    prefix="/batches",
    tags=["Batch Master"],
)


@router.get(
    "",
    response_model=list[BatchListResponse],
)
def get_batches(
    state_id: Optional[int] = Query(None),
    district_id: Optional[int] = Query(None),
    status_filter: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return BatchService.get_batches(
        db=db,
        state_id=state_id,
        district_id=district_id,
        status_filter=status_filter,
        search=search,
    )


@router.post(
    "",
    response_model=BatchResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_batch(
    batch: BatchCreateRequest,
    db: Session = Depends(get_db),

    # Uncomment after enabling authentication
    # current_user: User = Depends(
    #     require_roles(UserRole.SUPER_ADMIN)
    # ),
):
    return BatchService.create_batch(
        db=db,
        batch=batch,

        # Replace with current_user.id after auth
        created_by=1,
    )


@router.get(
    "/{batch_id}",
    response_model=BatchDetailResponse,
)
def get_batch_by_id(
    batch_id: int,
    db: Session = Depends(get_db),
):
    return BatchService.get_batch_by_id(
        db=db,
        batch_id=batch_id,
    )


@router.put(
    "/{batch_id}",
    response_model=BatchResponse,
)
def update_batch(
    batch_id: int,
    batch: BatchUpdateRequest,
    db: Session = Depends(get_db),

    # Uncomment after enabling authentication
    # current_user: User = Depends(
    #     require_roles(UserRole.SUPER_ADMIN)
    # ),
):
    return BatchService.update_batch(
        db=db,
        batch_id=batch_id,
        data=batch,
    )


@router.patch(
    "/{batch_id}/status",
    response_model=BatchResponse,
)
def update_batch_status(
    batch_id: int,
    request: BatchStatusUpdateRequest,
    db: Session = Depends(get_db),

    # Uncomment after enabling authentication
    # current_user: User = Depends(
    #     require_roles(UserRole.SUPER_ADMIN)
    # ),
):
    return BatchService.update_batch_status(
        db=db,
        batch_id=batch_id,
        new_status=request.status,
    )


@router.delete(
    "/{batch_id}",
    status_code=status.HTTP_200_OK,
)
def delete_batch(
    batch_id: int,
    db: Session = Depends(get_db),

    # Uncomment after enabling authentication
    # current_user: User = Depends(
    #     require_roles(UserRole.SUPER_ADMIN)
    # ),
):
    return BatchService.delete_batch(
        db=db,
        batch_id=batch_id,
    )



@router.get(
    "/{batch_id}/participants",
    response_model=list[BatchParticipantResponse],
)
def get_batch_participants(
    batch_id: int,
    db: Session = Depends(get_db),
):
    return BatchService.get_batch_participants(
        db=db,
        batch_id=batch_id,
    )