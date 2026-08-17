from fastapi import APIRouter

from app.modules.assessment.controller.mcq_controller import McqController

router = APIRouter(
    prefix="/mcqs",
    tags=["Assessment - MCQ"],
)







router.get(
    "/",
    summary="Get all MCQs",
)(McqController.get_all_mcqs)


router.get(
    "/export",
    summary="Export MCQs",
)(McqController.export_mcqs)

router.get(
    "/{parent_id}",
    summary="Get MCQ Translation",
)(McqController.get_mcq)




router.put(
    "/{parent_id}/translation",
    summary="Create / Update MCQ Translation",
)(McqController.save_translation)


router.post(
    "/",
    summary="Create MCQ",
    status_code=201,
)(McqController.create_mcq)

router.put(
    "/{mcq_id}",
    summary="Update MCQ",
)(McqController.update_mcq)

router.delete(
    "/{mcq_id}",
    summary="Delete MCQ",
)(McqController.delete_mcq)

