from fastapi import APIRouter, Depends

from app.modules.auth.dependencies import get_current_user

router = APIRouter(
    prefix="/audit-logs",
    tags=["Audit Logs"],
    dependencies=[Depends(get_current_user)],
)

# In the future, you could add endpoints to view audit logs, for example:
# from typing import List
# from fastapi import Depends
# from sqlalchemy.orm import Session
# from . import service, schema
# from app.database.session import get_db

# @router.get("/", response_model=List[schema.AuditLogSchema])
# def read_audit_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
#     logs = service.get_audit_logs(db, skip=skip, limit=limit)
#     return logs
