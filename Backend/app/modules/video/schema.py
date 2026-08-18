from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


# =========================================================
# VIDEO Update
# =========================================================

class VideoUpdateRequest(BaseModel):
    video_name: Optional[str] = None
    video_description: Optional[str] = None
    youtube_url: Optional[str] = None
    language_id: Optional[int] = None
    status: Optional[int] = None
