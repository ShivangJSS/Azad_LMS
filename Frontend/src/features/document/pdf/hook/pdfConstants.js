/* =========================================================
   PDF feature constants
========================================================= */

export const PER_PAGE = 10;

export const ENTRIES_OPTIONS = [10, 25, 50, 100];

/* Columns consumed by the shared <DataTable /> on the PDF list. */
export const PDF_COLUMNS = [
    { key: "sr", title: "Sr No", className: "text-center", sortable: true, sortKey: "pdf_id" },
    { key: "pdf_name", title: "Pdf Name", sortable: true, sortKey: "pdf_name" },
    { key: "pdf_description", title: "Pdf Description", sortable: true, sortKey: "pdf_description" },
    { key: "pdf_url", title: "Pdf URL", className: "text-center", sortable: true, sortKey: "pdf_url" },
    { key: "cloud_url", title: "Cloud URL", className: "text-center", sortable: true, sortKey: "cloud_url" },
    { key: "language", title: "Language", className: "text-center", sortable: true, sortKey: "language_name" },
    { key: "status", title: "Status", className: "text-center", sortable: true, sortKey: "status" },
    { key: "action", title: "Action" },
];

/* Columns for the archived-versions table. */
export const ARCHIVED_COLUMNS = [
    { key: "sr", title: "Sr No", className: "text-center" },
    { key: "pdf_name", title: "Pdf Name" },
    { key: "pdf_description", title: "Pdf Description" },
    { key: "pdf_url", title: "Pdf URL", className: "text-center" },
    { key: "cloud_url", title: "Cloud URL", className: "text-center" },
    { key: "language", title: "Language", className: "text-center" },
    { key: "created_at", title: "Created Date", className: "text-center" },
];

const MEDIA_URL = import.meta.env.VITE_API_URL;

/** Prefix a stored relative media path with the API host.
 *
 * Handles both backend storage formats:
 *   - a full path like "/uploads/pdf_masters/x.pdf" (from save_upload)
 *   - a bare filename like "x.pdf" (legacy save_file) which lives under
 *     /uploads/pdfs/.
 * Leading slashes are stripped so the API host is never joined with a
 * double slash (which would 404 as {"detail":"Not Found"}).
 */
export const toMediaUrl = (path) => {
    if (!path || typeof path !== "string") return "";
    if (/^https?:\/\//i.test(path)) return path;

    let clean = path.replace(/^\/+/, "").replace(/^app\//, "");

    // Bare filename with no folder → it was saved under /uploads/pdfs.
    if (!clean.includes("/")) {
        clean = `uploads/pdfs/${clean}`;
    }

    return `${MEDIA_URL}/${clean}`;
};
