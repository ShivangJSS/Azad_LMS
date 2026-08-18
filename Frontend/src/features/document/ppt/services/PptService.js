import API from "../../../../api/Api";

/* =========================================================
   PPT SERVICE

   Talks to the backend PPT module (app/modules/ppt),
   registered at the "/ppt-masters" prefix.
========================================================= */

/** GET /ppt-masters?search=&page=&limit= */
export const getPpts = async (params = {}) => {
    try {
        const response = await API.get("/ppt-masters", { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching ppts:", error?.response?.data ?? error);
        throw error;
    }
};

/** POST /ppt-masters (multipart: optional media_file + fields) */
export const createPpt = async (formData) => {
    try {
        const response = await API.post("/ppt-masters", formData, {
            headers: { "Content-Type": undefined },
        });
        return response.data;
    } catch (error) {
        console.error("Error creating ppt:", error?.response?.data ?? error);
        throw error;
    }
};

/** GET /ppt-masters/{ppt_id} */
export const getPpt = async (pptId) => {
    try {
        const response = await API.get(`/ppt-masters/${pptId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching ppt:", error?.response?.data ?? error);
        throw error;
    }
};

/** PUT /ppt-masters/{ppt_id} */
export const updatePpt = async (pptId, formData) => {
    try {
        // formData is a multipart FormData (optional media_file + fields).
        const response = await API.put(`/ppt-masters/${pptId}`, formData, {
            headers: { "Content-Type": undefined },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating ppt:", error?.response?.data ?? error);
        throw error;
    }
};

/** DELETE /ppt-masters/{ppt_id} (soft delete) */
export const deletePpt = async (pptId) => {
    try {
        const response = await API.delete(`/ppt-masters/${pptId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting ppt:", error?.response?.data ?? error);
        throw error;
    }
};

/** GET /ppt-masters/{ppt_id}/archived-versions */
export const getArchivedVersions = async (pptId) => {
    try {
        const response = await API.get(
            `/ppt-masters/${pptId}/archived-versions`
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
 * GET /ppt-masters/export/csv
 * Shaped to plug into the shared <ExportButton exportFunction={exportPpts} />
 * (returns a Blob).
 */
export const exportPpts = async (params = {}) => {
    try {
        const response = await API.get("/ppt-masters/export/csv", {
            params,
            responseType: "blob",
        });
        return response.data;
    } catch (error) {
        console.error("Error exporting ppts:", error?.response?.data ?? error);
        throw error;
    }
};
