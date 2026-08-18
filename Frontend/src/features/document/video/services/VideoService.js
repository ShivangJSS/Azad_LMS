import API from "../../../../api/Api";

/* =========================================================
   VIDEO SERVICE

   Talks to the backend VIDEO module (app/modules/video),
   registered at the "/video-masters" prefix.
========================================================= */

/** GET /video-masters?search=&page=&limit= */
export const getVideos = async (params = {}) => {
    try {
        const response = await API.get("/video-masters", { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching videos:", error?.response?.data ?? error);
        throw error;
    }
};

/** POST /video-masters (multipart: optional media_file + fields) */
export const createVideo = async (formData) => {
    try {
        const response = await API.post("/video-masters", formData, {
            headers: { "Content-Type": undefined },
        });
        return response.data;
    } catch (error) {
        console.error("Error creating video:", error?.response?.data ?? error);
        throw error;
    }
};

/** GET /video-masters/{video_id} */
export const getVideo = async (videoId) => {
    try {
        const response = await API.get(`/video-masters/${videoId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching video:", error?.response?.data ?? error);
        throw error;
    }
};

/** PUT /video-masters/{video_id} */
export const updateVideo = async (videoId, formData) => {
    try {
        // formData is a multipart FormData (optional media_file + fields).
        const response = await API.put(`/video-masters/${videoId}`, formData, {
            headers: { "Content-Type": undefined },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating video:", error?.response?.data ?? error);
        throw error;
    }
};

/** DELETE /video-masters/{video_id} (soft delete) */
export const deleteVideo = async (videoId) => {
    try {
        const response = await API.delete(`/video-masters/${videoId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting video:", error?.response?.data ?? error);
        throw error;
    }
};

/** GET /video-masters/{video_id}/archived-versions */
export const getArchivedVersions = async (videoId) => {
    try {
        const response = await API.get(
            `/video-masters/${videoId}/archived-versions`
        );
        return response.data;
    } catch (error) {
        console.error(
            "Error fetching archived versions:",
            error?.response?.data ?? error
        );
        throw error;
    }
};

/**
 * GET /video-masters/export/csv
 * Shaped to plug into the shared <ExportButton exportFunction={exportVideos} />
 * (returns a Blob).
 */
export const exportVideos = async (params = {}) => {
    try {
        const response = await API.get("/video-masters/export/csv", {
            params,
            responseType: "blob",
        });
        return response.data;
    } catch (error) {
        console.error("Error exporting videos:", error?.response?.data ?? error);
        throw error;
    }
};
