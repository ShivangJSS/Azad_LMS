import os
import httpx

VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify"

RECAPTCHA_SECRET_KEY = os.getenv("RECAPTCHA_SECRET_KEY")


def verify_recaptcha(token: str) -> bool:
    """
    Verify Google reCAPTCHA token.
    """

    if not RECAPTCHA_SECRET_KEY:
        raise RuntimeError("RECAPTCHA_SECRET_KEY is not configured.")

    response = httpx.post(
        VERIFY_URL,
        data={
            "secret": RECAPTCHA_SECRET_KEY,
            "response": token,
        },
        timeout=10,
    )

    result = response.json()

    return result.get("success", False)