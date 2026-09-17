"""
Participant profile photo upload.
"""

import uuid
from datetime import datetime
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.modules.mobile.auth.repository import MobileAuthRepository

# Written into the API's own uploads folder, which the media endpoint also
# searches, so the saved path resolves straight back for display.
PHOTO_DIR = Path("uploads/participants")

RELATIVE_PREFIX = "uploads/participants"

ALLOWED_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp"}

MAX_BYTES = 5 * 1024 * 1024


class ProfileService:

    @staticmethod
    async def save_photo(
        db: Session,
        participant,
        upload: UploadFile,
    ) -> str:

        suffix = Path(upload.filename or "").suffix.lower()

        if suffix not in ALLOWED_SUFFIXES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please choose a JPG, PNG or WEBP image.",
            )

        content = await upload.read()

        if not content:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The selected file is empty.",
            )

        if len(content) > MAX_BYTES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please choose an image under 5 MB.",
            )

        folder = PHOTO_DIR / datetime.now().strftime("%Y/%m")
        folder.mkdir(parents=True, exist_ok=True)

        name = f"{participant.participant_id}_{uuid.uuid4().hex[:12]}{suffix}"

        (folder / name).write_bytes(content)

        stored = (
            f"{RELATIVE_PREFIX}/{datetime.now().strftime('%Y/%m')}/{name}"
        )

        MobileAuthRepository.update_photo(
            db=db,
            participant=participant,
            images=stored,
        )

        return stored
