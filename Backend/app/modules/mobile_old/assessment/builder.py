# """
# Turns the four question banks into one uniform question list, and exposes the
# answer key separately so it is never mixed into what the app receives.
# """

# from collections import defaultdict

# from sqlalchemy.orm import Session

# from app.modules.mobile.assessment.constants import (
#     TYPE_DROP_BUCKET,
#     TYPE_MATCH_MAKING,
#     TYPE_MCQ,
#     TYPE_SCQ,
# )
# from app.modules.mobile.assessment.question_repository import (
#     QuestionRepository,
# )
# from app.modules.mobile.assessment.schema import (
#     BucketItem,
#     DraggableItem,
#     MatchItem,
#     OptionItem,
#     QuestionItem,
# )


# def build_questions(db: Session, module_id: int, language_id: int):
#     """
#     Returns (questions, answer_key).

#     answer_key maps (type, question_id) to whatever that type needs for
#     marking: a set of option ids, or an item->bucket / left->right map.
#     """

#     questions: list[QuestionItem] = []
#     key: dict[tuple[str, int], object] = {}

#     _add_choice(db, module_id, questions, key, TYPE_MCQ, language_id)
#     _add_choice(db, module_id, questions, key, TYPE_SCQ, language_id)
#     _add_drop_buckets(db, module_id, questions, key, language_id)
#     _add_match_making(db, module_id, questions, key, language_id)

#     return questions, key


# def _add_choice(db, module_id, questions, key, kind, language_id):
#     is_mcq = kind == TYPE_MCQ

#     rows = (
#         QuestionRepository.mcq_questions(db, module_id, language_id)
#         if is_mcq
#         else QuestionRepository.scq_questions(db, module_id, language_id)
#     )

#     if not rows:
#         return

#     ids = [row.mcq_id if is_mcq else row.scq_id for row in rows]

#     options = (
#         QuestionRepository.mcq_options(db, ids)
#         if is_mcq
#         else QuestionRepository.scq_options(db, ids)
#     )

#     by_question = defaultdict(list)
#     correct = defaultdict(set)

#     for option in options:
#         if is_mcq:
#             qid, oid = option.mcq_id, option.mcq_option_id
#             text, ok = option.mcq_option_text, option.is_mcq_option_correct
#         else:
#             qid, oid = option.scq_id, option.scq_option_id
#             text, ok = option.scq_option_text, option.is_scq_option_correct

#         by_question[qid].append(OptionItem(option_id=oid, option_text=text))

#         if ok == 1:
#             correct[qid].add(oid)

#     for row in rows:
#         qid = row.mcq_id if is_mcq else row.scq_id

#         if not by_question[qid]:
#             continue

#         questions.append(
#             QuestionItem(
#                 type=kind,
#                 question_id=qid,
#                 question_title=(
#                     row.mcq_question_title if is_mcq else row.scq_question_title
#                 ),
#                 question_description=(
#                     row.mcq_question_description
#                     if is_mcq
#                     else row.scq_question_description
#                 ),
#                 image_url=row.image_url,
#                 marks=float(row.marks or 1),
#                 # SCQ is single answer by definition; MCQ depends on its data.
#                 allows_multiple=is_mcq and len(correct[qid]) > 1,
#                 options=by_question[qid],
#             )
#         )

#         key[(kind, qid)] = correct[qid]


# def _add_drop_buckets(db, module_id, questions, key, language_id):
#     rows = QuestionRepository.drop_bucket_questions(db, module_id, language_id)

#     if not rows:
#         return

#     # Buckets hang off the base question rather than off each translation of
#     # it, so a translated master has to be looked up under its parent's id as
#     # well as its own.
#     base_of = {
#         row.drop_bucket_id: row.parent_id or row.drop_bucket_id for row in rows
#     }

#     buckets = QuestionRepository.buckets(
#         db,
#         sorted(set(base_of) | set(base_of.values())),
#         language_id,
#     )

#     by_question = defaultdict(list)

#     for bucket in buckets:
#         by_question[bucket.drop_bucket_id].append(bucket)

#     items = QuestionRepository.bucket_items(
#         db,
#         [bucket.bucket_id for bucket in buckets],
#         language_id,
#     )

#     items_by_bucket = defaultdict(list)

#     for item in items:
#         items_by_bucket[item.bucket_id].append(item)

#     for row in rows:
#         own_buckets = (
#             by_question.get(row.drop_bucket_id)
#             or by_question.get(base_of[row.drop_bucket_id])
#             or []
#         )

#         if not own_buckets:
#             continue

#         draggables = []
#         correct: dict[int, int] = {}

#         for bucket in own_buckets:
#             for item in items_by_bucket[bucket.bucket_id]:
#                 draggables.append(
#                     DraggableItem(
#                         item_id=item.drop_bucket_item_id,
#                         item_name=item.item_name,
#                         item_image=item.item_image,
#                     )
#                 )
#                 # The bucket an item is stored under is its right answer.
#                 correct[item.drop_bucket_item_id] = bucket.bucket_id

#         if not draggables:
#             continue

