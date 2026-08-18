// Single source of truth for building URLs to uploaded media (images, PPT,
// video, PDF) stored in the DB. Handles absolute URLs, blob/data previews,
// the legacy "app/" prefix, and leading slashes so the same stored path
// resolves consistently everywhere (lists, views, forms).

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const getMediaUrl = (path) => {
    if (!path || typeof path !== "string") return "";

    // Already a usable URL / in-browser preview — use as-is.
    if (/^(blob:|data:|https?:\/\/)/i.test(path)) return path;

    // Normalise a stored path: drop a legacy "app/" prefix and any leading
    // slashes, then prefix the API base (which serves /uploads).
    const clean = path.replace(/^app\//, "").replace(/^\/+/, "");
    return `${BASE_URL}/${clean}`;
};

// Participant photos are saved by the backend (save_image) as a BARE filename
// that physically lives under uploads/participants/. A plain getMediaUrl would
// build `<host>/<filename>` which 404s. Map a bare filename to its folder;
// pass through anything that already has a path, or is an absolute/blob URL.
export const getParticipantImageUrl = (pathOrUrl) => {
    if (!pathOrUrl || typeof pathOrUrl !== "string") return "";
    if (/^(blob:|data:|https?:\/\/)/i.test(pathOrUrl)) return pathOrUrl;

    let clean = pathOrUrl.replace(/^app\//, "").replace(/^\/+/, "");
    if (!clean.includes("/")) {
        clean = `uploads/participants/${clean}`;
    }
    return `${BASE_URL}/${clean}`;
};

// Module icons are saved (like participant photos) as a BARE filename that
// lives under uploads/module_icons/. Map a bare filename to that folder;
// pass through paths / absolute / blob URLs untouched.
export const getModuleIconUrl = (pathOrUrl) => {
    if (!pathOrUrl || typeof pathOrUrl !== "string") return "";
    if (/^(blob:|data:|https?:\/\/)/i.test(pathOrUrl)) return pathOrUrl;

    let clean = pathOrUrl.replace(/^app\//, "").replace(/^\/+/, "");
    if (!clean.includes("/")) {
        clean = `uploads/module_icons/${clean}`;
    }
    return `${BASE_URL}/${clean}`;
};

// True when a URL points at a public host the Microsoft Office service can
// actually reach. localhost / 127.x / private LAN ranges are NOT reachable
// from Microsoft's servers, so the Office viewer would only show an error
// there — callers should fall back to a download link in that case.
export const isPubliclyReachableUrl = (pathOrUrl) => {
    const url = getMediaUrl(pathOrUrl);
    if (!url) return false;
    try {
        const { hostname } = new URL(url, BASE_URL);
        if (!hostname) return false;
        if (
            hostname === "localhost" ||
            hostname === "127.0.0.1" ||
            hostname === "0.0.0.0" ||
            hostname === "::1"
        )
            return false;
        if (/\.local$/i.test(hostname)) return false;
        // Private LAN ranges (RFC 1918).
        if (/^10\./.test(hostname)) return false;
        if (/^192\.168\./.test(hostname)) return false;
        if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return false;
        return true;
    } catch {
        return false;
    }
};

// Build a Microsoft Office Online embed URL so PowerPoint / Word / Excel
// files render inline in an <iframe> instead of forcing a download. The
// source must be a publicly reachable http(s) URL — the Office service
// fetches it server-side. Returns "" for localhost / private hosts (where
// the viewer can't work) so callers can show a download fallback instead of
// a broken "An error occurred" frame.
export const getOfficeViewerUrl = (pathOrUrl) => {
    const url = getMediaUrl(pathOrUrl);
    if (!url) return "";
    if (!isPubliclyReachableUrl(url)) return "";
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        url
    )}`;
};

export default getMediaUrl;
