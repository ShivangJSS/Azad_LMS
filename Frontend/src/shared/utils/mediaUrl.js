import { BASE_URL } from "@/api/Api.js";

const ABSOLUTE_URL_REGEX = /^(blob:|data:|https?:\/\/)/i;

const cleanPath = (path) =>
    path
        .trim()
        .replace(/^app\//i, "")
        .replace(/^\/+/, "");

export const getMediaUrl = (path) => {
    if (!path || typeof path !== "string") return "";

    if (ABSOLUTE_URL_REGEX.test(path)) {
        return path;
    }

    return `${BASE_URL}/${cleanPath(path)}`;
};

// export const getParticipantImageUrl = (pathOrUrl) => {
//     if (!pathOrUrl || typeof pathOrUrl !== "string") return "";

//     if (ABSOLUTE_URL_REGEX.test(pathOrUrl)) {
//         return pathOrUrl;
//     }

//     let clean = cleanPath(pathOrUrl);

//     if (!clean.includes("/")) {
//         clean = `uploads/participants/${clean}`;
//     }

//     return `${BASE_URL}/${clean}`;
// };


export const getParticipantImageUrl = (pathOrUrl) => {
    if (!pathOrUrl || typeof pathOrUrl !== "string") return "";

    const clean = pathOrUrl
        .trim()
        .replace(/^app\//i, "")
        .replace(/^\/+/, "");

    if (/^https?:\/\//i.test(clean)) {
        return clean;
    }

    return `${BASE_URL}/uploads/participants/${clean}`;
};

export const getModuleIconUrl = (pathOrUrl) => {
    if (!pathOrUrl || typeof pathOrUrl !== "string") return "";

    if (ABSOLUTE_URL_REGEX.test(pathOrUrl)) {
        return pathOrUrl;
    }

    let clean = cleanPath(pathOrUrl);

    if (!clean.includes("/")) {
        clean = `uploads/module_icons/${clean}`;
    }

    return `${BASE_URL}/${clean}`;
};

export const isPubliclyReachableUrl = (pathOrUrl) => {
    const url = getMediaUrl(pathOrUrl);

    if (!url || !isValidUrl(url)) {
        return false;
    }

    try {
        const { hostname } = new URL(url);

        if (!hostname) return false;

        const host = hostname.toLowerCase();

        if (
            host === "localhost" ||
            host === "127.0.0.1" ||
            host === "0.0.0.0" ||
            host === "::1"
        ) {
            return false;
        }

        if (host.endsWith(".local")) return false;

        if (/^10\./.test(host)) return false;

        if (/^192\.168\./.test(host)) return false;

        if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
};

const isValidUrl = (value) => {
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
};

export const getOfficeViewerUrl = (pathOrUrl) => {
    const url = getMediaUrl(pathOrUrl);

    if (!url || !isPubliclyReachableUrl(url)) {
        return "";
    }

    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
        url
    )}`;
};

export default getMediaUrl;
