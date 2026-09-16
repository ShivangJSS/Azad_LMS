from typing import Optional

from sqlalchemy.orm import Session

from app.modules.users.model import ParticipantMaster


class MobileAuthRepository:
    """
    Repository responsible only for database operations.
    """

    @staticmethod
    def get_active_participant_by_username(
        db: Session,
        username: str,
    ) -> Optional[ParticipantMaster]:
        """
        Fetch active participant by username.
        """

        return (
            db.query(ParticipantMaster)
            .filter(
                ParticipantMaster.username == username,
                ParticipantMaster.deleted_at.is_(None),
                ParticipantMaster.status == "1",
            )
            .first()
        )

    @staticmethod
    def get_by_participant_id(
        db: Session,
        participant_id: int,
    ) -> Optional[ParticipantMaster]:
        """
        Fetch participant by primary key.
        """

        return (
            db.query(ParticipantMaster)
            .filter(
                ParticipantMaster.participant_id == participant_id,
                ParticipantMaster.deleted_at.is_(None),
            )
            .first()
        )

    @staticmethod
    def update_password(
        db: Session,
        participant: ParticipantMaster,
        hashed_password: str,
    ) -> ParticipantMaster:
        """
        Update participant password.
        """

        participant.password = hashed_password

        db.commit()
        db.refresh(participant)

        return participant

    @staticmethod
    def update_photo(
        db: Session,
        participant: ParticipantMaster,
        images: str,
    ) -> ParticipantMaster:
        """
        Store the participant's profile photo path.
        """

        participant.images = images

        db.commit()
        db.refresh(participant)

        return participant

    @staticmethod
    def update_last_login(
        db: Session,
        participant: ParticipantMaster,
    ) -> None:
        """
        Placeholder for future last login update.
        """

        # Example:
        # participant.last_login = datetime.utcnow()
        db.commit()