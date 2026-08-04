"""Persistence layer for the Centre module.

Repository methods build and execute queries but never commit. The calling
service owns the transaction so that audit logs and business changes commit
together, matching the pattern used in the State module.
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.modules.centres.schema import (
    CentreCreateRequest,
    CentreUpdateRequest,
)
from app.modules.master.district.model import DistrictMaster
from app.modules.master.state.model import StateMaster
from .model import BlockMaster, CentreMaster

ACTIVE = "1"


def _utc_now() -> datetime:
    """Timezone-aware UTC timestamp.

    datetime.utcnow() is deprecated from Python 3.12 and returns a naive
    value, which silently loses the offset when stored.
    """
    return datetime.now(timezone.utc)


class CentreRepository:

    # ------------------------------------------------------------------
    #  Dropdown sources
    # ------------------------------------------------------------------

    @staticmethod
    def get_active_states(
        db: Session,
        state_id: int | None = None,
    ) -> list[StateMaster]:
        query = db.query(StateMaster).filter(StateMaster.status == ACTIVE)

        if state_id is not None:
            query = query.filter(StateMaster.state_lgd_code == state_id)

        return query.order_by(StateMaster.state_name.asc()).all()

    @staticmethod
    def get_active_districts(db: Session, state_id: int) -> list[DistrictMaster]:
        return (
            db.query(DistrictMaster)
            .filter(
                DistrictMaster.state_lgd_code == state_id,
                DistrictMaster.status == ACTIVE,
            )
            .order_by(DistrictMaster.district_name.asc())
            .all()
        )

    @staticmethod
    def get_active_reference_centres(
        db: Session,
        state_id: int | None = None,
        district_id: int | None = None,
        centre_id: int | None = None,
        search: str | None = None,
        limit: int = 100,
    ) -> list[CentreMaster]:
        """Return the deliberately small, active Centre lookup data source."""
        query = db.query(CentreMaster).filter(
            CentreMaster.status == 1,
            CentreMaster.deleted_at.is_(None),
        )

        if state_id is not None:
            query = query.filter(CentreMaster.state_id == state_id)
        if district_id is not None:
            query = query.filter(CentreMaster.district_id == district_id)
        if centre_id is not None:
            query = query.filter(CentreMaster.centre_id == centre_id)
        if search:
            query = query.filter(CentreMaster.centre_name.ilike(f"%{search.strip()}%"))

        return query.order_by(CentreMaster.centre_name.asc()).limit(limit).all()

    @staticmethod
    def get_active_blocks(db: Session, district_id: int) -> list[BlockMaster]:
        return (
            db.query(BlockMaster)
            .filter(
                BlockMaster.district_lgd_code == district_id,
                BlockMaster.status == ACTIVE,
            )
            .order_by(BlockMaster.block_name.asc())
            .all()
        )

    # ------------------------------------------------------------------
    #  Writes — none of these commit; the service does.
    # ------------------------------------------------------------------

    @staticmethod
    def create_centre(
        db: Session,
        data: CentreCreateRequest,
    ) -> CentreMaster:
        centre = CentreMaster(
            centre_name=data.centre_name,
            address=data.address,
            location=data.location,
            latitude=data.latitude,
            longitude=data.longitude,
            pin=data.pin,
            phone_number=data.phone_number,
            email=data.email,
            block_id=data.block_id,
            district_id=data.district_id,
            state_id=data.state_id,
            status=data.status,
            created_at=_utc_now(),
            updated_at=_utc_now(),
        )

        db.add(centre)
        db.flush()

        return centre

    @staticmethod
    def update_centre(
        db: Session,
        centre: CentreMaster,
        data: CentreUpdateRequest,
    ) -> CentreMaster: # type: ignore
        centre.centre_name = data.centre_name # type: ignore
        centre.address = data.address # type: ignore
        centre.location = data.location # type: ignore
        centre.latitude = data.latitude
        centre.longitude = data.longitude
        centre.pin = data.pin
        centre.phone_number = data.phone_number
        centre.email = data.email
        centre.state_id = data.state_id
        centre.district_id = data.district_id
        centre.block_id = data.block_id
        centre.status = data.status
        centre.updated_at = _utc_now()

        db.flush()

        return centre

    @staticmethod
    def update_centre_status(
        db: Session,
        centre: CentreMaster,
        status: int,
    ) -> CentreMaster:
        centre.status = status
        centre.updated_at = _utc_now()

        db.flush()

        return centre

    @staticmethod
    def delete_centre(
        db: Session,
        centre: CentreMaster,
    ) -> CentreMaster:
        """Soft delete: the row is retained and filtered out of reads."""
        centre.deleted_at = _utc_now()
        centre.updated_at = _utc_now()

        db.flush()

        return centre

    # ------------------------------------------------------------------
    #  Reads
    # ------------------------------------------------------------------

    @staticmethod
    def _centre_list_query() -> Select[tuple]:
        """Base list query.

        Outer joins are required: block_id, district_id and state_id are all
        nullable, and an inner join would silently drop those centres from
        every listing.
        """
        return (
            select(
                CentreMaster.centre_id,
                CentreMaster.centre_name,
                StateMaster.state_name.label("state_name"),
                DistrictMaster.district_name.label("district_name"),
                BlockMaster.block_name.label("block_name"),
                CentreMaster.phone_number,
                CentreMaster.status,
            )
            .select_from(CentreMaster)
            .outerjoin(
                StateMaster,
                CentreMaster.state_id == StateMaster.state_lgd_code,
            )
            .outerjoin(
                DistrictMaster,
                CentreMaster.district_id == DistrictMaster.district_lgd_code,
            )
            .outerjoin(
                BlockMaster,
                CentreMaster.block_id == BlockMaster.block_lgd_code,
            )
            .where(CentreMaster.deleted_at.is_(None))
        )

    @staticmethod
    def get_centres(
        db: Session,
        state_id: int | None = None,
        district_id: int | None = None,
        block_id: int | None = None,
        search: str | None = None,
        page: int = 1,
        per_page: int = 25, # type: ignore
    ) -> tuple[list, int]:
        """Return a page of centres and the total row count."""
        query = CentreRepository._centre_list_query()

        if state_id is not None:
            query = query.where(CentreMaster.state_id == state_id)

        if district_id is not None:
            query = query.where(CentreMaster.district_id == district_id)

        if block_id is not None:
            query = query.where(CentreMaster.block_id == block_id)

        if search:
            term = f"%{search.strip()}%"
            query = query.where(
                CentreMaster.centre_name.ilike(term)
                | CentreMaster.location.ilike(term)
                | CentreMaster.phone_number.ilike(term)
            )

        count_query = select(func.count()).select_from(query.subquery())
        total = db.execute(count_query).scalar_one()

        rows = (
            db.execute(
                query.order_by(CentreMaster.centre_id.desc()) # type: ignore
                .limit(per_page)
                .offset((page - 1) * per_page)
            )
            .mappings()
            .all()
        )

        return list(rows), total

    @staticmethod
    def get_centre_by_id(
        db: Session,
        centre_id: int,
    ) -> CentreMaster | None:
        return (
            db.query(CentreMaster)
            .filter(
                CentreMaster.centre_id == centre_id,
                CentreMaster.deleted_at.is_(None),
            )
            .first()
        )

    @staticmethod
    def get_centre_view_by_id(
        db: Session,
        centre_id: int,
    ):
        """Detail row with resolved location names.

        Outer joins again: a centre with no block assigned must still be
        viewable, with block_name coming back as None.
        """
        query = (
            select(
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
            .select_from(CentreMaster)
            .outerjoin(
                StateMaster,
                CentreMaster.state_id == StateMaster.state_lgd_code,
            )
            .outerjoin(
                DistrictMaster,
                CentreMaster.district_id == DistrictMaster.district_lgd_code,
            )
            .outerjoin(
                BlockMaster,
                CentreMaster.block_id == BlockMaster.block_lgd_code,
            )
            .where(
                CentreMaster.centre_id == centre_id,
                CentreMaster.deleted_at.is_(None),
            )
        )

        return db.execute(query).mappings().first()
