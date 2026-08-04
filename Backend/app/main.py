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
from app.modules.course import router as course_router
# from app.modules.dashboard.router import router as dashboard_router

# You might have other routers to import here

app = FastAPI(
    title="Azad LMS",
    description="Azad LMS API",
    version="1.0.0",
)

# CORS Middleware
origins = [
    "http://localhost:5173",  # Your frontend origin
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Uploaded document media is served read-only by the API.
app.mount("/uploads", StaticFiles(directory="uploads/", check_dir=False), name="uploads")


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
# app.include_router(dashboard_router.router)