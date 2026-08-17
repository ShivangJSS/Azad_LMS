from sqlalchemy import BigInteger, Column, DateTime, String
from app.database.database import Base


class LoginLog(Base):
    __tablename__ = "login_logs"

    id = Column(BigInteger, primary_key=True, index=True)

    user_id = Column(BigInteger, nullable=False)

    login_time = Column(DateTime)

    app_version = Column(String(100))

    created_at = Column(DateTime)

    updated_at = Column(DateTime)