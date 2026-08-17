from typing import List, Optional

from fastapi import APIRouter, Query
from sqlalchemy.orm import Session
from fastapi import Depends

from app.database.database import get_db

from app.modules.assessment.controller.match_making_controller import (
    MatchMakingController,
)

from app.modules.assessment.schema.match_making_schema import (
    MatchLeftItemCreate,
    MatchLeftItemResponse,
    MatchLeftItemUpdate,
    MatchMakingCreate,
    MatchMakingResponse,
    MatchMakingUpdate,
    MatchRightItemCreate,
    MatchRightItemResponse,
    MatchRightItemUpdate,
)

router = APIRouter(
    prefix="/match-making",
    tags=["Match Making"],
)


@router.get(
    "/",
    response_model=List[MatchMakingResponse],
)
def get_all(
    language_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    return MatchMakingController.get_all(
        language_id=language_id,
        search=search,
        db=db,
    )


@router.get(
    "/{parent_id}",
    response_model=MatchMakingResponse,
)
def get_by_id(
    parent_id: int,
    language_id: int = Query(...),
    db: Session = Depends(get_db),
):
    return MatchMakingController.get_by_id(
        parent_id=parent_id,
        language_id=language_id,
        db=db,
    )


@router.post(
    "/",
    response_model=MatchMakingResponse,
)
def create(
    payload: MatchMakingCreate,
    db: Session = Depends(get_db),
):
    return MatchMakingController.create(
        payload=payload,
        db=db,
    )


@router.put(
    "/{match_making_id}",
    response_model=MatchMakingResponse,
)
def update(
    match_making_id: int,
    payload: MatchMakingUpdate,
    db: Session = Depends(get_db),
):
    return MatchMakingController.update(
        match_making_id=match_making_id,
        payload=payload,
        db=db,
    )


@router.delete(
    "/{match_making_id}",
)
def delete(
    match_making_id: int,
    db: Session = Depends(get_db),
):
    return MatchMakingController.delete(
        match_making_id=match_making_id,
        db=db,
    )



# ===========================
# LEFT ITEMS
# ===========================

@router.get(
    "/{match_making_id}/left-items",
    response_model=list[MatchLeftItemResponse],
)
def get_left_items(
    match_making_id: int,
    language_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    return MatchMakingController.get_left_items(
        match_making_id=match_making_id,
        language_id=language_id,
        db=db,
    )


@router.post(
    "/{match_making_id}/left-items",
    response_model=MatchLeftItemResponse,
)
def create_left_item(
    match_making_id: int,
    payload: MatchLeftItemCreate,
    db: Session = Depends(get_db),
):
    return MatchMakingController.create_left_item(
        match_making_id=match_making_id,
        payload=payload,
        db=db,
    )


@router.get(
    "/left-items/{match_left_id}",
    response_model=MatchLeftItemResponse,
)
def get_left_item_by_id(
    match_left_id: int,
    db: Session = Depends(get_db),
):
    return MatchMakingController.get_left_item_by_id(
        match_left_id=match_left_id,
        db=db,
    )


@router.put(
    "/left-items/{match_left_id}",
    response_model=MatchLeftItemResponse,
)
def update_left_item(
    match_left_id: int,
    payload: MatchLeftItemUpdate,
    db: Session = Depends(get_db),
):
    return MatchMakingController.update_left_item(
        match_left_id=match_left_id,
        payload=payload,
        db=db,
    )


@router.delete(
    "/left-items/{match_left_id}",
)
def delete_left_item(
    match_left_id: int,
    db: Session = Depends(get_db),
):
    return MatchMakingController.delete_left_item(
        match_left_id=match_left_id,
        db=db,
    )



@router.get(
    "/{match_making_id}/right-items",
    response_model=list[MatchRightItemResponse],
)
def get_right_items(
    match_making_id: int,
    language_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    return MatchMakingController.get_right_items(
        match_making_id=match_making_id,
        language_id=language_id,
        db=db,
    )


@router.post(
    "/{match_making_id}/right-items",
    response_model=MatchRightItemResponse,
)
def create_right_item(
    match_making_id: int,
    payload: MatchRightItemCreate,
    db: Session = Depends(get_db),
):
    return MatchMakingController.create_right_item(
        match_making_id=match_making_id,
        payload=payload,
        db=db,
    )


@router.get(
    "/right-items/{match_right_id}",
    response_model=MatchRightItemResponse,
)
def get_right_item_by_id(
    match_right_id: int,
    db: Session = Depends(get_db),
):
    return MatchMakingController.get_right_item_by_id(
        match_right_id=match_right_id,
        db=db,
    )


@router.put(
    "/right-items/{match_right_id}",
    response_model=MatchRightItemResponse,
)
def update_right_item(
    match_right_id: int,
    payload: MatchRightItemUpdate,
    db: Session = Depends(get_db),
):
    return MatchMakingController.update_right_item(
        match_right_id=match_right_id,
        payload=payload,
        db=db,
    )


@router.delete(
    "/right-items/{match_right_id}",
)
def delete_right_item(
    match_right_id: int,
    db: Session = Depends(get_db),
):
    return MatchMakingController.delete_right_item(
        match_right_id=match_right_id,
        db=db,
    )