#         questions.append(
#             QuestionItem(
#                 type=TYPE_DROP_BUCKET,
#                 question_id=row.drop_bucket_id,
#                 question_title=row.drop_bucket_question_title,
#                 question_description=row.drop_bucket_question_description,
#                 image_url=row.image_url,
#                 marks=float(row.marks or 1),
#                 buckets=[
#                     BucketItem(
#                         bucket_id=bucket.bucket_id,
#                         bucket_name=bucket.bucket_name,
#                         bucket_image=bucket.bucket_image,
#                     )
#                     for bucket in own_buckets
#                 ],
#                 items=draggables,
#             )
#         )

#         key[(TYPE_DROP_BUCKET, row.drop_bucket_id)] = correct


# def _add_match_making(db, module_id, questions, key, language_id):
#     rows = QuestionRepository.match_questions(db, module_id, language_id)

#     if not rows:
#         return

#     ids = [row.match_making_id for row in rows]

#     left, right, answers = QuestionRepository.match_sides(db, ids)

#     left_by = defaultdict(list)
#     right_by = defaultdict(list)
#     correct_by = defaultdict(dict)

#     for item in left:
#         left_by[item.match_making_id].append(item)

#     for item in right:
#         right_by[item.match_making_id].append(item)

#     for answer in answers:
#         correct_by[answer.match_making_id][answer.match_left_id] = (
#             answer.match_right_id
#         )

#     for row in rows:
#         qid = row.match_making_id

#         if not left_by[qid] or not right_by[qid]:
#             continue

#         questions.append(
#             QuestionItem(
#                 type=TYPE_MATCH_MAKING,
#                 question_id=qid,
#                 question_title=row.match_making_question_title,
#                 question_description=row.match_making_question_description,
#                 image_url=row.image_url,
#                 marks=float(row.marks or 1),
#                 left_items=[
#                     MatchItem(item_id=i.match_left_id, text=i.match_left_text)
#                     for i in left_by[qid]
#                 ],
#                 right_items=[
#                     MatchItem(item_id=i.match_right_id, text=i.match_right_text)
#                     for i in right_by[qid]
#                 ],
#             )
#         )

#         key[(TYPE_MATCH_MAKING, qid)] = correct_by[qid]


"""
Mobile assessment question builder.

Responsibility:
    Build fully hydrated QuestionItem objects and their answer keys.

Important:
    This module does NOT decide whether a question is configured for a
    module. Configuration is owned by the Web Assessment Configuration
    layer and enforced by the Mobile AssessmentService.

Returns:
    (
        list[QuestionItem],
        dict[(question_type, question_id), answer_key]
    )
"""

from collections import defaultdict
from typing import Any

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


def build_questions(
    db: Session,
    module_id: int,
    language_id: int,
) -> tuple[
    list[QuestionItem],
    dict[tuple[str, int], Any],
]:
    """
    Build all valid assessment questions available for the module.

    Configuration filtering MUST be performed by AssessmentService after
    this function returns.

    This function only hydrates questions from the repositories.
    """

    questions: list[QuestionItem] = []
    answer_key: dict[tuple[str, int], Any] = {}

    _add_choice(
        db=db,
        module_id=module_id,
        questions=questions,
        answer_key=answer_key,
        question_type=TYPE_MCQ,
        language_id=language_id,
    )

    _add_choice(
        db=db,
        module_id=module_id,
        questions=questions,
        answer_key=answer_key,
        question_type=TYPE_SCQ,
        language_id=language_id,
    )

    _add_drop_buckets(
        db=db,
        module_id=module_id,
        questions=questions,
        answer_key=answer_key,
        language_id=language_id,
    )

    _add_match_making(
        db=db,
        module_id=module_id,
        questions=questions,
        answer_key=answer_key,
        language_id=language_id,
    )

    return questions, answer_key


def _add_choice(
    db: Session,
    module_id: int,
    questions: list[QuestionItem],
    answer_key: dict[tuple[str, int], Any],
    question_type: str,
    language_id: int,
) -> None:
    """Build MCQ/SCQ questions with their options and answer keys."""

    is_mcq = question_type == TYPE_MCQ

    rows = (
        QuestionRepository.mcq_questions(
            db,
            module_id,
            language_id,
        )
        if is_mcq
        else QuestionRepository.scq_questions(
            db,
            module_id,
            language_id,
        )
    )

    if not rows:
        return

    question_ids = [row.mcq_id if is_mcq else row.scq_id for row in rows]

    options = (
        QuestionRepository.mcq_options(db, question_ids)
        if is_mcq
        else QuestionRepository.scq_options(db, question_ids)
    )

    options_by_question: defaultdict[int, list[OptionItem]] = defaultdict(list)
    correct_by_question: defaultdict[int, set[int]] = defaultdict(set)

    for option in options:
        if is_mcq:
            question_id = option.mcq_id
            option_id = option.mcq_option_id
            option_text = option.mcq_option_text
            is_correct = option.is_mcq_option_correct
        else:
            question_id = option.scq_id
            option_id = option.scq_option_id
            option_text = option.scq_option_text
            is_correct = option.is_scq_option_correct

        options_by_question[question_id].append(
            OptionItem(
                option_id=option_id,
                option_text=option_text,
            )
        )

        if is_correct == 1:
            correct_by_question[question_id].add(option_id)

    for row in rows:
        question_id = row.mcq_id if is_mcq else row.scq_id

        question_options = options_by_question.get(question_id)

        # Invalid/incomplete question: don't expose it to mobile.
        if not question_options:
            continue

        questions.append(
            QuestionItem(
                type=question_type,
                question_id=question_id,
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
                allows_multiple=(is_mcq and len(correct_by_question[question_id]) > 1),
                options=question_options,
            )
        )

        answer_key[(question_type, question_id)] = correct_by_question[question_id]


