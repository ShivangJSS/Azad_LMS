from sqlalchemy.orm import Session

from app.common.enums import UserRole
from app.modules.auth.model import User
from app.shared.dependencies.location_scope import apply_user_scope

# ==========================================================
# Get User By Email
# ==========================================================


def get_user_by_email(
    db: Session,
    email: str,
) -> User | None:

    return db.query(User).filter(User.email == email).first()


# ==========================================================
# Get User By ID
# ==========================================================


def get_user_by_id(
    db: Session,
    user_id: int,
    current_user: User | None = None,
) -> User | None:
    query = db.query(User).filter(User.id == user_id)
    if current_user is not None and current_user.id != user_id:
        query = apply_user_scope(query, current_user)
    return query.first()


# ==========================================================
# Create User
# ==========================================================


def create_user(
    db: Session,
    user: User,
) -> User:

    db.add(user)
    db.flush()
    db.refresh(user)

    return user


# ==========================================================
# Get All Users
# ==========================================================


def get_all_users(
    db: Session,
    current_user: User,
) -> list[User]:
    """
    Visibility Rules:

    Super Admin -> All users

    Admin ->
        State Head
        District Head
        PI

    State Head ->
        Self only

    District Head ->
        Self only

    PI ->
        Self only
    """

    query = db.query(User)

    # role database me string hai:
    # "1", "2", "3", "4", "5"
    current_role = UserRole(str(current_user.role).strip())

    # ======================================================
    # SUPER ADMIN -> ALL USERS
    # ======================================================

    if current_role == UserRole.SUPER_ADMIN:

        # No filter required.
        # Super Admin sees every user.
        pass

    # ======================================================
    # ADMIN -> STATE HEAD / DISTRICT HEAD / PI
    # ======================================================

    elif current_role == UserRole.ADMIN:

        query = query.filter(
            User.role.in_(
                [
                    UserRole.STATE_HEAD.value,
                    UserRole.DISTRICT_HEAD.value,
                    UserRole.PI.value,
                ]
            )
        )

        # ======================================================
        # OTHER ROLES -> SELF ONLY
        # ======================================================

        query = apply_user_scope(query, current_user)

    else:

        query = query.filter(User.id == current_user.id)

    return query.order_by(User.id.desc()).all()


# ==========================================================
# Update User
# ==========================================================


def update_user(
    db: Session,
    user: User,
) -> User:

    db.flush()
    db.refresh(user)

    return user


# ==========================================================
# Delete User
# ==========================================================


def delete_user(
    db: Session,
    user: User,
) -> None:

    db.delete(user)
    db.flush()
