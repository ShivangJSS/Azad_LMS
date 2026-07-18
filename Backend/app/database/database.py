from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "postgresql+psycopg2://postgres:1234@localhost:5432/azadlms_dev_db"

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,   # Checks connection before using it
    echo=False            # Change to True while debugging SQL queries
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()