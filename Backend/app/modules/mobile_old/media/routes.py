from pathlib import Path
import logging
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session

from app.database.database import get_db
from app.modules.mobile.media.constants import CHUNK_SIZE
from app.modules.mobile.media.pptx_render import render_deck, slide_dir
from app.modules.mobile.media.service import MediaService
from app.modules.mobile.core.dependencies import get_current_participant
from app.modules.mobile.module.topic_repository import TopicRepository

# Mounted onto the module router, so the paths are
# /mobile/module/media/... and no change to main.py is needed.
#
# Media requests require the mobile bearer token and an assigned content path.
router = APIRouter(
    prefix="/media",
    tags=["Mobile Media"],
)

logger = logging.getLogger(__name__)


def _assert_participant_media_access(
    file_path: str, participant_id: int, db: Session
) -> Path:
    path = MediaService.resolve(file_path)
    allowed_paths = TopicRepository.list_participant_content_paths(
        db=db,
        participant_id=participant_id,
    )
    if not MediaService.is_allowed_path(file_path, set(allowed_paths)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this media.",
        )
    return path


def _iter_file(path: Path, start: int, end: int):
    """
    Yield the requested slice in chunks so large videos never load whole.
    """

    remaining = end - start + 1

    with open(path, "rb") as handle:
        handle.seek(start)

        while remaining > 0:
            chunk = handle.read(min(CHUNK_SIZE, remaining))

            if not chunk:
                break

            remaining -= len(chunk)

            yield chunk


@router.get("/pptx/info")
def get_pptx_info(
    path: str,
    request: Request,
    participant=Depends(get_current_participant),
    db: Session = Depends(get_db),
):
    """
    Render a deck (once, then cached) and report where its slides live, so
    the app can show them inline instead of handing the file to another app.
    """

    source = _assert_participant_media_access(path, participant.participant_id, db)

    try:
        total = render_deck(source)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="This presentation could not be prepared for viewing.",
        )

    base = str(request.url_for("get_pptx_slide", number=1)).rsplit("/", 1)[0]

    return {
        "total_slides": total,
        "slides": [f"{base}/{index + 1}?path={quote(path)}" for index in range(total)],
    }


@router.get("/pptx/slide/{number}", name="get_pptx_slide")
def get_pptx_slide(
    number: int,
    path: str,
    participant=Depends(get_current_participant),
    db: Session = Depends(get_db),
):
    """
    One rendered slide as a PNG.
    """

    source = _assert_participant_media_access(path, participant.participant_id, db)

    slide = slide_dir(source) / f"{number}.png"

    if not slide.is_file():
        # The deck may not have been rendered yet if this is called directly.
        try:
            render_deck(source)
        except Exception:
            pass

    if not slide.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Slide not found.",
        )

    return FileResponse(slide, media_type="image/png")


@router.get("/{file_path:path}")
def get_media(
    file_path: str,
    request: Request,
    participant=Depends(get_current_participant),
    db: Session = Depends(get_db),
):
    """
    Stream a stored file.

    Honours the Range header, which is what lets a video player seek and
    what some players require before they will start at all.
    """

    logger.info(
        "Mobile media request: path=%s range=%s",
        file_path,
        request.headers.get("range"),
    )

    path = _assert_participant_media_access(
        file_path,
        participant.participant_id,
        db,
    )

    file_size = path.stat().st_size
    content_type = MediaService.content_type(path)

    requested = MediaService.parse_range(
        request.headers.get("range"),
        file_size,
    )

    if requested is None:
        return FileResponse(
            path,
            media_type=content_type,
            headers={
                "Accept-Ranges": "bytes",
                "Content-Length": str(file_size),
            },
        )

    start, end = requested

    return StreamingResponse(
        _iter_file(path, start, end),
        status_code=206,
        media_type=content_type,
        headers={
            "Accept-Ranges": "bytes",
            "Content-Range": f"bytes {start}-{end}/{file_size}",
            "Content-Length": str(end - start + 1),
        },
    )
