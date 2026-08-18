from fastapi import APIRouter, Depends, File, UploadFile

from app.core.uploads import save_upload
from app.shared.dependencies.module_access import Module, require_module_access

router = APIRouter(
    prefix="/assessment",
    tags=["Assessment - Uploads"],
    dependencies=[Depends(require_module_access(Module.ASSESSMENT))],
)


@router.post(
    "/upload-image",
    summary="Upload an assessment image and return its permanent URL",
)
def upload_assessment_image(image: UploadFile = File(...)):
    """Persist an uploaded image and return the public URL path.

    Used by the MCQ / SCQ / Drop Bucket / Match Making forms so that the
    stored ``image_url`` is always a real ``/uploads/...`` path and never a
    client-side ``blob:`` URL.
    """
    image_url = save_upload(image, "image", "assessment_images")
    return {"image_url": image_url}
