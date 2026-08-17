from typing import Optional

from sqlalchemy.orm import Session

from app.modules.centres.model import BlockMaster, DistrictMaster, StateMaster,CentreMaster

from datetime import datetime

from app.modules.centres.schema import (
    CentreCreateRequest,
    CentreUpdateRequest,
)

class CentreRepository:

    @staticmethod
    def get_active_states(db: Session):
        return (
            db.query(StateMaster)
            .filter(StateMaster.status == "1")
            .order_by(StateMaster.state_name.asc())
            .all()
        )


    @staticmethod
    def get_active_districts(db, state_id: int):
        return (
            db.query(DistrictMaster)
            .filter(
                DistrictMaster.state_lgd_code == state_id,
                DistrictMaster.status == "1"
            )
            .order_by(DistrictMaster.district_name.asc())
            .all()
        )
    
    @staticmethod
    def get_active_blocks(db: Session, district_id: int):
        return (
            db.query(BlockMaster)
            .filter(
                BlockMaster.district_lgd_code == district_id,
                BlockMaster.status == "1",
            )
            .order_by(BlockMaster.block_name.asc())
            .all()
        )


    @staticmethod
    def create_centre(
        db: Session,
        centre: CentreCreateRequest
    ) -> CentreMaster:

        new_centre = CentreMaster(
            centre_name=centre.centre_name,
            address=centre.address,
            location=centre.location,
            latitude=centre.latitude,
            longitude=centre.longitude,
            pin=centre.pin,
            phone_number=centre.phone_number,
            email=centre.email,
            block_id=centre.block_id,
            district_id=centre.district_id,
            state_id=centre.state_id,
            status=centre.status,
        )

        db.add(new_centre)
        db.commit()
        db.refresh(new_centre)

        return new_centre    

    
    @staticmethod
    def get_centres(
        db: Session,
        state_id: Optional[int] = None,
        district_id: Optional[int] = None,
        search: Optional[str] = None,
    ):

        query = (
            db.query(
                CentreMaster.centre_id,
                CentreMaster.centre_name,
                StateMaster.state_name.label("state_name"),
                DistrictMaster.district_name.label("district_name"),
                BlockMaster.block_name.label("block_name"),
                CentreMaster.phone_number,
                CentreMaster.status,
            )
            .join(
                StateMaster,
                CentreMaster.state_id == StateMaster.state_lgd_code,
            )
            .join(
                DistrictMaster,
                CentreMaster.district_id == DistrictMaster.district_lgd_code,
            )
            .join(
                BlockMaster,
                CentreMaster.block_id == BlockMaster.block_lgd_code,
            )
            .filter(CentreMaster.deleted_at.is_(None))
        )

        if state_id:
            query = query.filter(CentreMaster.state_id == state_id)

        if district_id:
            query = query.filter(CentreMaster.district_id == district_id)

        if search:
            query = query.filter(
                CentreMaster.centre_name.ilike(f"%{search}%")
            )

        return query.order_by(CentreMaster.centre_id.desc()).all()


    @staticmethod
    def get_centre_by_id(
    db: Session,
    centre_id: int,
    ):
     return (
        db.query(CentreMaster)
        .filter(
            CentreMaster.centre_id == centre_id,
            CentreMaster.deleted_at.is_(None),
        )
        .first()
    )



    @staticmethod
    def update_centre(
        db: Session,
        centre: CentreMaster,
        data: CentreUpdateRequest,
):

        centre.centre_name = data.centre_name
        centre.address = data.address
        centre.location = data.location

        centre.latitude = data.latitude
        centre.longitude = data.longitude

        centre.pin = data.pin
        centre.phone_number = data.phone_number
        centre.email = data.email

        centre.state_id = data.state_id
        centre.district_id = data.district_id
        centre.block_id = data.block_id

        centre.status = data.status

    # Update timestamp
        centre.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(centre)

        return centre



    @staticmethod
    def update_centre_status(
        db: Session,
        centre: CentreMaster,
        status: int,
    ):

        centre.status = status
        centre.updated_at = datetime.utcnow()

        db.commit()
        db.refresh(centre)

        return centre    



    @staticmethod
    def get_centre_view_by_id(
        db: Session,
        centre_id: int,
    ):
        return (
        db.query(
            CentreMaster.centre_id,
            CentreMaster.centre_name,
            CentreMaster.address,
            CentreMaster.location,
            CentreMaster.latitude,
            CentreMaster.longitude,
            CentreMaster.pin,
            CentreMaster.phone_number,
            CentreMaster.email,

            CentreMaster.state_id,
            StateMaster.state_name.label("state_name"),

            CentreMaster.district_id,
            DistrictMaster.district_name.label("district_name"),

            CentreMaster.block_id,
            BlockMaster.block_name.label("block_name"),

            CentreMaster.status,
            CentreMaster.created_at,
            CentreMaster.updated_at,
        )
        .join(
            StateMaster,
            CentreMaster.state_id == StateMaster.state_lgd_code,
        )
        .join(
            DistrictMaster,
            CentreMaster.district_id == DistrictMaster.district_lgd_code,
        )
        .join(
            BlockMaster,
            CentreMaster.block_id == BlockMaster.block_lgd_code,
        )
        .filter(
            CentreMaster.centre_id == centre_id,
            CentreMaster.deleted_at.is_(None),
        )
        .first()
    )



    @staticmethod
    def delete_centre(
      db: Session,
      centre: CentreMaster,
    ):

      centre.deleted_at = datetime.utcnow()

      db.commit()

      return centre