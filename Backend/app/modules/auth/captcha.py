import random
import secrets
from datetime import datetime, timedelta

# In-memory captcha storage
# Structure:
# {
#     "token": {
#         "answer": 12,
#         "expires_at": datetime(...)
#     }
# }
captcha_store = {}

# Captcha validity
CAPTCHA_EXPIRY_MINUTES = 5


def generate_captcha():
    """
    Generate a simple math captcha.
    Returns:
    {
        "captcha_token": "...",
        "question": "5 + 7 = ?"
    }
    """

    num1 = random.randint(1, 9)
    num2 = random.randint(1, 9)

    answer = num1 + num2

    token = secrets.token_urlsafe(32)

    captcha_store[token] = {
        "answer": answer,
        "expires_at": datetime.utcnow() + timedelta(minutes=CAPTCHA_EXPIRY_MINUTES)
    }

    return {
        "captcha_token": token,
        "question": f"{num1} + {num2} = ?"
    }


def verify_captcha(token: str, answer: int) -> bool:
    """
    Validate captcha.

    Returns:
        True  -> Valid
        False -> Invalid / Expired
    """

    captcha = captcha_store.get(token)

    if captcha is None:
        return False

    # Expired
    if datetime.utcnow() > captcha["expires_at"]:
        del captcha_store[token]
        return False

    # One-time use
    if captcha["answer"] == answer:
        del captcha_store[token]
        return True

    return False