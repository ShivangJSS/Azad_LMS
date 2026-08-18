import os
import uuid
from fastapi import HTTPException, UploadFile, status

BASE_UPLOAD_DIR = "uploads"

# Reject uploads larger than this to avoid memory-exhaustion DoS.
MAX_UPLOAD_BYTES = 200 * 1024 * 1024  # 200 MB

# Allow-list of safe upload extensions. Files under uploads/ are served from
# the app origin, so extensions that can execute as active content
# (.html, .htm, .svg, .js, .xhtml, .php, ...) must never be accepted here.
ALLOWED_UPLOAD_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".webp", ".gif",
    ".pdf", ".ppt", ".pptx", ".doc", ".docx", ".xls", ".xlsx",
    ".mp4", ".webm", ".mov", ".mkv", ".avi",
}

# Image-only subset for icon/photo fields.
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}


def validate_upload(file: UploadFile, allowed_extensions: set | None = None) -> str:
    """Validate an upload written directly (not via save_file): enforce the
    extension allow-list and the size cap. Returns the lowercased extension.
    Raises HTTPException on rejection."""
    allowed = allowed_extensions or ALLOWED_UPLOAD_EXTENSIONS

    extension = os.path.splitext(file.filename or "")[1].lower()
    if extension not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type.",
        )

    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)
    if size > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File is larger than 200 MB.",
        )

    return extension


async def save_file(file: UploadFile | None, folder: str):
    if file is None:
        return None

    extension = os.path.splitext(file.filename or "")[1].lower()

    if extension not in ALLOWED_UPLOAD_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file type.",
        )

    # Reject oversized files by measuring the stream before reading it in.
    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)

    if size > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File is larger than 200 MB.",
        )

    upload_dir = os.path.join(BASE_UPLOAD_DIR, folder)
    os.makedirs(upload_dir, exist_ok=True)

    filename = f"{uuid.uuid4()}{extension}"

    filepath = os.path.join(upload_dir, filename)

    with open(filepath, "wb") as buffer:
        buffer.write(await file.read())

    return filename


async def save_image(file: UploadFile | None):
    return await save_file(file, "participants")