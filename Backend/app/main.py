import os

from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from sqlalchemy import text

from app.database.database import engine

favicon_path = "app/static/favicon.ico"

app = FastAPI(
    title="Azad LMS API", version="1.0.0", docs_url="/docs", redoc_url="/redoc"
)


@app.get("/")
def home():
    return {"message": "Welcome to Azad LMS"}


@app.get("/db-test")
def db_test():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT 1"))
        return {"result": result.fetchone()}


@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    if os.path.exists(favicon_path):
        return FileResponse(favicon_path)
    return JSONResponse(status_code=204, content=None)
