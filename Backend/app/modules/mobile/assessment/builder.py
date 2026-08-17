"""
Turns the four question banks into one uniform question list, and exposes the
answer key separately so it is never mixed into what the app receives.
"""

from collections import defaultdict

from sqlalchemy.orm import Session

from app.modules.mobile.assessment.constants import (
    TYPE_DROP_BUCKET,
    TYPE_MATCH_MAKING,
    TYPE_MCQ,
    TYPE_SCQ,
)
from app.modules.mobile.assessment.question_repository import (
    QuestionRepository,
)
from app.modules.mobile.assessment.schema import (
    BucketItem,
    DraggableItem,
    MatchItem,
    OptionItem,
    QuestionItem,
)


def build_questions(db: Session, module_id: int, language_id: int):
    """
    Returns (questions, answer_key).

    answer_key maps (type, question_id) to whatever that type needs for
    marking: a set of option ids, or an item->bucket / left->right map.
    """

    questions: list[QuestionItem] = []
    key: dict[tuple[str, int], object] = {}

    _add_choice(db, module_id, questions, key, TYPE_MCQ)
    _add_choice(db, module_id, questions, key, TYPE_SCQ)
    _add_drop_buckets(db, module_id, questions, key, language_id)
    _add_match_making(db, module_id, questions, key)

    return questions, key


def _add_choice(db, module_id, questions, key, kind):
    is_mcq = kind == TYPE_MCQ

    rows = (
        QuestionRepository.mcq_questions(db, module_id)
        if is_mcq
        else QuestionRepository.scq_questions(db, module_id)
    )

    if not rows:
        return

    ids = [row.mcq_id if is_mcq else row.scq_id for row in rows]

    options = (
        QuestionRepository.mcq_options(db, ids)
        if is_mcq
        else QuestionRepository.scq_options(db, ids)
    )

    by_question = defaultdict(list)
    correct = defaultdict(set)

    for option in options:
        if is_mcq:
            qid, oid = option.mcq_id, option.mcq_option_id
            text, ok = option.mcq_option_text, option.is_mcq_option_correct
        else:
            qid, oid = option.scq_id, option.scq_option_id
            text, ok = option.scq_option_text, option.is_scq_option_correct

        by_question[qid].append(OptionItem(option_id=oid, option_text=text))

        if ok == 1:
            correct[qid].add(oid)

    for row in rows:
        qid = row.mcq_id if is_mcq else row.scq_id

        if not by_question[qid]:
            continue

        questions.append(
            QuestionItem(
                type=kind,
                question_id=qid,
                question_title=(
                    row.mcq_question_title if is_mcq else row.scq_question_title
                ),
                question_description=(
                    row.mcq_question_description
                    if is_mcq
                    else row.scq_question_description
                ),
                image_url=row.image_url,
                marks=float(row.marks or 1),
                # SCQ is single answer by definition; MCQ depends on its data.
                allows_multiple=is_mcq and len(correct[qid]) > 1,
                options=by_question[qid],
            )
        )

        key[(kind, qid)] = correct[qid]


def _add_drop_buckets(db, module_id, questions, key, language_id):
    rows = QuestionRepository.drop_bucket_questions(db, module_id)

    if not rows:
        return

    ids = [row.drop_bucket_id for row in rows]

    buckets = QuestionRepository.buckets(db, ids, language_id)

    by_question = defaultdict(list)

    for bucket in buckets:
        by_question[bucket.drop_bucket_id].append(bucket)

    items = QuestionRepository.bucket_items(
        db,
        [bucket.bucket_id for bucket in buckets],
        language_id,
    )

    items_by_bucket = defaultdict(list)

    for item in items:
        items_by_bucket[item.bucket_id].append(item)

    for row in rows:
        own_buckets = by_question[row.drop_bucket_id]

        if not own_buckets:
            continue

        draggables = []
        correct: dict[int, int] = {}

        for bucket in own_buckets:
            for item in items_by_bucket[bucket.bucket_id]:
                draggables.append(
                    DraggableItem(
                        item_id=item.drop_bucket_item_id,
                        item_name=item.item_name,
                        item_image=item.item_image,
                    )
                )
                # The bucket an item is stored under is its right answer.
                correct[item.drop_bucket_item_id] = bucket.bucket_id

        if not draggables:
            continue

        questions.append(
            QuestionItem(
                type=TYPE_DROP_BUCKET,
                question_id=row.drop_bucket_id,
                question_title=row.drop_bucket_question_title,
                question_description=row.drop_bucket_question_description,
                image_url=row.image_url,
                marks=float(row.marks or 1),
                buckets=[
                    BucketItem(
                        bucket_id=bucket.bucket_id,
                        bucket_name=bucket.bucket_name,
                        bucket_image=bucket.bucket_image,
                    )
                    for bucket in own_buckets
                ],
                items=draggables,
            )
        )

        key[(TYPE_DROP_BUCKET, row.drop_bucket_id)] = correct


def _add_match_making(db, module_id, questions, key):
    rows = QuestionRepository.match_questions(db, module_id)

    if not rows:
        return

    ids = [row.match_making_id for row in rows]

    left, right, answers = QuestionRepository.match_sides(db, ids)

    left_by = defaultdict(list)
    right_by = defaultdict(list)
    correct_by = defaultdict(dict)

    for item in left:
        left_by[item.match_making_id].append(item)

    for item in right:
        right_by[item.match_making_id].append(item)

    for answer in answers:
        correct_by[answer.match_making_id][answer.match_left_id] = (
            answer.match_right_id
        )

    for row in rows:
        qid = row.match_making_id

        if not left_by[qid] or not right_by[qid]:
            continue

        questions.append(
            QuestionItem(
                type=TYPE_MATCH_MAKING,
                question_id=qid,
                question_title=row.match_making_question_title,
                question_description=row.match_making_question_description,
                image_url=row.image_url,
                marks=float(row.marks or 1),
                left_items=[
                    MatchItem(item_id=i.match_left_id, text=i.match_left_text)
                    for i in left_by[qid]
                ],
                right_items=[
                    MatchItem(item_id=i.match_right_id, text=i.match_right_text)
                    for i in right_by[qid]
                ],
            )
        )

        key[(TYPE_MATCH_MAKING, qid)] = correct_by[qid]
