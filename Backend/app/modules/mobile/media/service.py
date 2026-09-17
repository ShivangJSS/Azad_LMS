"""
Resolves a stored media path to a real file, safely.
"""

from pathlib import Path
from typing import Optional

from fastapi import HTTPException, status

from app.modules.mobile.media.constants import (
    CONTENT_TYPES,
    DEFAULT_CONTENT_TYPE,
    SEARCH_ROOTS,
)


class MediaService:

    @staticmethod
    def resolve(requested: str) -> Path:
        """
        Turn a stored path into an absolute file inside one of the roots.

        Every candidate is resolved and then checked to be *under* its root,
        so "../.." style input cannot escape into the rest of the disk.
        """

        cleaned = requested.replace("\\", "/").strip().lstrip("/")

        if not cleaned:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found.",
            )

        for root in SEARCH_ROOTS:
            found = MediaService._try_root(root, cleaned)

            if found is not None:
                return found

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found.",
        )

    @staticmethod
    def _try_root(root: Path, cleaned: str) -> Optional[Path]:
        if not root.exists():
            return None

        candidates = [cleaned]

        # Some columns keep the "app/" prefix and some do not, so both
        # spellings are tried against each root.
        if cleaned.startswith("app/"):
            candidates.append(cleaned[4:])
        else:
            candidates.append(f"app/{cleaned}")

        for candidate in candidates:
            try:
                path = (root / candidate).resolve()
            except (OSError, ValueError):
                continue

            if not MediaService._is_inside(path, root):
                continue

            if path.is_file():
                return path

        return None

    @staticmethod
    def _is_inside(path: Path, root: Path) -> bool:
        try:
            path.relative_to(root)
            return True
        except ValueError:
            return False

    @staticmethod
    def content_type(path: Path) -> str:
        return CONTENT_TYPES.get(path.suffix.lower(), DEFAULT_CONTENT_TYPE)

    @staticmethod
    def parse_range(
        range_header: Optional[str],
        file_size: int,
    ) -> Optional[tuple[int, int]]:
        """
        Parse a single "bytes=start-end" range. Returns None when the header
        is absent or not something we serve, in which case the whole file is
        sent instead.
        """

        if not range_header or not range_header.startswith("bytes="):
            return None

        spec = range_header[len("bytes="):].split(",")[0].strip()

        if "-" not in spec:
            return None

        start_text, _, end_text = spec.partition("-")

        try:
            if not start_text:
                # "bytes=-500" means the final 500 bytes.
                length = int(end_text)

                if length <= 0:
                    return None

                start = max(0, file_size - length)
                end = file_size - 1
            else:
                start = int(start_text)
                end = int(end_text) if end_text else file_size - 1
        except ValueError:
            return None

        if start >= file_size or start < 0:
            raise HTTPException(
                status_code=status.HTTP_416_REQUESTED_RANGE_NOT_SATISFIABLE,
                detail="Requested range not satisfiable.",
                headers={"Content-Range": f"bytes */{file_size}"},
            )

        end = min(end, file_size - 1)

        if end < start:
            return None

        return start, end
