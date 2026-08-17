from typing import Optional

from fastapi import Depends, Query
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.modules.assessment.schema.match_making_schema import (
    MatchLeftItemCreate,
    MatchLeftItemResponse,
    MatchLeftItemUpdate,
    MatchLeftItemResponse,
    MatchMakingCreate,
    MatchMakingResponse,
    MatchMakingUpdate,
    MatchRightItemCreate,
    MatchRightItemUpdate,
)

from app.modules.assessment.service.match_making_service import (
    MatchMakingService,
)


class MatchMakingController:

    @staticmethod
    def get_all(
        language_id: Optional[int] = Query(None),
        search: Optional[str] = Query(None),
        db: Session = Depends(get_db),
    ):
        return MatchMakingService.get_all(
            db=db,
            language_id=language_id,
            search=search,
        )

    @staticmethod
    def get_by_id(
        parent_id: int,
        language_id: int = Query(...),
        db: Session = Depends(get_db),
    ) -> MatchMakingResponse:

        return MatchMakingService.get_by_id(
            db=db,
            parent_id=parent_id,
            language_id=language_id,
        )

    @staticmethod
    def create(
        payload: MatchMakingCreate,
        db: Session = Depends(get_db),
    ) -> MatchMakingResponse:

        return MatchMakingService.create(
            db=db,
            data=payload,
        )

    @staticmethod
    def update(
        match_making_id: int,
        payload: MatchMakingUpdate,
        db: Session = Depends(get_db),
    ) -> MatchMakingResponse:

        return MatchMakingService.update(
            db=db,
            match_making_id=match_making_id,
            data=payload,
        )

    @staticmethod
    def delete(
        match_making_id: int,
        db: Session = Depends(get_db),
    ):

        return MatchMakingService.delete(
            db=db,
            match_making_id=match_making_id,
        )



    @staticmethod
    def get_left_items(
        match_making_id: int,
        language_id: Optional[int] = Query(None),
        db: Session = Depends(get_db),
    ):
        return MatchMakingService.get_left_items(
            db=db,
            match_making_id=match_making_id,
            language_id=language_id,
        )

    @staticmethod
    def create_left_item(
        match_making_id: int,
        payload: MatchLeftItemCreate,
        db: Session = Depends(get_db),
    ) -> MatchLeftItemResponse:

        return MatchMakingService.create_left_item(
            db=db,
            match_making_id=match_making_id,
            data=payload,
        )

    @staticmethod
    def update_left_item(
        match_left_id: int,
        payload: MatchLeftItemUpdate,
        db: Session = Depends(get_db),
    ) -> MatchLeftItemResponse:

        return MatchMakingService.update_left_item(
            db=db,
            match_left_id=match_left_id,
            data=payload,
        )

    @staticmethod
    def delete_left_item(
        match_left_id: int,
        db: Session = Depends(get_db),
    ):
        return MatchMakingService.delete_left_item(
            db=db,
            match_left_id=match_left_id,
        )



    @staticmethod
    def get_right_items(
     match_making_id: int,
     language_id: Optional[int] = None,
     db: Session = Depends(get_db),
):
     return MatchMakingService.get_right_items(
        db=db,
        match_making_id=match_making_id,
        language_id=language_id,
    )


    @staticmethod
    def create_right_item(
     match_making_id: int,
     payload: MatchRightItemCreate,
     db: Session = Depends(get_db),
):
     return MatchMakingService.create_right_item(
        db=db,
        match_making_id=match_making_id,
        data=payload,
    )


    @staticmethod
    def get_right_item_by_id(
     match_right_id: int,
     db: Session = Depends(get_db),
):
     return MatchMakingService.get_right_item_by_id(
        db=db,
        match_right_id=match_right_id,
    )


    @staticmethod
    def update_right_item(
     match_right_id: int,
     payload: MatchRightItemUpdate,
     db: Session = Depends(get_db),
):
     return MatchMakingService.update_right_item(
        db=db,
        match_right_id=match_right_id,
        data=payload,
    )


    @staticmethod
    def delete_right_item(
     match_right_id: int,
     db: Session = Depends(get_db),
):
     return MatchMakingService.delete_right_item(
        db=db,
        match_right_id=match_right_id,
    )