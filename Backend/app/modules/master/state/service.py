"""Service layer for State Master module.

Encapsulates all business rules for state records: uniqueness enforcement,
role-based access control, audit logging, and transaction management.
Repository handles persistence; routers handle HTTP concerns only.
"""

from __future__ import annotations

import logging
import math
from datetime import date, datetime
from decimal import Decimal
from enum import Enum
from typing import Any, Final

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlalchemy.orm import Session

from . import repository
from .exceptions import (
    StateAlreadyExistsError,
    StateDeleteError,
    StateNameAlreadyExistsError,
    StateNotFoundError,
)
from .model import StateMaster
from .schema import (
    DeleteStateResponse,
    StateCreateRequest,
    StateListResponse,
    StateResponse,
    StateUpdateRequest,
)
from app.modules.audit_log.service import create_audit_log
from app.modules.auth.constants import UserRole
from app.modules.auth.model import User

logger = logging.getLogger(__name__)

ENTITY_NAME: Final[str] = "State"

PRIVILEGED_ROLES: Final[frozenset[str]] = frozenset(
    {UserRole.SUPER_ADMIN.value, UserRole.ADMIN.value}
)

# Maps database unique-constraint names to the domain exception they represent.
# Keep these in sync with the migration that creates them.
UNIQUE_CONSTRAINT_ERRORS: Final[dict[str, type[Exception]]] = {
    "state_name": StateNameAlreadyExistsError,
    "state_lgd_code": StateAlreadyExistsError,
}


def _json_safe(value: Any) -> Any:
    """Convert a column value into something JSONB can store."""
    if isinstance(value, (datetime, date)):
        return value.isoformat()

    if isinstance(value, Decimal):
        return float(value)

    if isinstance(value, Enum):
        return value.value

    return value


def _snapshot(instance: StateMaster) -> dict[str, Any]:
    """Return a JSON-serialisable copy of a model's column values.

    The result is handed straight to the JSONB column, so it must contain
    only primitives — never call str() on it.
    """
    return {
        column.name: _json_safe(getattr(instance, column.name))
        for column in instance.__table__.columns
    }


def _translate_integrity_error(error: IntegrityError) -> Exception:
    """Map a unique-constraint violation to its domain exception.

    Falls back to the LGD-code error, which is the primary uniqueness rule.
    """
    detail = str(getattr(error, "orig", error)).lower()

    for fragment, exception_class in UNIQUE_CONSTRAINT_ERRORS.items():
        if fragment in detail:
            return exception_class()

    return StateAlreadyExistsError()


def _get_state_or_404(db: Session, state_lgd_code: str) -> StateMaster:
    """Fetch a state by LGD code or raise StateNotFoundError."""
    state = repository.get_state_by_code(db, state_lgd_code)

    if state is None:
        logger.info("State not found: lgd_code=%s", state_lgd_code)
        raise StateNotFoundError()

    return state


def _assert_can_access_state(user: User, state: StateMaster) -> None:
    """Enforce row-level access: non-admins may only touch their own state."""
    if str(user.role) in PRIVILEGED_ROLES:
        return

    user_state_code = user.state_lgd_code

    if not user_state_code or str(user_state_code) != str(state.state_lgd_code):
        logger.warning(
            "Forbidden state access: user_id=%s role=%s target_lgd_code=%s",
            user.id,
            user.role,
            state.state_lgd_code,
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this resource.",
        )


def _assert_name_available(
    db: Session,
    state_name: str,
    exclude_lgd_code: str | None = None,
) -> None:
    """Raise if state_name is taken by a record other than exclude_lgd_code."""
    existing = repository.get_state_by_name(db, state_name)

    if existing is None:
        return

    if exclude_lgd_code is not None and str(existing.state_lgd_code) == str(
        exclude_lgd_code
    ):
        return

    raise StateNameAlreadyExistsError()


