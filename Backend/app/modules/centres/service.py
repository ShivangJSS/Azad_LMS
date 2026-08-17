from typing import Optional

from sqlalchemy.orm import Session
from app.modules.centres.schema import CentreCreateRequest, CentreUpdateRequest
from app.modules.centres.model import CentreMaster
from app.modules.centres.repository import CentreRepository
from fastapi import HTTPException, status

class CentreService:

    @staticmethod
    def get_states(db: Session):
        return CentreRepository.get_active_states(db)


    @staticmethod
    def get_districts(db, state_id: int):
        return CentreRepository.get_active_districts(db, state_id)
    
    @staticmethod
    def get_blocks(db: Session, district_id: int):
        return CentreRepository.get_active_blocks(db, district_id)

    @staticmethod
    def create_centre(
        db: Session,
        centre: CentreCreateRequest
    ) -> CentreMaster:

        created_centre = CentreRepository.create_centre(
            db=db,
            centre=centre
        )

        return created_centre


    @staticmethod
    def get_centres(
        db: Session,
        state_id: Optional[int] = None,
        district_id: Optional[int] = None,
        search: Optional[str] = None,
    ):
        return CentreRepository.get_centres(
            db=db,
            state_id=state_id,
            district_id=district_id,
            search=search,
        )



    @staticmethod
    def get_centre_by_id(
        db: Session,
        centre_id: int,
    ):

        centre = CentreRepository.get_centre_view_by_id(
            db=db,
            centre_id=centre_id,
        )

        if not centre:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Centre not found",
        )

        return centre

    @staticmethod
    def update_centre(
        db: Session,
        centre_id: int,
        data: CentreUpdateRequest,
    ):

        centre = CentreRepository.get_centre_by_id(
            db=db,
            centre_id=centre_id,
    )

        if not centre:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Centre not found",
            )

        return CentreRepository.update_centre(
            db=db,
            centre=centre,
            data=data,
        )


    @staticmethod
    def update_centre_status(
        db: Session,
        centre_id: int,
         new_status: int,
    ):

        centre = CentreRepository.get_centre_by_id(
            db=db,
            centre_id=centre_id,
        )

        if not centre:
            raise HTTPException(
               status_code=status.HTTP_404_NOT_FOUND,
               detail="Centre not found",
            )

        return CentreRepository.update_centre_status(
            db=db,
            centre=centre,
            status= new_status,
        )


    @staticmethod
    def delete_centre(
        db: Session,
        centre_id: int,
    ):

        centre = CentreRepository.get_centre_by_id(
            db=db,
            centre_id=centre_id,
        )

        if not centre:
            raise HTTPException(
              status_code=status.HTTP_404_NOT_FOUND,
              detail="Centre not found",
            )

        CentreRepository.delete_centre(
            db=db,
            centre=centre,
        )

        return {
            "message": "Centre deleted successfully"
        }