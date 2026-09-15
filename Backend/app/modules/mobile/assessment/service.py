from dbm import dumb
import logging

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.mobile.assessment import marking, progress, scoring
from app.modules.mobile.assessment.answer_repository import AnswerRepository
from app.modules.mobile.assessment.builder import build_questions
from app.modules.mobile.assessment.constants import (
    PASS_PERCENTAGE,
    TYPE_DROP_BUCKET,
    TYPE_MATCH_MAKING,
    TYPE_MCQ,
    TYPE_SCQ,
)
from app.modules.mobile.assessment.ref_resolver import _mapped_refs
from app.modules.mobile.assessment.schema import (
    ModuleAssessmentResponse,
    QuestionResult,
    SubmitAssessmentRequest,
    SubmitAssessmentResponse,
)
from app.modules.mobile.module.constants import LOCK_STATUS_COMPLETED

logger = logging.getLogger(__name__)


# =========================================================
# Assessment configuration
# =========================================================

_ASSESSMENT_TYPES = (
    TYPE_MCQ,
    TYPE_SCQ,
    TYPE_DROP_BUCKET,
    TYPE_MATCH_MAKING,
)


def _configured_question_ids(
    db: Session,
    module_id: int,
) -> dict[str, set[int]]:
    """
    Return ONLY question IDs explicitly mapped to this exact module.

    Web assessment mapping is the source of truth.
    """
    configured_ids: dict[str, set[int]] = {}

    for assessment_type in _ASSESSMENT_TYPES:
        refs = _mapped_refs(
            db=db,
            module_ids=[module_id],
            assessment_type=assessment_type,
        )

        configured_ids[assessment_type] = set(refs)

    return configured_ids


def _filter_configured_questions(
    questions,
    configured_ids: dict[str, set[int]],
):
    if not questions:
        return []

    filtered = []

    for question in questions:

        question_type = question.type
        question_id = question.question_id

        allowed_ids = configured_ids.get(
            question_type,
            set(),
        )

        if question_id in allowed_ids:
            filtered.append(question)

    return filtered


