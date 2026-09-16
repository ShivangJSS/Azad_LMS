from pathlib import Path
from urllib.parse import quote

from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import FileResponse, StreamingResponse

from app.modules.mobile.media.constants import CHUNK_SIZE
from app.modules.mobile.media.pptx_render import render_deck, slide_dir
from app.modules.mobile.media.service import MediaService

# Mounted onto the module router, so the paths are
# /mobile/module/media/... and no change to main.py is needed.
#
# Deliberately unauthenticated: image and video widgets fetch these URLs
# directly and cannot attach the bearer token, and the same files are already
# served publicly by the web LMS.
router = APIRouter(
    prefix="/media",
    tags=["Mobile Media"],
)


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
def get_pptx_info(path: str, request: Request):
    """
    Render a deck (once, then cached) and report where its slides live, so
    the app can show them inline instead of handing the file to another app.
    """

    source = MediaService.resolve(path)

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
def get_pptx_slide(number: int, path: str):
    """
    One rendered slide as a PNG.
    """

    source = MediaService.resolve(path)

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
def get_media(file_path: str, request: Request):
    """
    Stream a stored file.

    Honours the Range header, which is what lets a video player seek and
    what some players require before they will start at all.
    """

    path = MediaService.resolve(file_path)

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
