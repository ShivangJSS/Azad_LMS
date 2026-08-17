from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import JWTError, jwt

from app.modules.mobile.core.constants import (
    ALGORITHM,
    RESET_TOKEN_EXPIRE_MINUTES,
    SECRET_KEY,
)

TOKEN_TYPE = "reset_password"


def create_reset_token(participant_id: int) -> str:
    """
    Short-lived token that authorises exactly one password reset.
    """

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=RESET_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(participant_id),
        "participant_id": participant_id,
        "token_type": TOKEN_TYPE,
        "iss": "azad-mobile",
        "exp": expire,
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_reset_token(token: str) -> Optional[dict[str, Any]]:
    """
    Returns the payload only for a valid, unexpired reset token. Access and
    refresh tokens are rejected, so neither can be replayed here.
    """

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

    if payload.get("token_type") != TOKEN_TYPE:
        return None

    if payload.get("participant_id") is None:
        return None

    return payload
