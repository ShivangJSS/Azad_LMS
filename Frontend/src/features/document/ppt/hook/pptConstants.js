/* =========================================================
   PPT feature constants
========================================================= */

export const PER_PAGE = 10;

export const ENTRIES_OPTIONS = [10, 25, 50, 100];

/* Columns consumed by the shared <DataTable /> on the PPT list. */
export const PPT_COLUMNS = [
    { key: "sr", title: "Sr No", className: "text-center", sortable: true, sortKey: "ppt_id" },
    { key: "ppt_name", title: "PPT Name", sortable: true, sortKey: "ppt_name" },
    { key: "ppt_description", title: "PPT Description", sortable: true, sortKey: "ppt_description" },
    { key: "ppt_url", title: "PPT URL", className: "text-center", sortable: true, sortKey: "ppt_url" },
    { key: "cloud_url", title: "Cloud URL", className: "text-center", sortable: true, sortKey: "cloud_url" },
    { key: "language", title: "Language", className: "text-center", sortable: true, sortKey: "language_name" },
    { key: "status", title: "Status", className: "text-center", sortable: true, sortKey: "status" },
    { key: "action", title: "Action" },
];

/* Columns for the archived-versions table. */
export const ARCHIVED_COLUMNS = [
    { key: "sr", title: "Sr No", className: "text-center" },
    { key: "ppt_name", title: "PPT Name" },
    { key: "ppt_description", title: "PPT Description" },
    { key: "ppt_url", title: "PPT URL", className: "text-center" },
    { key: "cloud_url", title: "Cloud URL", className: "text-center" },
    { key: "language", title: "Language", className: "text-center" },
    { key: "created_at", title: "Created Date", className: "text-center" },
];

const MEDIA_URL = import.meta.env.VITE_API_URL;

/** Prefix a stored relative media path with the API host.
 *
 * Handles both backend storage formats:
 *   - a full path like "/uploads/ppt_masters/x.pptx" (from save_upload)
 *   - a bare filename like "x.pptx" (legacy save_file) which lives under
 *     /uploads/ppts/.
 * Leading slashes are stripped so the API host is never joined with a
 * double slash (which would 404 as {"detail":"Not Found"}).
 */
export const toMediaUrl = (path) => {
    if (!path || typeof path !== "string") return "";
    if (/^https?:\/\//i.test(path)) return path;

    let clean = path.replace(/^\/+/, "").replace(/^app\//, "");

    // Bare filename with no folder → it was saved under /uploads/ppts.
    if (!clean.includes("/")) {
        clean = `uploads/ppts/${clean}`;
    }

    return `${MEDIA_URL}/${clean}`;
};
