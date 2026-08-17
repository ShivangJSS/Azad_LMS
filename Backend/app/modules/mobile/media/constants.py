import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

# Root of the Laravel-era storage folder that holds every uploaded video,
# pdf, ppt and image. Database columns store paths relative to this, such as
# "app/uploads/English/videos/x.mp4".
#
# Override with MEDIA_STORAGE_ROOT in .env when the folder moves.
DEFAULT_STORAGE_ROOT = (
    r"D:\projects\16-07-2026_lms.azadfoundation.com"
    r"\lms.azadfoundation.com\storage"
)

STORAGE_ROOT = Path(
    os.getenv("MEDIA_STORAGE_ROOT", DEFAULT_STORAGE_ROOT)
).resolve()

# Files uploaded through this API land here instead, so every root is
# searched before giving up.
BACKEND_UPLOADS = Path("uploads").resolve()

# The API's working directory. Needed because paths written by this API are
# stored with their "uploads/" prefix intact, so joining them onto
# BACKEND_UPLOADS would produce "uploads/uploads/...".
BACKEND_ROOT = Path(".").resolve()

SEARCH_ROOTS = [STORAGE_ROOT, BACKEND_UPLOADS, BACKEND_ROOT]

# Read in 1 MB slices so a 64 MB video never sits in memory whole.
CHUNK_SIZE = 1024 * 1024

CONTENT_TYPES = {
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".webm": "video/webm",
    ".m4v": "video/x-m4v",
    ".pdf": "application/pdf",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx": (
        "application/vnd.openxmlformats-officedocument"
        ".presentationml.presentation"
    ),
    ".doc": "application/msword",
    ".docx": (
        "application/vnd.openxmlformats-officedocument"
        ".wordprocessingml.document"
    ),
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".txt": "text/plain",
}

DEFAULT_CONTENT_TYPE = "application/octet-stream"
