"""
Marking rules, kept apart from the database and the routes.

Every question yields a score from 0.0 to 1.0. Multi-answer questions are
marked proportionally: each correct choice earns credit and each wrong choice
cancels one out, floored at zero. All-or-nothing marking meant a participant
who picked one of three correct options scored zero, which read as a bug.
"""


def score_choice(selected: set[int], correct: set[int]) -> float:
    """
    MCQ and SCQ. A single-answer question naturally collapses to 1.0 or 0.0.
    """

    if not correct:
        return 0.0

    if not selected:
        return 0.0

    hits = len(selected & correct)
    misses = len(selected - correct)

    return max(0.0, (hits - misses) / len(correct))


def score_placements(
    placements: dict[int, int],
    correct: dict[int, int],
) -> float:
    """
    Drop bucket. `placements` and `correct` are both item_id -> bucket_id.
    """

    if not correct:
        return 0.0

    hits = sum(
        1
        for item_id, bucket_id in placements.items()
        if correct.get(item_id) == bucket_id
    )

    return max(0.0, hits / len(correct))


def score_pairs(
    pairs: dict[int, int],
    correct: dict[int, int],
) -> float:
    """
    Match making. Both maps are left_id -> right_id.
    """

    if not correct:
        return 0.0

    hits = sum(
        1
        for left_id, right_id in pairs.items()
        if correct.get(left_id) == right_id
    )

    return max(0.0, hits / len(correct))


def is_full_marks(score: float) -> bool:
    return score >= 0.999


def is_partial(score: float) -> bool:
    """
    Some credit earned, but not the whole question.
    """

    return 0.0 < score < 0.999


def overall_percentage(scores: list[float]) -> float:
    """
    Share of questions answered fully correctly.

    Deliberately counts whole questions rather than averaging partial credit:
    the result screen shows Total / Correct / Wrong alongside the score, and
    those three have to add up. A score of 58.3% next to "1 correct, 3 wrong"
    reads as a bug, because it is one.

    Partial credit is still reported per question in `results`, so a
    participant can see which answers were half right.
    """

    if not scores:
        return 0.0

    full = sum(1 for score in scores if is_full_marks(score))

    return round(full * 100 / len(scores), 2)
