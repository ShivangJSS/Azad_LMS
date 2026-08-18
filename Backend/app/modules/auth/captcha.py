import json
import os
import random
import secrets
from typing import TypedDict, cast

import redis
from dotenv import load_dotenv


# ==========================================================
# Environment Configuration
# ==========================================================

load_dotenv()


def get_required_env(name: str) -> str:
    value = os.getenv(name)

    if not value:
        raise RuntimeError(f"{name} is not configured")

    return value


REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_DB = int(os.getenv("REDIS_DB", "0"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", "")


# ==========================================================
# Captcha Configuration
# ==========================================================

CAPTCHA_EXPIRY_SECONDS = 5 * 60
CAPTCHA_PREFIX = "captcha:"


# ==========================================================
# Captcha Types
# ==========================================================


class CaptchaData(TypedDict):
    answer: int


class CaptchaResponse(TypedDict):
    captcha_token: str
    question: str


# ==========================================================
# Redis Client
# ==========================================================

redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    db=REDIS_DB,
    password=REDIS_PASSWORD,
    decode_responses=True,
    socket_connect_timeout=5,
    socket_timeout=5,
)


# ==========================================================
# Generate Captcha
# ==========================================================


def generate_captcha() -> CaptchaResponse:
    """
    Generate a simple math captcha and store its answer in Redis.

    The captcha:
    - expires automatically after 5 minutes
    - is identified by a cryptographically secure token
    """

    num1 = random.randint(1, 9)
    num2 = random.randint(1, 9)

    answer = num1 + num2

    token = secrets.token_urlsafe(32)

    captcha_data: CaptchaData = {
        "answer": answer,
    }

    key = f"{CAPTCHA_PREFIX}{token}"

    redis_client.set(
        key,
        json.dumps(captcha_data),
        ex=CAPTCHA_EXPIRY_SECONDS,
    )

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
    Verify the captcha token and answer.

    Returns False when:
    - token does not exist
    - token has expired
    - stored data is invalid
    - answer is incorrect

    A successfully verified captcha is deleted so that
    it cannot be reused.
    """

    key = f"{CAPTCHA_PREFIX}{token}"

    captcha_json = redis_client.get(key)

    if captcha_json is None:
        return False

    try:
        raw_data = json.loads(captcha_json)
        captcha_data = cast(CaptchaData, raw_data)

    except (json.JSONDecodeError, TypeError):
        redis_client.delete(key)
        return False

    if captcha_data.get("answer") != answer:
        return False

    # Successful captcha -> consume it
    redis_client.delete(key)

    return True