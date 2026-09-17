"""
Marks one question of any type and records the participant's answer.
"""

from fastapi import HTTPException, status

from app.modules.mobile.assessment import scoring
from app.modules.mobile.assessment.answer_repository import AnswerRepository
from app.modules.mobile.assessment.constants import (
    TYPE_DROP_BUCKET,
    TYPE_MATCH_MAKING,
    TYPE_MCQ,
    TYPE_SCQ,
)


def reject_unknown(unknown: set, question_id: int) -> None:
    """
    Nothing in the database enforces these references, so ids are checked
    against their own question here.
    """

    if unknown:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Values {sorted(unknown)} do not belong to "
                f"question {question_id}."
            ),
        )


def mark(
    db,
    participant_id,
    module_id,
    course_id,
    attempt_id,
    question,
    answer,
    correct,
):
    """
    Returns (score from 0.0 to 1.0, ids of the correct options).
    """

    kind = question.type

    if kind in (TYPE_MCQ, TYPE_SCQ):
        return _mark_choice(
            db, participant_id, module_id, course_id, attempt_id,
            question, answer, correct, kind,
        )

    if kind == TYPE_DROP_BUCKET:
        return _mark_drop_bucket(
            db, participant_id, module_id, course_id, attempt_id,
            question, answer, correct,
        )

    if kind == TYPE_MATCH_MAKING:
        return _mark_match_making(
            db, participant_id, module_id, course_id, attempt_id,
            question, answer, correct,
        )

    return 0.0, []


def _mark_choice(
    db, participant_id, module_id, course_id, attempt_id,
    question, answer, correct, kind,
):
    valid = {option.option_id for option in question.options}

    chosen = set(answer.selected_options) if answer else set()

    reject_unknown(chosen - valid, question.question_id)

    # SCQ takes a single answer even if the app sends more.
    if kind == TYPE_SCQ and len(chosen) > 1:
        chosen = {sorted(chosen)[0]}

    score = scoring.score_choice(chosen, correct or set())

    rows = [(question.question_id, option) for option in chosen]

    if kind == TYPE_MCQ:
        AnswerRepository.save_mcq(
            db, participant_id, module_id, course_id, attempt_id, rows
        )
    else:
        AnswerRepository.save_scq(
            db, participant_id, module_id, attempt_id, rows
        )

    return score, sorted(correct or set())


def _mark_drop_bucket(
    db, participant_id, module_id, course_id, attempt_id,
    question, answer, correct,
):
    valid_items = {item.item_id for item in question.items}
    valid_buckets = {bucket.bucket_id for bucket in question.buckets}

    placements = {}

    for placement in (answer.placements if answer else []):
        reject_unknown(
            {placement.item_id} - valid_items, question.question_id
        )
        reject_unknown(
            {placement.bucket_id} - valid_buckets, question.question_id
        )

        placements[placement.item_id] = placement.bucket_id

    score = scoring.score_placements(placements, correct or {})

    AnswerRepository.save_drop_bucket(
        db,
        participant_id,
        module_id,
        course_id,
        attempt_id,
        list(placements.items()),
    )

    return score, []


def _mark_match_making(
    db, participant_id, module_id, course_id, attempt_id,
    question, answer, correct,
):
    valid_left = {item.item_id for item in question.left_items}
    valid_right = {item.item_id for item in question.right_items}

    pairs = {}

    for pair in (answer.pairs if answer else []):
        reject_unknown({pair.left_id} - valid_left, question.question_id)
        reject_unknown({pair.right_id} - valid_right, question.question_id)

        pairs[pair.left_id] = pair.right_id

    score = scoring.score_pairs(pairs, correct or {})

    rows = [
        (
            question.question_id,
            left_id,
            right_id,
            (correct or {}).get(left_id) == right_id,
        )
        for left_id, right_id in pairs.items()
    ]

    AnswerRepository.save_match_making(
        db, participant_id, module_id, course_id, attempt_id, rows
    )

    return score, []
