from fastapi import APIRouter

from app.modules.assessment.controller.scq_controller import ScqController

router = APIRouter(
    prefix="/scqs",
    tags=["Assessment - SCQ"],
)

# Export
router.get(
    "/export",
    summary="Export SCQs",
)(ScqController.export_scqs)

# List
router.get(
    "/",
    summary="Get All SCQs",
)(ScqController.get_all_scqs)


router.put(
    "/{parent_id}/translation",
    summary="Create / Update SCQ Translation",
)(ScqController.save_translation)

# View
router.get(
    "/{parent_id}",
    summary="Get SCQ by Parent & Language",
)(ScqController.get_scq)

# Create
router.post(
    "/",
    summary="Create SCQ",
    status_code=201,
)(ScqController.create_scq)





# Update
router.put(
    "/{scq_id}",
    summary="Update SCQ",
)(ScqController.update_scq)

# Delete
router.delete(
    "/{scq_id}",
    summary="Delete SCQ",
)(ScqController.delete_scq)