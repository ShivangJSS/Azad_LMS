// Allow-list mirrors the backend's IMAGE_EXTENSIONS
// (Backend/app/utils/file_upload.py) so a bad file is rejected in the
// browser instead of round-tripping to the server first.
export const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

export const IMAGE_MIME_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
];

export const IMAGE_TYPE_ERROR =
    "Unsupported file type. Please upload a JPG, PNG, WEBP or GIF image.";

// Extension-based check (the source of truth on the backend) with an
// additional MIME-type check when the browser reports one. A file picked
// through an `accept="image/*"` input can still be any file type via
// drag-and-drop or a renamed extension, so this must be checked explicitly
// rather than relying on the `accept` attribute alone.
export const isValidImageFile = (file) => {
    if (!file || !file.name) return false;

    const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;

    if (!IMAGE_EXTENSIONS.includes(extension)) {
        return false;
    }

    if (file.type && !IMAGE_MIME_TYPES.includes(file.type)) {
        return false;
    }

    return true;
};

// ---------------------------------------------------------------------------
// Size + aspect-ratio validation
// ---------------------------------------------------------------------------

// Client-side cap; the backend enforces its own hard limit as well.
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const IMAGE_SIZE_ERROR = "Image is too large. Maximum size is 5 MB.";

export const isValidImageSize = (file, maxBytes = MAX_IMAGE_BYTES) =>
    Boolean(file) && file.size <= maxBytes;

// Common aspect ratios. `label` is used in error messages.
export const ASPECT_SQUARE = { w: 1, h: 1, label: "1:1" };
export const ASPECT_WIDE = { w: 16, h: 9, label: "16:9" };

// Read a file's pixel dimensions without adding it to the DOM.
export const getImageDimensions = (file) =>
    new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error("Could not read image."));
        };
        img.src = url;
    });

// A small tolerance absorbs off-by-one rounding (e.g. 1920x1081).
export const matchesAspectRatio = (width, height, ratio, tolerance = 0.02) => {
    if (!width || !height) return false;
    const expected = ratio.w / ratio.h;
    return Math.abs(width / height - expected) <= expected * tolerance;
};

/**
 * Full async validation for an image upload: file type, size, and (when
 * given) required aspect ratio. Returns { ok: true } or { ok: false, error }.
 * Pass `aspectRatio` as ASPECT_SQUARE (1:1) or ASPECT_WIDE (16:9).
 */
export const validateImage = async (file, { aspectRatio = null } = {}) => {
    if (!file) return { ok: true };

    if (!isValidImageFile(file)) {
        return { ok: false, error: IMAGE_TYPE_ERROR };
    }

    if (!isValidImageSize(file)) {
        return { ok: false, error: IMAGE_SIZE_ERROR };
    }

    if (aspectRatio) {
        try {
            const { width, height } = await getImageDimensions(file);
            if (!matchesAspectRatio(width, height, aspectRatio)) {
                return {
                    ok: false,
                    error: `Image must have a ${aspectRatio.label} aspect ratio (uploaded ${width}×${height}).`,
                };
            }
        } catch {
            return { ok: false, error: "Could not read the image dimensions." };
        }
    }

    return { ok: true };
};
