from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.database import get_db

from app.modules.assessment.controller.match_correct_answer_controller import (
    MatchCorrectAnswerController,
)

from app.modules.assessment.schema.match_correct_answer_schema import (
    MatchCorrectAnswerCreate,
    MatchCorrectAnswerUpdate,
    MatchCorrectAnswerResponse,
)

from app.shared.dependencies.module_access import Module, require_module_access

router = APIRouter(
    prefix="/match-making",
    tags=["Match Making"],   # <-- Change only this line
    dependencies=[Depends(require_module_access(Module.ASSESSMENT))],
)


# ==========================
# GET ALL CORRECT ANSWERS
# ==========================

@router.get(
    "/{match_making_id}/correct-answers",
    response_model=List[MatchCorrectAnswerResponse],
)
def get_all(
    match_making_id: int,
    db: Session = Depends(get_db),
):
    return MatchCorrectAnswerController.get_all(
        match_making_id=match_making_id,
        db=db,
    )


# ==========================
# GET CORRECT ANSWER BY ID
# ==========================

@router.get(
    "/correct-answers/{match_correct_answers_id}",
    response_model=MatchCorrectAnswerResponse,
)
def get_by_id(
    match_correct_answers_id: int,
    db: Session = Depends(get_db),
):
    return MatchCorrectAnswerController.get_by_id(
        match_correct_answers_id=match_correct_answers_id,
        db=db,
    )


# ==========================
# CREATE CORRECT ANSWER
# ==========================

@router.post(
    "/{match_making_id}/correct-answers",
    response_model=MatchCorrectAnswerResponse,
)
def create(
    match_making_id: int,
    payload: MatchCorrectAnswerCreate,
    db: Session = Depends(get_db),
):
    return MatchCorrectAnswerController.create(
        match_making_id=match_making_id,
        payload=payload,
        db=db,
    )


# ==========================
# UPDATE CORRECT ANSWER
# ==========================

@router.put(
    "/correct-answers/{match_correct_answers_id}",
    response_model=MatchCorrectAnswerResponse,
)
def update(
    match_correct_answers_id: int,
    payload: MatchCorrectAnswerUpdate,
    db: Session = Depends(get_db),
):
    return MatchCorrectAnswerController.update(
        match_correct_answers_id=match_correct_answers_id,
        payload=payload,
        db=db,
    )


# ==========================
# DELETE CORRECT ANSWER
# ==========================

@router.delete(
    "/correct-answers/{match_correct_answers_id}",
)
def delete(
    match_correct_answers_id: int,
    db: Session = Depends(get_db),
):
    return MatchCorrectAnswerController.delete(
        match_correct_answers_id=match_correct_answers_id,
        db=db,
    )