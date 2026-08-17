from pydantic import BaseModel, Field


class PhotoUploadResponse(BaseModel):
    images: str = Field(
        description="Stored path, ready to pass back to the media endpoint",
        examples=["uploads/participants/2026/08/98_a1b2c3d4e5f6.jpg"],
    )

    message: str
