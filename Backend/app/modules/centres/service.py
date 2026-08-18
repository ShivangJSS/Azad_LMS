from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.modules.centres.repository import CentreRepository
from app.modules.master.district.model import DistrictMaster

from .model import CentreMaster
from .schema import CentreCreateRequest, CentreUpdateRequest


def _not_found() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="Centre not found",
    )


def _assert_centre_name_available(
    db: Session,
    centre_name: str,
    district_id: int,
    exclude_id: Optional[int] = None,
) -> None:
    """Reject a duplicate centre name within the same district (exact match)."""
    query = db.query(CentreMaster).filter(
        CentreMaster.centre_name == centre_name,
        CentreMaster.district_id == district_id,
        CentreMaster.deleted_at.is_(None),
    )
    if exclude_id is not None:
        query = query.filter(CentreMaster.centre_id != exclude_id)

    if query.first() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A centre with this name already exists in this district.",
        )


class CentreService:

    # ------------------------------------------------------------------
    #  Dropdowns
    # ------------------------------------------------------------------

    @staticmethod
    def get_states(db: Session):
        return CentreRepository.get_active_states(db)

    @staticmethod
    def get_districts(db: Session, state_id: int) -> list[DistrictMaster]:
        return CentreRepository.get_active_districts(db, state_id)

    @staticmethod
    def get_blocks(db: Session, district_id: int):
        return CentreRepository.get_active_blocks(db, district_id)

    # ------------------------------------------------------------------
    #  Reads
    # ------------------------------------------------------------------

    @staticmethod
    def get_centres(
        db: Session,
        state_id: Optional[int] = None,
        district_id: Optional[int] = None,
        search: Optional[str] = None,
        page: int = 1,
        per_page: int = 25,
    ) -> dict[str, list | int]:
        centres, total = CentreRepository.get_centres(
            db=db,
            state_id=state_id,
            district_id=district_id,
            search=search,
            page=page,
            per_page=per_page,
        )

        return {
            "data": centres,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": (total + per_page - 1) // per_page if total else 0,
        }

    @staticmethod
    def get_centre_by_id(db: Session, centre_id: int):
        centre = CentreRepository.get_centre_view_by_id(
            db=db,
            centre_id=centre_id,
        )

        if not centre:
            raise _not_found()

        return centre

    # ------------------------------------------------------------------
    #  Writes — the service owns the transaction.
    # ------------------------------------------------------------------

    @staticmethod
    def create_centre(
        db: Session,
        centre: CentreCreateRequest,
    ) -> CentreMaster:
        _assert_centre_name_available(
            db, centre.centre_name, centre.district_id
        )
        try:
            created = CentreRepository.create_centre(db=db, data=centre)

            db.commit()
            db.refresh(created)

        except SQLAlchemyError:
            db.rollback()
            raise

        return created

    @staticmethod
    def update_centre(
        db: Session,
        centre_id: int,
        data: CentreUpdateRequest,
    ) -> CentreMaster:
        centre = CentreRepository.get_centre_by_id(db=db, centre_id=centre_id)

        if not centre:
            raise _not_found()

        _assert_centre_name_available(
            db, data.centre_name, data.district_id, exclude_id=centre_id
        )

        try:
            updated = CentreRepository.update_centre(
                db=db,
                centre=centre,
                data=data,
            )

            db.commit()
            db.refresh(updated)

        except SQLAlchemyError:
            db.rollback()
            raise

        return updated

    @staticmethod
    def update_centre_status(
        db: Session,
        centre_id: int,
        new_status: int,
    ) -> CentreMaster:
        centre = CentreRepository.get_centre_by_id(db=db, centre_id=centre_id)

        if not centre:
            raise _not_found()

        try:
            updated = CentreRepository.update_centre_status(
                db=db,
                centre=centre,
                status=new_status,
            )

            db.commit()
            db.refresh(updated)

        except SQLAlchemyError:
            db.rollback()
            raise

        return updated

    @staticmethod
    def delete_centre(db: Session, centre_id: int) -> dict[str, str]:
        centre = CentreRepository.get_centre_by_id(db=db, centre_id=centre_id)

        if not centre:
            raise _not_found()

        try:
            CentreRepository.delete_centre(db=db, centre=centre)
            db.commit()

        except SQLAlchemyError:
            db.rollback()
            raise

        return {"message": "Centre deleted successfully"}