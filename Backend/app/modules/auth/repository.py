from sqlalchemy.orm import Session

from app.modules.auth.model import User


class AuthRepository:

    @staticmethod
    def get_user_by_email(db: Session, email: str):
        """
        Fetch user by email.
        """
        return (
            db.query(User)
            .filter(User.email == email)
            .first()
        )

    @staticmethod
    def get_user_by_id(db: Session, user_id: int):
        """
        Fetch user by ID.
        """
        return (
            db.query(User)
            .filter(User.id == user_id)
            .first()
        )

    @staticmethod
    def update_password(
        db: Session,
        user: User,
        hashed_password: str,
    ):
        """
        Update user's password.
        """
        user.password = hashed_password

        db.commit()

        db.refresh(user)

        return user