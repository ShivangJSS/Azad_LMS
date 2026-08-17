from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.modules.mobile.core.dependencies import get_current_participant
from app.modules.mobile.profile.schema import PhotoUploadResponse
from app.modules.mobile.profile.service import ProfileService

# Mounted onto the module router, so the path is
# /mobile/module/profile/photo and no change to main.py is needed.
router = APIRouter(
    prefix="/profile",
    tags=["Mobile Profile"],
)


@router.post(
    "/photo",
    response_model=PhotoUploadResponse,
)
async def upload_photo(
    file: UploadFile = File(...),
    participant=Depends(get_current_participant),
    db: Session = Depends(get_db),
):
    """
    Replace the signed-in participant's profile photo.
    """

    stored = await ProfileService.save_photo(
        db=db,
        participant=participant,
        upload=file,
    )

    return PhotoUploadResponse(
        images=stored,
        message="Profile photo updated.",
    )
