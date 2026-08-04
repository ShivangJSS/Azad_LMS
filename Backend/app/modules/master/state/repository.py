from sqlalchemy import func

from sqlalchemy.orm import Session

from app.modules.auth.constants import UserRole
from app.modules.auth.model import User

from .model import StateMaster


def get_state_by_code(
    db: Session,
    state_lgd_code: str,
):
    return (
        db.query(StateMaster)
        .filter(StateMaster.state_lgd_code == state_lgd_code)
        .first()
    )


def get_state_by_name(
    db: Session,
    state_name: str,
):
    return (
        db.query(StateMaster)
        .filter(func.lower(StateMaster.state_name) == state_name.lower())
        .first()
    )


def get_states(
    db: Session,
    state_name: str | None,
    status: str | None,
    page: int,
    per_page: int,
    current_user: User,
):
    query = db.query(StateMaster)

    # Filter based on user role
    user_role = str(current_user.role)
    if user_role not in {UserRole.SUPER_ADMIN.value, UserRole.ADMIN.value}:
        if current_user.state_lgd_code:
            query = query.filter(
                StateMaster.state_lgd_code == str(current_user.state_lgd_code)
            )
        else:
            # If a non-admin user has no state, they can't see any.
            return [], 0

    if state_name:
        query = query.filter(StateMaster.state_name.ilike(f"%{state_name.strip()}%"))

    if status is not None:
        query = query.filter(StateMaster.status == status)

    total = query.count()

    states = (
        query.order_by(StateMaster.state_name.asc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return states, total


def create_state(
    db: Session,
    state: StateMaster,
):
    db.add(state)
    db.flush()

    return state


def update_state(
    db: Session,
    state: StateMaster,
):
    db.flush()

    return state


def delete_state(
    db: Session,
    state: StateMaster,
):
    db.delete(state)
    db.flush()
