import os
import uuid
from fastapi import UploadFile

BASE_UPLOAD_DIR = "uploads"


async def save_file(file: UploadFile | None, folder: str):
    if file is None:
        return None

    upload_dir = os.path.join(BASE_UPLOAD_DIR, folder)
    os.makedirs(upload_dir, exist_ok=True)

    extension = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{extension}"

    filepath = os.path.join(upload_dir, filename)

    with open(filepath, "wb") as buffer:
        buffer.write(await file.read())

    return filename


async def save_image(file: UploadFile | None):
    return await save_file(file, "participants")