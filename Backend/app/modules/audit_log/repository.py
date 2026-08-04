from sqlalchemy.orm import Session

from .model import AuditLog


def create_audit_log_entry(db: Session, log_entry: AuditLog) -> AuditLog:
    db.add(log_entry)
    db.flush()  # Use flush to get the ID without committing the transaction
    db.refresh(log_entry)
    return log_entry
