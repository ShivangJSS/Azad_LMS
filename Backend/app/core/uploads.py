from __future__ import annotations

import shutil
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

MEDIA_ROOT = Path("uploads")

MAX_UPLOAD_BYTES = 200 * 1024 * 1024  # 200 MB

ALLOWED_EXTENSIONS = {
    "image": {".jpg", ".jpeg", ".png", ".webp", ".gif"},
    "pdf": {".pdf"},
    "ppt": {".ppt", ".pptx"},
    "video": {".mp4", ".webm", ".mov", ".mkv"},
}


def _validate(upload: UploadFile, kind: str) -> str:
    allowed = ALLOWED_EXTENSIONS.get(kind.lower())

    if allowed is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported upload kind: {kind}",
        )

    suffix = Path(upload.filename or "").suffix.lower()

    if suffix not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Allowed formats: {', '.join(sorted(allowed))}",
        )

    return suffix


def save_upload(upload: UploadFile, kind: str, folder: str) -> str:
    """Persist an upload and return the public URL path."""
    suffix = _validate(upload, kind)

    # Size check: seek to the end rather than reading the file into memory.
    upload.file.seek(0, 2)
    size = upload.file.tell()
    upload.file.seek(0)

    if size > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File is larger than 200 MB.",
        )

    target_dir = MEDIA_ROOT / folder
    target_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{suffix}"
    target_path = target_dir / filename

    with target_path.open("wb") as buffer:
        shutil.copyfileobj(upload.file, buffer)

    return f"/uploads/{folder}/{filename}"


def delete_upload(url_path: str | None) -> None:
    """Remove a previously saved file. Missing files are ignored."""
    if not url_path:
        return

    relative = url_path.removeprefix("/uploads/")
    target = MEDIA_ROOT / relative

    try:
        target.unlink(missing_ok=True)
    except OSError:
        pass
