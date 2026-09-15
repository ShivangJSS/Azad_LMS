import logging
import os
from typing import Callable, Awaitable

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError

# Routers
# pyrefly: ignore [missing-import]
from app.modules.users.router import router as user_router
from app.modules.auth.router import router as auth_router
from app.modules.centres.router import router as centres_router
from app.modules.master.state.router import router as state_router
from app.modules.master.district.router import router as district_router
from app.modules.audit_log.router import router as audit_log_router
from app.modules.batch.router import router as batch_router
from app.modules.document.router import router as document_router
from app.modules.reference_data.router import router as reference_data_router
from app.modules.course.router import router as course_router
from app.modules.module.Topic.router import topic_router as topic_router
from app.modules.module.router import router as module_router
from app.modules.pdf.router import router as pdf_router
from app.modules.ppt.router import router as ppt_router
from app.modules.video.router import router as video_router
from app.modules.dashboard.router import router as dashboard_router

from app.modules.assessment.router.mcq_route import router as mcq_router
from app.modules.assessment.router.scq_route import router as scq_router
from app.modules.assessment.router.drop_bucket_route import (
    router as drop_bucket_router,
)
from app.modules.assessment.router.match_making_route import (
    router as match_making_router,
)
from app.modules.assessment.router.match_correct_answer_route import (
    router as match_correct_answer_router,
)
from app.modules.assessment.router.upload_route import (
    router as assessment_upload_router,
)

from app.modules.mobile.auth.router import router as mobile_auth_router
from app.modules.mobile.dashboard.routes import router as mobile_dashboard_router
from app.modules.mobile.module.routes import router as mobile_module_router
from app.modules.mobile.feedback.routes import router as feedback_router

from app.modules.users.exceptions import (
    EmailAlreadyExistsError,
    UserNotFoundError,
)

# ============================================================
# Application
# ============================================================

app = FastAPI(
    title="Azad LMS",
    description="Azad LMS API",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

# Default origins.
# Production frontend has been added here.
_DEFAULT_ORIGINS = (
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://lms.azadfoundation.com",
    "https://demo-azadlms.indevconsultancy.in",
    "http://localhost:8066",
    "http://127.0.0.1:8066",
    "http://localhost:4173",
    "http://192.168.10.19:4173",
)

# If ALLOWED_ORIGINS is configured in the production environment,
# it takes priority over the defaults.
_raw_origins = os.getenv("ALLOWED_ORIGINS")

if _raw_origins:
    origins = [origin.strip() for origin in _raw_origins.split(",") if origin.strip()]
else:
    origins = list(_DEFAULT_ORIGINS)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Request Validation Exception Handler
# ============================================================


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request,
    exc: RequestValidationError,
):
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )


# ============================================================
# Security Headers + Global Exception Logging
# ============================================================


@app.middleware("http")
async def security_headers(
    request: Request,
    call_next: Callable[[Request], Awaitable[Response]],
) -> Response:
    try:
        response: Response = await call_next(request)

    except Exception:
        # IMPORTANT:
        # Keep the real traceback in the server logs while returning
        # a generic error to the client.
        logging.getLogger("uvicorn.error").exception(
            "Unhandled error on %s %s",
            request.method,
            request.url.path,
        )

        response = JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Internal server error."},
        )

    response.headers.setdefault(
        "X-Content-Type-Options",
        "nosniff",
    )

    if not request.url.path.startswith("/uploads"):
        response.headers.setdefault(
            "X-Frame-Options",
            "DENY",
        )

    response.headers.setdefault(
        "Referrer-Policy",
        "strict-origin-when-cross-origin",
    )

    return response


# ============================================================
# Static Upload Directories
# ============================================================

_APP_DIR = os.path.dirname(os.path.abspath(__file__))
_BASE_DIR = os.path.dirname(_APP_DIR)

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
    def __init__(self, directories, **kwargs):
        self._search_dirs = [os.path.realpath(directory) for directory in directories]

        super().__init__(
            directory=self._search_dirs[0],
            check_dir=False,
            **kwargs,
        )

    async def check_config(self):
        # Directories are optional because multiple possible locations
        # are searched.
        return

    def lookup_path(self, path):
        for directory in self._search_dirs:
            full_path = os.path.realpath(os.path.join(directory, path))

            # Prevent path traversal.
            if full_path != directory and not full_path.startswith(directory + os.sep):
                continue

            try:
                return full_path, os.stat(full_path)

            except (
                FileNotFoundError,
                NotADirectoryError,
            ):
                continue

        return "", None


app.mount(
    "/uploads",
    MultiDirStaticFiles(
        directories=_UPLOAD_DIRS,
    ),
    name="uploads",
)


# ============================================================
# Application Exception Handlers
# ============================================================


@app.exception_handler(UserNotFoundError)
async def user_not_found_exception_handler(
    request: Request,
    exc: UserNotFoundError,
):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": "User not found."},
    )


@app.exception_handler(EmailAlreadyExistsError)
async def email_already_exists_exception_handler(
    request: Request,
    exc: EmailAlreadyExistsError,
):
    return JSONResponse(
        status_code=status.HTTP_409_CONFLICT,
        content={"detail": "A user with this email already exists."},
    )


# ============================================================
# Application Routers
# ============================================================

app.include_router(user_router)
app.include_router(auth_router)
app.include_router(centres_router)

app.include_router(state_router)
app.include_router(district_router)

app.include_router(audit_log_router)

app.include_router(document_router)
app.include_router(reference_data_router)

app.include_router(course_router)
app.include_router(batch_router)

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

# Mobile APIs
app.include_router(mobile_auth_router)
app.include_router(mobile_dashboard_router)
app.include_router(mobile_module_router)
app.include_router(feedback_router)
