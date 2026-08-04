from datetime import datetime
from typing import Optional

from sqlalchemy import func
from sqlalchemy.orm import Session
from app.modules.users.model import ParticipantMaster
from app.modules.auth.model import User
from app.modules.batch.model import BatchMaster, BatchParticipant
from app.modules.centres.model import (
    CentreMaster,
)
from app.modules.master.district.model import DistrictMaster
from app.modules.master.state.model import StateMaster


class BatchRepository:

    @staticmethod
    def create_batch(
        db: Session,
        batch,
        created_by: int,
    ) -> Optional[BatchMaster]:

        # Validate Centre
        centre = (
            db.query(CentreMaster)
            .filter(
                CentreMaster.centre_id == batch.centre_id,
                CentreMaster.deleted_at.is_(None),
            )
            .first()
        )

        if not centre:
            return None

        # Duplicate Batch Name
        existing = (
            db.query(BatchMaster)
            .filter(
                BatchMaster.batch_name == batch.batch_name,
                BatchMaster.deleted_at.is_(None),
            )
            .first()
        )

        if existing:
            return "duplicate"

        new_batch = BatchMaster(
            batch_name=batch.batch_name,
            centre_id=batch.centre_id,
            fy_year=batch.fy_year,
            status=batch.status,
            created_by=created_by,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        db.add(new_batch)
        db.commit()
        db.refresh(new_batch)

        return new_batch

    @staticmethod
    def get_batches(
     db: Session,
     state_id: Optional[int] = None,
     district_id: Optional[int] = None,
     status: Optional[int] = None,
     search: Optional[str] = None,
):

     query = (
       db.query(
            BatchMaster.batch_id,
            BatchMaster.batch_name,
            CentreMaster.centre_name.label("centre_name"),
            BatchMaster.fy_year,
            User.name.label("created_by"),
            BatchMaster.status,
            func.count(BatchParticipant.batch_participant_id).label(
                "participant_count"
            ),
        )
        .join(
            CentreMaster,
            (BatchMaster.centre_id == CentreMaster.centre_id)
            & CentreMaster.deleted_at.is_(None),
        )
        .join(
            DistrictMaster,
            CentreMaster.district_id
            == DistrictMaster.district_lgd_code,
        )
        .join(
            StateMaster,
            CentreMaster.state_id
            == StateMaster.state_lgd_code,
        )
        .outerjoin(
            User,
            BatchMaster.created_by == User.id,
        )
        .outerjoin(
            BatchParticipant,
            (BatchMaster.batch_id == BatchParticipant.batch_id)
            & BatchParticipant.deleted_at.is_(None),
        )
        .filter(
            BatchMaster.deleted_at.is_(None),
        )
    )

     if state_id is not None:
        query = query.filter(
            CentreMaster.state_id == state_id,
        )

     if district_id is not None:
        query = query.filter(
            CentreMaster.district_id == district_id,
        )

     if status is not None:
        query = query.filter(
            BatchMaster.status == status,
        )

     if search:
        query = query.filter(
            BatchMaster.batch_name.ilike(f"%{search}%"),
        )

     return (
        query.group_by(
            BatchMaster.batch_id,
            BatchMaster.batch_name,
            CentreMaster.centre_name,
            BatchMaster.fy_year,
            User.name,
            BatchMaster.status,
        )
        .order_by(
            BatchMaster.batch_id.desc()
        )
        .all()
    )
    
    @staticmethod
    def get_batch_by_id(
        db: Session,
        batch_id: int,
    ) -> Optional[BatchMaster]:

        return (
            db.query(BatchMaster)
            .filter(
                BatchMaster.batch_id == batch_id,
                BatchMaster.deleted_at.is_(None),
            )
            .first()
        )

    @staticmethod
    def get_batch_view_by_id(
     db: Session,
     batch_id: int,
):

     return (
        db.query(
            BatchMaster.batch_id,
            BatchMaster.batch_name,

            CentreMaster.state_id,
            CentreMaster.district_id,
            CentreMaster.block_id,

            BatchMaster.centre_id,
            CentreMaster.centre_name.label("centre_name"),

            BatchMaster.fy_year,

            BatchMaster.created_by,
            User.name.label("created_by_name"),

            BatchMaster.status,

            BatchMaster.created_at,
            BatchMaster.updated_at,
        )
        .join(
            CentreMaster,
            (BatchMaster.centre_id == CentreMaster.centre_id)
            & CentreMaster.deleted_at.is_(None),
        )
        .outerjoin(
            User,
            BatchMaster.created_by == User.id,
        )
        .filter(
            BatchMaster.batch_id == batch_id,
            BatchMaster.deleted_at.is_(None),
        )
        .first()
    )
    @staticmethod
    def update_batch(
        db: Session,
        batch: BatchMaster,
        data,
    ):

        centre = (
            db.query(CentreMaster)
            .filter(
                CentreMaster.centre_id == data.centre_id,
                CentreMaster.deleted_at.is_(None),
            )
            .first()
        )

        if not centre:
            return None

        existing = (
            db.query(BatchMaster)
            .filter(
                BatchMaster.batch_name == data.batch_name,
                BatchMaster.batch_id != batch.batch_id,
                BatchMaster.deleted_at.is_(None),
            )
            .first()
        )

        if existing:
            return "duplicate"

        batch.batch_name = data.batch_name
        batch.centre_id = data.centre_id
        batch.fy_year = data.fy_year
        batch.status = data.status
        batch.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(batch)

        return batch

    @staticmethod
    def update_batch_status(
        db: Session,
        batch: BatchMaster,
        status: int,
    ):

        batch.status = status
        batch.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(batch)

        return batch

    @staticmethod
    def delete_batch(
        db: Session,
        batch: BatchMaster,
    ):

        batch.deleted_at = datetime.utcnow()
        batch.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(batch)

        return batch


    @staticmethod
    def get_batch_participants(
     db: Session,
     batch_id: int,
):

     return (
        db.query(
            ParticipantMaster.participant_id,
            ParticipantMaster.participant_name,
            ParticipantMaster.email,
            ParticipantMaster.mobile_no,
            ParticipantMaster.enrollment_no,
        )
        .join(
            BatchParticipant,
            BatchParticipant.participant_id
            == ParticipantMaster.participant_id,
        )
        .filter(
            BatchParticipant.batch_id == batch_id,
            BatchParticipant.deleted_at.is_(None),
            ParticipantMaster.deleted_at.is_(None),
        )
        .order_by(
            ParticipantMaster.participant_name
        )
        .all()
    )