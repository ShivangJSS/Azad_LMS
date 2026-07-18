from app.database.database import SessionLocal
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.jwt_handler import create_access_token
from fastapi.security import HTTPAuthorizationCredentials

db = SessionLocal()

try:
    token = create_access_token(
        {
            "sub": "1"
        }
    )

    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials=token,
    )

    user = get_current_user(
        credentials=credentials,
        db=db,
    )

    print("✅ User Found")
    print(user.id)
    print(user.name)
    print(user.email)

finally:
    db.close()
    from app.database.database import SessionLocal
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.jwt_handler import create_access_token
from fastapi.security import HTTPAuthorizationCredentials

db = SessionLocal()

try:
    token = create_access_token(
        {
            "sub": "1"
        }
    )

    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials=token,
    )

    user = get_current_user(
        credentials=credentials,
        db=db,
    )

    print("✅ User Found")
    print(user.id)
    print(user.name)
    print(user.email)

finally:
    db.close()