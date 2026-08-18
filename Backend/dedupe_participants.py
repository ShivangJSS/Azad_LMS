"""
One-off cleanup: remove duplicate `batch_participant` rows that make a trainee
appear more than once in the Trainees list.

The root cause (a second batch mapping being inserted on create) is already
fixed, so this only needs to be run ONCE to clean existing data.

Run from the Backend folder with your project venv, e.g.:
    .venv\\Scripts\\python dedupe_participants.py      (Windows)
    python dedupe_participants.py
"""

from sqlalchemy import text

from app.database.database import SessionLocal


def main():
    db = SessionLocal()
    try:
        # For each (participant_id, batch_id) keep the lowest batch_participant_id
        # among non-deleted rows and delete the rest.
        result = db.execute(
            text(
                """
                DELETE FROM batch_participant a
                USING batch_participant b
                WHERE a.participant_id = b.participant_id
                  AND a.batch_id = b.batch_id
                  AND a.deleted_at IS NULL
                  AND b.deleted_at IS NULL
                  AND a.batch_participant_id > b.batch_participant_id
                """
            )
        )
        db.commit()
        print(f"Removed {result.rowcount} duplicate batch_participant row(s).")
    except Exception as exc:  # noqa: BLE001
        db.rollback()
        print("Cleanup failed:", exc)
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
