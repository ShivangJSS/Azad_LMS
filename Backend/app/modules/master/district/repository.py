from sqlalchemy.orm import Session, joinedload

from .model import DistrictMaster
from app.modules.master.state.model import StateMaster


def get_district_by_code(
    db: Session,
    district_lgd_code: int,
) -> DistrictMaster | None:

    return (
        db.query(DistrictMaster)
        .options(joinedload(DistrictMaster.state))
        .filter(DistrictMaster.district_lgd_code == district_lgd_code)
        .first()
    )


def get_state_by_code(
    db: Session,
    state_lgd_code: int,
) -> StateMaster | None:

    return (
        db.query(StateMaster)
        .filter(StateMaster.state_lgd_code == state_lgd_code)
        .first()
    )


def get_districts(
    db: Session,
    state_lgd_code: int | None = None,
    district_lgd_code: int | None = None,
    district_name: str | None = None,
    district_status: str | None = None,
    page: int = 1,
    per_page: int = 10,
):
    query = db.query(DistrictMaster).options(joinedload(DistrictMaster.state))

    if state_lgd_code is not None:
        query = query.filter(DistrictMaster.state_lgd_code == state_lgd_code)

    if district_lgd_code is not None:
        query = query.filter(DistrictMaster.district_lgd_code == district_lgd_code)

    if district_name:
        query = query.filter(
            DistrictMaster.district_name.ilike(f"%{district_name.strip()}%")
        )

    if district_status:
        query = query.filter(DistrictMaster.status == district_status)

    total = query.count()

    districts = (
        query.order_by(DistrictMaster.district_name.asc())
        .limit(per_page)
        .offset((page - 1) * per_page)
        .all()
    )

    return districts, total


def create_district(
    db: Session,
    district: DistrictMaster,
) -> DistrictMaster:

    db.add(district)
    db.flush()

    return district


def update_district(
    db: Session,
    district: DistrictMaster,
) -> DistrictMaster:

    db.flush()

    return district


def delete_district(
    db: Session,
    district: DistrictMaster,
) -> None:

    db.delete(district)
    db.flush()
