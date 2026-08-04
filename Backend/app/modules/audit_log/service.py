from sqlalchemy.orm import Session

from app.modules.auth.model import User
from .model import AuditLog


def create_audit_log(
    db: Session,
    user: User,
    action: str,
    entity: str,
    entity_id: str | int | None = None,
    details: str | None = None,
):
    """
    Creates an audit log entry.
    The session is not committed here, it should be committed by the calling service.
    """
    log_entry = AuditLog(
        user_id=user.id,
        user_email=user.email,
        action=action,
        entity=entity,
        entity_id=str(entity_id) if entity_id is not None else None,
        details=details,
    )
    db.add(log_entry)