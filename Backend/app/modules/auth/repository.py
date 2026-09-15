# from sqlalchemy import func, or_
# from sqlalchemy.orm import Session

# # from Backend.app.database import db
# from app.modules.auth.model import User
# # from Backend.app.modules.mobile.auth.router import login
# # from app.modules.auth.model import User


# class AuthRepository:

#     @staticmethod
#     def get_user_by_email(db: Session, email: str):
#         """
#         Fetch user by email.
#         """
#         return db.query(User).filter(User.email == email).first()
#     @staticmethod
#     def get_user_by_email_or_username(db: Session, email: str):
#         """
#         Fetch user by email or username.
#         """
#         return (
#             db.query(User)
#             .filter(
#                 User.status == "1",
#                 or_(
#                     User.email == email,
#                     User.username == email,
#                 ),
#             )
#             .first()
#         )

#     @staticmethod
#     def get_user_by_id(db: Session, user_id: int):
#         """
#         Fetch user by ID.
#         """
#         return db.query(User).filter(User.id == user_id).first()

#     @staticmethod
#     def update_password(
#         db: Session,
#         user: User,
#         hashed_password: str,
#     ):
#         """
#         Update user's password.
#         """
#         user.password = hashed_password

#         db.commit()

#         db.refresh(user)

#         return user
#     @staticmethod
#     def get_user_by_login(db: Session, login: str):
#         normalized_login = login.strip().lower()

#         return (
#             db.query(User)
#             .filter(
#                 User.status == "1",
#                 or_(
#                     func.lower(User.email) == normalized_login,
#                     func.lower(User.username) == normalized_login,
#                 ),
#             )
#             .order_by(User.id.desc())
#             .first()
#         )


from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from app.modules.auth.model import User


class AuthRepository:

    @staticmethod
    def get_user_by_email(db: Session, email: str):
        return (
            db.query(User)
            .filter(func.lower(User.email) == email.strip().lower())
            .first()
        )

    @staticmethod
    def get_user_by_login(db: Session, login: str):
        normalized_login = login.strip().lower()

        return (
            db.query(User)
            .filter(
                User.status == "1",
                or_(
                    func.lower(User.email) == normalized_login,
                    func.lower(User.username) == normalized_login,
                ),
            )
            .order_by(User.id.desc())
            .first()
        )

    @staticmethod
    def get_user_by_id(db: Session, user_id: int):
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def update_password(
        db: Session,
        user: User,
        hashed_password: str,
    ):
        user.password = hashed_password
        db.commit()
        db.refresh(user)
        return user
