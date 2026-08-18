/* =========================================================
   VIDEO feature constants
========================================================= */

export const PER_PAGE = 10;

export const ENTRIES_OPTIONS = [10, 25, 50, 100];

/* Columns consumed by the shared <DataTable /> on the VIDEO list. */
export const VIDEO_COLUMNS = [
    { key: "sr", title: "Sr No", className: "text-center", sortable: true, sortKey: "video_id" },
    { key: "video_name", title: "Video Name", sortable: true, sortKey: "video_name" },
    { key: "video_description", title: "Description", sortable: true, sortKey: "video_description" },
    { key: "video_url", title: "Video URL", className: "text-center", sortable: true, sortKey: "video_url" },
    { key: "youtube_url", title: "YouTube URL", className: "text-center", sortable: true, sortKey: "youtube_url" },
    { key: "language", title: "Language", className: "text-center", sortable: true, sortKey: "language_name" },
    { key: "status", title: "Status", className: "text-center", sortable: true, sortKey: "status" },
    { key: "action", title: "Action" },
];

/* Columns for the archived-versions table. */
export const ARCHIVED_COLUMNS = [
    { key: "sr", title: "Sr No", className: "text-center" },
    { key: "video_name", title: "Video Name" },
    { key: "video_description", title: "Description" },
    { key: "video_url", title: "Video URL", className: "text-center" },
    { key: "youtube_url", title: "YouTube URL", className: "text-center" },
    { key: "language", title: "Language", className: "text-center" },
    { key: "created_at", title: "Created Date", className: "text-center" },
];

const MEDIA_URL = import.meta.env.VITE_API_URL;

/** Prefix a stored relative media path with the API host.
 *
 * Handles both backend storage formats:
 *   - a full path like "/uploads/video_masters/x.mp4" (from save_upload)
 *   - a bare filename like "x.mp4" (legacy save_file) which lives under
 *     /uploads/videos/.
 * Leading slashes are stripped so the API host is never joined with a
 * double slash (which would 404 as {"detail":"Not Found"}).
 */
export const toMediaUrl = (path) => {
    if (!path || typeof path !== "string") return "";
    if (/^https?:\/\//i.test(path)) return path;

    let clean = path.replace(/^\/+/, "").replace(/^app\//, "");

    // Bare filename with no folder → it was saved under /uploads/videos.
    if (!clean.includes("/")) {
        clean = `uploads/videos/${clean}`;
    }

    return `${MEDIA_URL}/${clean}`;
};
