from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel


# =========================================================
# PDF Update
# =========================================================

class PdfUpdateRequest(BaseModel):
    pdf_name: Optional[str] = None
    pdf_description: Optional[str] = None
    cloud_url: Optional[str] = None
    language_id: Optional[int] = None
    status: Optional[int] = None
