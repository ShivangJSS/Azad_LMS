from fastapi import FastAPI
from app.modules.centres.router import router as centre_router
from app.modules.auth.router import router as auth_router
from app.modules.course.router import router as course_router
from app.modules.assessment.router.match_correct_answer_route import (
    router as match_correct_answer_router,
)
from app.modules.mobile.feedback.routes import router as feedback_router
from app.modules.batch.router import router as batch_router
from app.modules.assessment.router.mcq_route import router as mcq_router
from app.modules.assessment.router.match_making_route import (
    router as match_making_router,
)
from app.modules.mobile.auth.router import router as mobile_auth_router
from app.modules.mobile.dashboard.routes import router as mobile_dashboard_router
from app.modules.mobile.module.routes import router as mobile_module_router
from app.modules.assessment.router.scq_route import router as scq_router
from app.modules.module.router import router as module_router
from app.modules.assessment.router.drop_bucket_route import router as drop_bucket_router
from app.modules.Topic.router import router as topic_router
from fastapi.middleware.cors import CORSMiddleware
from app.modules.document.model import (
    DocumentMaster,
    LanguageMaster,
    TopicMaster,
    PdfMaster,
    PptMaster,
    VideoMaster,
)

from app.modules.module.model import ModuleMaster
from app.modules.document.router import router as document_router
from fastapi.staticfiles import StaticFiles
from app.modules.dashboard.routes import router as dashboard_router
from app.modules.users.router import (
    user_router,
    participants_router,
)
from fastapi.staticfiles import StaticFiles




app = FastAPI(
    title="Azad LMS API",
    version="1.0.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.include_router(document_router)
app.include_router(drop_bucket_router)
app.include_router(auth_router)
app.include_router(feedback_router)
app.include_router(mcq_router)
app.include_router(scq_router)
app.include_router(dashboard_router)
app.include_router(user_router)
app.include_router(match_making_router)
app.include_router(module_router)
app.include_router(topic_router, prefix="/api/v1")
app.include_router(participants_router)
app.include_router(batch_router)
app.include_router(course_router)
app.include_router(mobile_auth_router)
app.include_router(mobile_dashboard_router)
app.include_router(mobile_module_router)
app.include_router(centre_router)
app.include_router(match_correct_answer_router)

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads",
)
@app.get("/")
def root():
    return {
        "message": "Azad LMS API is running"
    }