class AssessmentService:

    # =========================================================
    # GET ASSESSMENT
    # =========================================================

    @staticmethod
    def get_assessment(
        db: Session,
        module_id: int,
        language_id: int,
    ) -> ModuleAssessmentResponse:

        configured_ids = _configured_question_ids(
            db=db,
            module_id=module_id,
        )

        if not any(configured_ids.values()):
            return ModuleAssessmentResponse(
                module_id=module_id,
                language_id=language_id,
                total_questions=0,
                pass_percentage=PASS_PERCENTAGE,
                questions=[],
            )

        questions, _ = build_questions(
            db=db,
            module_id=module_id,
            language_id=language_id,
        )

        questions = _filter_configured_questions(
            questions=questions,
            configured_ids=configured_ids,
        )

        return ModuleAssessmentResponse(
            module_id=module_id,
            language_id=language_id,
            total_questions=len(questions),
            pass_percentage=PASS_PERCENTAGE,
            questions=questions,
        )

    # =========================================================
    # SUBMIT ASSESSMENT
    # =========================================================

    @staticmethod
    def submit(
        db: Session,
        participant_id: int,
        module_id: int,
        language_id: int,
        request: SubmitAssessmentRequest,
    ) -> SubmitAssessmentResponse:

        configured_ids = _configured_question_ids(
            db=db,
            module_id=module_id,
        )

        if not any(configured_ids.values()):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="This module has no active assessment configuration.",
            )

        questions, key = build_questions(
            db=db,
            module_id=module_id,
            language_id=language_id,
        )

        questions = _filter_configured_questions(
            questions=questions,
            configured_ids=configured_ids,
        )

        if not questions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="This module has no active assessment questions.",
            )

        # -----------------------------------------------------
        # 4. Keep answer key synchronized with visible questions.
        # -----------------------------------------------------

        allowed_keys = {
            (
                question.type,
                question.question_id,
            )
            for question in questions
        }

        key = {lookup: value for lookup, value in key.items() if lookup in allowed_keys}

        # -----------------------------------------------------
        # 5. Check module assignment + sequential access.
        # -----------------------------------------------------

        participant_module = AssessmentService._require_open_module(
            db=db,
            participant_id=participant_id,
            module_id=module_id,
        )

        # -----------------------------------------------------
        # 6. Accept submitted answers only for configured
        #    questions.
        # -----------------------------------------------------

        submitted = {}

        for answer in request.answers:
            lookup = (
                answer.type,
                answer.question_id,
            )

            if lookup in allowed_keys:
                submitted[lookup] = answer

        # -----------------------------------------------------
        # 7. Generate attempt ID.
        # -----------------------------------------------------

        attempt_id = AnswerRepository.next_attempt_id(
            db=db,
            participant_id=participant_id,
        )

        results = []
        scores = []

        # -----------------------------------------------------
        # 8. Mark ONLY configured questions.
        # -----------------------------------------------------

        for question in questions:

            lookup = (
                question.type,
                question.question_id,
            )

            score, correct_ids = marking.mark(
                db=db,
                participant_id=participant_id,
                module_id=module_id,
                course_id=participant_module.course_id,
                attempt_id=attempt_id,
                question=question,
                answer=submitted.get(lookup),
                correct=key.get(lookup),
            )

            scores.append(score)

            results.append(
                QuestionResult(
                    type=question.type,
                    question_id=question.question_id,
                    is_correct=scoring.is_full_marks(score),
                    score=round(score, 3),
                    correct_options=correct_ids,
                )
            )

        # -----------------------------------------------------
        # 9. Calculate score.
        # -----------------------------------------------------

        percentage = scoring.overall_percentage(scores)
        passed = percentage >= PASS_PERCENTAGE

        # -----------------------------------------------------
        # 10. Complete current module and unlock next module.
        # -----------------------------------------------------

        module_completed = False
        next_module_id = None
        next_module_name = None

        if passed:
            (
                module_completed,
                next_module_id,
                next_module_name,
            ) = progress.complete_and_unlock(
                db=db,
                participant_id=participant_id,
                module_id=module_id,
            )

        # -----------------------------------------------------
        # 11. Commit transaction.
        # -----------------------------------------------------

        db.commit()

        # -----------------------------------------------------
        # 12. Calculate result counts.
        # -----------------------------------------------------

        correct_answers = sum(1 for result in results if result.is_correct)

        wrong_answers = len(questions) - correct_answers

        partially_correct = sum(1 for score in scores if scoring.is_partial(score))

        # -----------------------------------------------------
        # 13. Response.
        # -----------------------------------------------------

        return SubmitAssessmentResponse(
            module_id=module_id,
            attempt_id=attempt_id,
            total_questions=len(questions),
            correct_answers=correct_answers,
            wrong_answers=wrong_answers,
            partially_correct=partially_correct,
            score_percentage=percentage,
            pass_percentage=PASS_PERCENTAGE,
            passed=passed,
            module_completed=module_completed,
            next_module_id=next_module_id,
            next_module_name=next_module_name,
            results=results,
        )

    # =========================================================
    # SEQUENTIAL MODULE CHECK
    # =========================================================

    # @staticmethod
    # def _require_open_module(
    #     db: Session,
    #     participant_id: int,
    #     module_id: int,
    # ):

    #     # -----------------------------------------------------
    #     # 1. Module must be assigned.
    #     # -----------------------------------------------------

    #     participant_module = AnswerRepository.get_participant_module(
    #         db=db,
    #         participant_id=participant_id,
    #         module_id=module_id,
    #     )

    #     if participant_module is None:
    #         logger.warning(
    #             "[_require_open_module] FAIL check-1: module %s NOT assigned to participant %s",
    #             module_id,
    #             participant_id,
    #         )
    #         raise HTTPException(
    #             status_code=status.HTTP_403_FORBIDDEN,
    #             detail="This module is not assigned to you.",
    #         )

    #     # -----------------------------------------------------
    #     # 2. Completed module cannot be submitted again.
    #     # -----------------------------------------------------

    #     if participant_module.lock_status == LOCK_STATUS_COMPLETED:
    #         logger.warning(
    #             "[_require_open_module] FAIL check-2: module %s already COMPLETED for participant %s",
    #             module_id,
    #             participant_id,
    #         )
    #         raise HTTPException(
    #             status_code=status.HTTP_403_FORBIDDEN,
    #             detail="This module is already completed.",
    #         )

    #     # -----------------------------------------------------
    #     # 3. Get canonical module/group ID.
    #     # -----------------------------------------------------

    #     target_group_id = AnswerRepository.get_module_parent_id(
    #         db=db,
    #         module_id=module_id,
    #     )

    #     if target_group_id is None:
    #         logger.warning(
    #             "[_require_open_module] FAIL check-3: module %s has no parent (invalid)",
    #             module_id,
    #         )
    #         raise HTTPException(
    #             status_code=status.HTTP_403_FORBIDDEN,
    #             detail="Invalid module.",
    #         )

    #     # -----------------------------------------------------
    #     # 4. Get participant module groups.
    #     # -----------------------------------------------------

    #     groups = AnswerRepository.list_participant_module_groups(
    #         db=db,
    #         participant_id=participant_id,
    #     )

    #     if not groups:
    #         logger.warning(
    #             "[_require_open_module] FAIL check-4: participant %s has ZERO module groups",
    #             participant_id,
    #         )
    #         raise HTTPException(
    #             status_code=status.HTTP_403_FORBIDDEN,
    #             detail="No modules are assigned to you.",
    #         )

    #     # -----------------------------------------------------
    #     # 5. Find first incomplete module.
    #     # -----------------------------------------------------

    #     first_incomplete_group_id = None

    #     for group in groups:
    #         if group.lock_status != LOCK_STATUS_COMPLETED:
    #             first_incomplete_group_id = group.group_id
    #             break

    #     # -----------------------------------------------------
    #     # 6. Everything completed.
    #     # -----------------------------------------------------

    #     if first_incomplete_group_id is None:
    #         logger.warning(
    #             "[_require_open_module] FAIL check-5: ALL modules completed for participant %s",
    #             participant_id,
    #         )
    #         raise HTTPException(
    #             status_code=status.HTTP_403_FORBIDDEN,
    #             detail="All modules are already completed.",
    #         )

    #     # -----------------------------------------------------
    #     # 7. Only first incomplete module is allowed.
    #     # -----------------------------------------------------

    #     if first_incomplete_group_id != target_group_id:
    #         logger.warning(
    #             "[_require_open_module] FAIL check-6: module %s (group %s) blocked — "
    #             "first incomplete group is %s for participant %s",
    #             module_id,
    #             target_group_id,
    #             first_incomplete_group_id,
    #             participant_id,
    #         )
    #         raise HTTPException(
    #             status_code=status.HTTP_403_FORBIDDEN,
    #             detail="Complete the previous module first.",
    #         )

    #     return participant_module

    @staticmethod
    def _require_open_module(
        db: Session,
        participant_id: int,
        module_id: int,
    ):
        """
        Validate that the requested module is assigned to the participant
        and has not already been completed.

        Modules are allowed to be submitted independently.
        Sequential previous-module blocking is intentionally not applied here.
        """

        # -----------------------------------------------------
        # 1. Module must be assigned.
        # -----------------------------------------------------

        participant_module = AnswerRepository.get_participant_module(
            db=db,
            participant_id=participant_id,
            module_id=module_id,
        )

        if participant_module is None:
            logger.warning(
                "[_require_open_module] FAIL check-1: "
                "module %s NOT assigned to participant %s",
                module_id,
                participant_id,
            )

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This module is not assigned to you.",
            )

        # -----------------------------------------------------
        # 2. Completed module cannot be submitted again.
            # -----------------------------------------------------

            if participant_module.lock_status == LOCK_STATUS_COMPLETED:
                logger.warning(
                    "[_require_open_module] FAIL check-2: "
                    "module %s already COMPLETED for participant %s",
                    module_id,
                participant_id,
            )

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This module is already completed.",
            )

        # -----------------------------------------------------
        # 3. Module is assigned and incomplete.
        #    No previous-module/sequential blocking.
        # -----------------------------------------------------

        logger.info(
            "[_require_open_module] PASS: "
            "module %s allowed for participant %s",
            module_id,
            participant_id,
        )

        return participant_module