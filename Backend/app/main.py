from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.modules.auth.router import router as auth_router # type: ignore
from app.modules.UserManagement.router import router as users_router # type: ignore

app = FastAPI(
    title="Azad LMS API",
    description="API for Azad Learning Management System",
    version="1.0.0",
)

# Define the list of allowed origins for CORS
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "Azad LMS API is running"}


# Include application routers
app.include_router(auth_router)
app.include_router(users_router)
