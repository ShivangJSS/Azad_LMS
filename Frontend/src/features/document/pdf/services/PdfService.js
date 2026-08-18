import API from "../../../../api/Api";

/* =========================================================
   PDF SERVICE

   Talks to the backend PDF module (app/modules/pdf),
   registered at the "/pdf-masters" prefix.
========================================================= */

/** GET /pdf-masters?search=&page=&limit= */
export const getPdfs = async (params = {}) => {
    try {
        const response = await API.get("/pdf-masters", { params });
        return response.data;
    } catch (error) {
        console.error("Error fetching pdfs:", error?.response?.data ?? error);
        throw error;
    }
};

/** POST /pdf-masters (multipart: optional media_file + fields) */
export const createPdf = async (formData) => {
    try {
        const response = await API.post("/pdf-masters", formData, {
            headers: { "Content-Type": undefined },
        });
        return response.data;
    } catch (error) {
        console.error("Error creating pdf:", error?.response?.data ?? error);
        throw error;
    }
};

/** GET /pdf-masters/{pdf_id} */
export const getPdf = async (pdfId) => {
    try {
        const response = await API.get(`/pdf-masters/${pdfId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching pdf:", error?.response?.data ?? error);
        throw error;
    }
};

/** PUT /pdf-masters/{pdf_id} */
export const updatePdf = async (pdfId, formData) => {
    try {
        // formData is a multipart FormData (optional media_file + fields).
        const response = await API.put(`/pdf-masters/${pdfId}`, formData, {
            headers: { "Content-Type": undefined },
        });
        return response.data;
    } catch (error) {
        console.error("Error updating pdf:", error?.response?.data ?? error);
        throw error;
    }
};

/** DELETE /pdf-masters/{pdf_id} (soft delete) */
export const deletePdf = async (pdfId) => {
    try {
        const response = await API.delete(`/pdf-masters/${pdfId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting pdf:", error?.response?.data ?? error);
        throw error;
    }
};

/** GET /pdf-masters/{pdf_id}/archived-versions */
export const getArchivedVersions = async (pdfId) => {
    try {
        const response = await API.get(
            `/pdf-masters/${pdfId}/archived-versions`
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
 * GET /pdf-masters/export/csv
 * Shaped to plug into the shared <ExportButton exportFunction={exportPdfs} />
 * (returns a Blob).
 */
export const exportPdfs = async (params = {}) => {
    try {
        const response = await API.get("/pdf-masters/export/csv", {
            params,
            responseType: "blob",
        });
        return response.data;
    } catch (error) {
        console.error("Error exporting pdfs:", error?.response?.data ?? error);
        throw error;
    }
};