def create_state_service(
    db: Session,
    request: StateCreateRequest,
    current_user: User,
) -> StateResponse:
    """Create a new state record.

    Raises:
        StateAlreadyExistsError: LGD code is already in use.
        StateNameAlreadyExistsError: State name is already in use.
    """
    if repository.get_state_by_code(db, str(request.state_lgd_code)) is not None:
        raise StateAlreadyExistsError()

    _assert_name_available(db, request.state_name)

    state = StateMaster(
        state_lgd_code=request.state_lgd_code,
        state_name=request.state_name,
        status=request.status,
    )

    try:
        repository.create_state(db, state)
        db.flush()

        create_audit_log(
            db=db,
            user=current_user,
            action="CREATE",
            entity=ENTITY_NAME,
            entity_id=str(state.state_lgd_code), # type: ignore
            details=str({"new_state": request.model_dump(mode="json")}),
        )

        db.commit()
        db.refresh(state)

    except IntegrityError as error:
        db.rollback()
        logger.info(
            "State create conflict: lgd_code=%s name=%s",
            request.state_lgd_code,
            request.state_name,
        )
        raise _translate_integrity_error(error) from error

    except SQLAlchemyError:
        db.rollback()
        logger.exception("State create failed: lgd_code=%s", request.state_lgd_code)
        raise

    logger.info(
        "State created: lgd_code=%s by user_id=%s",
        state.state_lgd_code,
        current_user.id,
    )
    return StateResponse.model_validate(state)


def get_states_service(
    db: Session,
    state_name: str | None,
    status: str | None,
    page: int,
    per_page: int,
    current_user: User,
) -> StateListResponse:
    """Return a paginated, filtered list of states visible to the caller."""
    states, total = repository.get_states(
        db=db,
        state_name=state_name,
        status=status,
        page=page,
        per_page=per_page,
        current_user=current_user,
    )

    return StateListResponse(
        data=[StateResponse.model_validate(state) for state in states],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=math.ceil(total / per_page) if total and per_page else 0,
    )


def get_state_service(
    db: Session,
    state_lgd_code: str,
    current_user: User,
) -> StateResponse:
    """Return a single state, subject to role-based access rules."""
    state = _get_state_or_404(db, state_lgd_code)
    _assert_can_access_state(current_user, state)

    return StateResponse.model_validate(state)


def update_state_service(
    db: Session,
    state_lgd_code: str,
    request: StateUpdateRequest,
    current_user: User,
) -> StateResponse:
    """Update a state's name and status.

    The name-uniqueness check is skipped when the name is unchanged, so a
    status-only edit never conflicts with the record's own name.
    """
    state = _get_state_or_404(db, state_lgd_code)
    _assert_can_access_state(current_user, state)

    previous_state = _snapshot(state)

    if request.state_name is not None and request.state_name != state.state_name:
        _assert_name_available(
            db,
            request.state_name,
            exclude_lgd_code=str(state.state_lgd_code),
        )

    state.state_name = request.state_name if request.state_name is not None else state.state_name
    state.status = request.status if request.status is not None else state.status

    try:
        repository.update_state(db, state)
        db.flush()

        create_audit_log(
            db=db,
            user=current_user,
            action="UPDATE",
            entity=ENTITY_NAME,
            entity_id=str(state_lgd_code),
            details=str({
                "old_state": previous_state,
                "new_state": request.model_dump(mode="json"),
            }),
        )

        db.commit()
        db.refresh(state)

    except IntegrityError as error:
        db.rollback()
        logger.info(
            "State update conflict: lgd_code=%s name=%s",
            state_lgd_code,
            request.state_name,
        )
        raise _translate_integrity_error(error) from error

    except SQLAlchemyError:
        db.rollback()
        logger.exception("State update failed: lgd_code=%s", state_lgd_code)
        raise

    logger.info(
        "State updated: lgd_code=%s by user_id=%s",
        state_lgd_code,
        current_user.id,
    )
    return StateResponse.model_validate(state)


def delete_state_service(
    db: Session,
    state_lgd_code: str,
    current_user: User,
) -> DeleteStateResponse:
    """Delete a state.

    Raises:
        StateDeleteError: The state is referenced by other records.
    """
    state = _get_state_or_404(db, state_lgd_code)
    _assert_can_access_state(current_user, state)

    # Captured before the delete: the ORM instance is expired afterwards.
    deleted_state = _snapshot(state)

    try:
        repository.delete_state(db, state)
        db.flush()

        create_audit_log(
            db=db,
            user=current_user,
            action="DELETE",
            entity=ENTITY_NAME,
            entity_id=str(state_lgd_code),
            details=str({"deleted_state": deleted_state}),
        )

        db.commit()

    except IntegrityError as error:
        db.rollback()
        logger.info("State delete blocked by FK: lgd_code=%s", state_lgd_code)
        raise StateDeleteError() from error

    except SQLAlchemyError:
        db.rollback()
        logger.exception("State delete failed: lgd_code=%s", state_lgd_code)
        raise

    logger.info(
        "State deleted: lgd_code=%s by user_id=%s",
        state_lgd_code,
        current_user.id,
    )
    return DeleteStateResponse(message="State deleted successfully.")
