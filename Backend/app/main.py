import logging
import os

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

# Assuming your routers and exceptions are here
from app.modules.users import router as user_router
from app.modules.auth import router as auth_router
from app.modules.centres import router as centres_router
from app.modules.master.state import router as state_router
from app.modules.master.district import router as district_router
from app.modules.audit_log import router as audit_log_router
from app.modules.users.exceptions import (
    EmailAlreadyExistsError,
    UserNotFoundError,
)
from app.modules.batch import router as batch_router
from app.modules.document import router as document_router
from app.modules.reference_data import router as reference_data_router
from app.modules.course import router as course_router # Keep this line as is
from app.modules.module.Topic.router import topic_router as topic_router
from app.modules.module.router import router as module_router
from app.modules.pdf.router import router as pdf_router
from app.modules.ppt.router import router as ppt_router
from app.modules.video.router import router as video_router
from app.modules.dashboard.router import router as dashboard_router
from app.modules.assessment.router.mcq_route import router as mcq_router
from app.modules.assessment.router.scq_route import router as scq_router
from app.modules.assessment.router.drop_bucket_route import router as drop_bucket_router
from app.modules.assessment.router.match_making_route import router as match_making_router
from app.modules.assessment.router.match_correct_answer_route import (
    router as match_correct_answer_router,
)
from app.modules.assessment.router.upload_route import router as assessment_upload_router


from fastapi.exceptions import RequestValidationError


# You might have other routers to import here

app = FastAPI(
    title="Azad LMS",
    description="Azad LMS API",
    version="1.0.0",
)

# Custom Exception Handler for RequestValidationError
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    # This handler prevents the server from crashing with a UnicodeDecodeError
    # when the request body is not valid JSON (e.g., multipart/form-data).
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Unprocessable Content: The request body is not valid JSON."},
    )

# Baseline security headers on every response. Registered BEFORE CORS so that
# CORSMiddleware stays the OUTERMOST middleware and always attaches its
# Access-Control-Allow-Origin header — including on error responses. nosniff
# stops the browser from MIME-sniffing an uploaded file served from /uploads
# into active content (defence-in-depth alongside the upload allow-list).
@app.middleware("http")
async def security_headers(request: Request, call_next):
    try:
        response = await call_next(request)
    except Exception:
        # Turn an unhandled error into a real response INSIDE the CORS layer.
        # Otherwise it bubbles to the outermost handler, comes back without an
        # Access-Control-Allow-Origin header, and the browser reports it as a
        # misleading "CORS error". The full traceback is still logged below.
        logging.getLogger("uvicorn.error").exception(
            "Unhandled error on %s %s", request.method, request.url.path
        )
        response = JSONResponse(
            status_code=500,
            content={"detail": "Internal server error."},
        )
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    # Uploaded media (PDF previews, etc.) must be embeddable in the app's
    # own iframes, so only forbid framing on non-/uploads responses.
    if not request.url.path.startswith("/uploads"):
        response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "strict-origin-when-cross-origin")
    return response


# CORS Middleware — origins are env-driven (comma-separated ALLOWED_ORIGINS),
# with a sane default for local dev + production. Added LAST so it is the
# outermost middleware and its headers survive on every response.
_DEFAULT_ORIGINS = (
    "http://localhost:5173,"
    "http://127.0.0.1:5173,"
    "https://lms.azadfoundation.com"
)
origins = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", _DEFAULT_ORIGINS).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Uploaded media (/uploads) is served read-only from SEVERAL on-disk locations,
# searched in order: new runtime uploads first, then the migrated Laravel
# "storage" folders (where the existing images / pdf / ppt / video live). This
# lets a stored path like "uploads/English/images/x.png" resolve to
# storage/app/uploads/English/images/x.png without moving any files.
# ---------------------------------------------------------------------------
_APP_DIR = os.path.dirname(os.path.abspath(__file__))          # .../Backend/app
_BASE_DIR = os.path.dirname(_APP_DIR)                          # .../Backend

# All the on-disk locations a "/uploads/..." path might live in, searched in
# order. Covers new runtime uploads and BOTH copies of the migrated Laravel
# storage folder (Backend/app/storage/... and Backend/storage/...).
_UPLOAD_DIRS = [
    os.path.join(_BASE_DIR, "uploads"),
    os.path.join(_APP_DIR, "storage", "app", "uploads"),
    os.path.join(_BASE_DIR, "storage", "app", "uploads"),
    os.path.join(_APP_DIR, "storage", "uploads"),
    os.path.join(_BASE_DIR, "storage", "uploads"),
    os.path.join(_APP_DIR, "storage", "app", "public"),
    os.path.join(_BASE_DIR, "storage", "app", "public"),
]


class MultiDirStaticFiles(StaticFiles):
    """StaticFiles that resolves a requested path across several directories.

    check_config is disabled because our search directories may not all exist;
    lookup_path just tries each in turn and 404s if none contain the file.
    """

    def __init__(self, directories, **kwargs):
        self._search_dirs = [os.path.realpath(d) for d in directories]
        super().__init__(directory=self._search_dirs[0], check_dir=False, **kwargs)

    async def check_config(self):
        # No-op: don't require the first directory to exist.
        return

    def lookup_path(self, path):
        for directory in self._search_dirs:
            full_path = os.path.realpath(os.path.join(directory, path))
            # Block path traversal outside the search directory.
            if full_path != directory and not full_path.startswith(
                directory + os.sep
            ):
                continue
            try:
                return full_path, os.stat(full_path)
            except (FileNotFoundError, NotADirectoryError):
                continue
        return "", None


app.mount(
    "/uploads",
    MultiDirStaticFiles(directories=_UPLOAD_DIRS),
    name="uploads",
)


# Exception Handlers
@app.exception_handler(UserNotFoundError)
async def user_not_found_exception_handler(request: Request, exc: UserNotFoundError):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": "User not found."},
    )


@app.exception_handler(EmailAlreadyExistsError)
async def email_already_exists_exception_handler(
    request: Request, exc: EmailAlreadyExistsError
):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": "A user with this email already exists."},
    )


# Include your application's routers
app.include_router(user_router.router)
app.include_router(auth_router.router)
app.include_router(centres_router.router)
app.include_router(state_router.router)
app.include_router(district_router.router)
app.include_router(audit_log_router.router)
app.include_router(document_router.router)
app.include_router(reference_data_router.router)
app.include_router(course_router.router)
app.include_router(batch_router.router)
app.include_router(topic_router) 
app.include_router(module_router)
app.include_router(pdf_router)
app.include_router(ppt_router)
app.include_router(video_router)
app.include_router(dashboard_router)
app.include_router(mcq_router)
app.include_router(scq_router)
app.include_router(drop_bucket_router)
app.include_router(match_making_router)
app.include_router(match_correct_answer_router)
app.include_router(assessment_upload_router)