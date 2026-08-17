from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.modules.mobile.assessment import marking, progress, scoring
from app.modules.mobile.assessment.answer_repository import AnswerRepository
from app.modules.mobile.assessment.builder import build_questions
from app.modules.mobile.assessment.constants import PASS_PERCENTAGE
from app.modules.mobile.assessment.schema import (
    ModuleAssessmentResponse,
    QuestionResult,
    SubmitAssessmentRequest,
    SubmitAssessmentResponse,
)
from app.modules.mobile.module.constants import LOCK_STATUS_LOCKED


class AssessmentService:

    @staticmethod
    def get_assessment(
        db: Session,
        module_id: int,
        language_id: int,
    ) -> ModuleAssessmentResponse:

        questions, _ = build_questions(
            db=db,
            module_id=module_id,
            language_id=language_id,
        )

        return ModuleAssessmentResponse(
            module_id=module_id,
            language_id=language_id,
            total_questions=len(questions),
            pass_percentage=PASS_PERCENTAGE,
            questions=questions,
        )

    @staticmethod
    def submit(
        db: Session,
        participant_id: int,
        module_id: int,
        language_id: int,
        request: SubmitAssessmentRequest,
    ) -> SubmitAssessmentResponse:

        questions, key = build_questions(
            db=db,
            module_id=module_id,
            language_id=language_id,
        )

        if not questions:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="This module has no assessment.",
            )

        participant_module = AssessmentService._require_open_module(
            db=db,
            participant_id=participant_id,
            module_id=module_id,
        )

        submitted = {
            (answer.type, answer.question_id): answer
            for answer in request.answers
        }

        attempt_id = AnswerRepository.next_attempt_id(
            db=db,
            participant_id=participant_id,
        )

        results = []
        scores = []

        for question in questions:
            lookup = (question.type, question.question_id)

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

        percentage = scoring.overall_percentage(scores)
        passed = percentage >= PASS_PERCENTAGE

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

        db.commit()

        correct_answers = sum(1 for r in results if r.is_correct)

        return SubmitAssessmentResponse(
            module_id=module_id,
            attempt_id=attempt_id,
            total_questions=len(questions),
            correct_answers=correct_answers,
            wrong_answers=len(questions) - correct_answers,
            partially_correct=sum(
                1 for score in scores if scoring.is_partial(score)
            ),
            score_percentage=percentage,
            pass_percentage=PASS_PERCENTAGE,
            passed=passed,
            module_completed=module_completed,
            next_module_id=next_module_id,
            next_module_name=next_module_name,
            results=results,
        )

    @staticmethod
    def _require_open_module(db: Session, participant_id: int, module_id: int):

        participant_module = AnswerRepository.get_participant_module(
            db=db,
            participant_id=participant_id,
            module_id=module_id,
        )

        if participant_module is None:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This module is not assigned to you.",
            )

        if participant_module.lock_status == LOCK_STATUS_LOCKED:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Complete the previous module first.",
            )

        return participant_module
