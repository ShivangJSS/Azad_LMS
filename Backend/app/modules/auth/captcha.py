import secrets
import threading
import time
from typing import TypedDict

# ==========================================================
# Captcha Configuration
# ==========================================================

CAPTCHA_EXPIRY_SECONDS = 1 * 60


# ==========================================================
# Captcha Types
# ==========================================================


class CaptchaData(TypedDict):
    answer: int
    expires_at: float


class CaptchaResponse(TypedDict):
    captcha_token: str
    question: str


# ==========================================================
# In-Memory Store
# ==========================================================

_store: dict[str, CaptchaData] = {}
_store_lock = threading.Lock()


# ==========================================================
# Remove Expired Captcha
# ==========================================================


def _evict(token: str) -> None:
    """Remove an expired captcha token from memory."""

    with _store_lock:
        _store.pop(token, None)


# ==========================================================
# Generate Captcha
# ==========================================================


def generate_captcha() -> CaptchaResponse:
    """
    Generate a simple math captcha and store its answer
    in application memory.

    Captcha:
    - expires after 5 minutes
    - uses a secure random token
    - can only be verified once
    """

    num1 = secrets.randbelow(9) + 1
    num2 = secrets.randbelow(9) + 1

    answer = num1 + num2

    token = secrets.token_urlsafe(32)

    captcha_data: CaptchaData = {
        "answer": answer,
        "expires_at": time.monotonic() + CAPTCHA_EXPIRY_SECONDS,
    }

    with _store_lock:
        _store[token] = captcha_data

    # Automatically remove captcha after expiry
    timer = threading.Timer(
        CAPTCHA_EXPIRY_SECONDS,
        _evict,
        args=(token,),
    )

    timer.daemon = True
    timer.start()

    return {
        "captcha_token": token,
        "question": f"{num1} + {num2} = ?",
    }


# ==========================================================
# Verify Captcha
# ==========================================================


def verify_captcha(
    token: str,
    answer: int,
) -> bool:
    """
    Verify captcha token and answer.

    Returns False when:
    - token does not exist
    - token has expired
    - answer is incorrect

    Successfully verified captcha is deleted
    so it cannot be reused.
    """

    with _store_lock:
        captcha_data = _store.get(token)

        if captcha_data is None:
            return False

        # Check expiry even if timer hasn't executed yet
        if time.monotonic() > captcha_data["expires_at"]:
            _store.pop(token, None)
            return False

        # Wrong answer
        if captcha_data["answer"] != answer:
            return False

        # Correct answer -> consume captcha
        _store.pop(token, None)

    return True