def _add_drop_buckets(
    db: Session,
    module_id: int,
    questions: list[QuestionItem],
    answer_key: dict[tuple[str, int], Any],
    language_id: int,
) -> None:
    """Build Drop Bucket questions with buckets, items and answer keys."""

    rows = QuestionRepository.drop_bucket_questions(
        db,
        module_id,
        language_id,
    )

    if not rows:
        return

    # A translated Drop Bucket question may point back to a base question.
    base_question_by_id = {
        row.drop_bucket_id: (row.parent_id or row.drop_bucket_id) for row in rows
    }

    bucket_question_ids = sorted(
        set(base_question_by_id) | set(base_question_by_id.values())
    )

    buckets = QuestionRepository.buckets(
        db,
        bucket_question_ids,
        language_id,
    )

    if not buckets:
        return

    buckets_by_question: defaultdict[int, list] = defaultdict(list)

    for bucket in buckets:
        buckets_by_question[bucket.drop_bucket_id].append(bucket)

    bucket_ids = [
        bucket.bucket_id for bucket in buckets if bucket.bucket_id is not None
    ]

    if not bucket_ids:
        return

    items = QuestionRepository.bucket_items(
        db,
        bucket_ids,
        language_id,
    )

    items_by_bucket: defaultdict[int, list] = defaultdict(list)

    for item in items:
        items_by_bucket[item.bucket_id].append(item)

    for row in rows:
        question_id = row.drop_bucket_id

        own_buckets = (
            buckets_by_question.get(question_id)
            or buckets_by_question.get(base_question_by_id[question_id])
            or []
        )

        if not own_buckets:
            continue

        draggable_items: list[DraggableItem] = []
        correct: dict[int, int] = {}

        for bucket in own_buckets:
            for item in items_by_bucket.get(bucket.bucket_id, []):
                draggable_items.append(
                    DraggableItem(
                        item_id=item.drop_bucket_item_id,
                        item_name=item.item_name,
                        item_image=item.item_image,
                    )
                )

                # The bucket containing the item is its correct bucket.
                correct[item.drop_bucket_item_id] = bucket.bucket_id

        # Don't expose incomplete Drop Bucket questions.
        if not draggable_items:
            continue

        questions.append(
            QuestionItem(
                type=TYPE_DROP_BUCKET,
                question_id=question_id,
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
                items=draggable_items,
            )
        )

        answer_key[(TYPE_DROP_BUCKET, question_id)] = correct


def _add_match_making(
    db: Session,
    module_id: int,
    questions: list[QuestionItem],
    answer_key: dict[tuple[str, int], Any],
    language_id: int,
) -> None:
    """Build Match Making questions and answer keys."""

    rows = QuestionRepository.match_questions(
        db,
        module_id,
        language_id,
    )

    if not rows:
        return

    question_ids = [row.match_making_id for row in rows]

    left_items, right_items, answers = QuestionRepository.match_sides(
        db,
        question_ids,
    )

    left_by_question: defaultdict[int, list] = defaultdict(list)
    right_by_question: defaultdict[int, list] = defaultdict(list)
    correct_by_question: defaultdict[int, dict[int, int]] = defaultdict(dict)

    for item in left_items:
        left_by_question[item.match_making_id].append(item)

    for item in right_items:
        right_by_question[item.match_making_id].append(item)

    for answer in answers:
        correct_by_question[answer.match_making_id][
            answer.match_left_id
        ] = answer.match_right_id

    for row in rows:
        question_id = row.match_making_id

        left = left_by_question.get(question_id)
        right = right_by_question.get(question_id)

        # Don't expose incomplete Match Making questions.
        if not left or not right:
            continue

        questions.append(
            QuestionItem(
                type=TYPE_MATCH_MAKING,
                question_id=question_id,
                question_title=row.match_making_question_title,
                question_description=row.match_making_question_description,
                image_url=row.image_url,
                marks=float(row.marks or 1),
                left_items=[
                    MatchItem(
                        item_id=item.match_left_id,
                        text=item.match_left_text,
                    )
                    for item in left
                ],
                right_items=[
                    MatchItem(
                        item_id=item.match_right_id,
                        text=item.match_right_text,
                    )
                    for item in right
                ],
            )
        )

        answer_key[(TYPE_MATCH_MAKING, question_id)] = correct_by_question[question_id]
