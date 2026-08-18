from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


# =========================================================
# PPT Update
# =========================================================

class PptUpdateRequest(BaseModel):
    ppt_name: Optional[str] = None
    ppt_description: Optional[str] = None
    cloud_url: Optional[str] = None
    language_id: Optional[int] = None
    status: Optional[int] = None
