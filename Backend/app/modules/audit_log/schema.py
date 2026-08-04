from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AuditLogBase(BaseModel):
    user_email: str
    action: str
    entity: str
    entity_id: str | None = None
    details: str | None = None


class AuditLogCreate(AuditLogBase):
    pass


class AuditLogSchema(AuditLogBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int | None
    created_at: datetime
