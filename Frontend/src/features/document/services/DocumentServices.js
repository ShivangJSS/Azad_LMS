import API from "../../../api/Api";

export const getAllDocuments = async (params = {}) => {
    const response = await API.get("/documents", { params });
    return response.data;
};

export const getDocument = async (docId) => {
    const response = await API.get(`/documents/${docId}`);
    return response.data;
};

export const getLanguages = async () => {
    const response = await API.get("/documents/languages");
    return response.data.map(({ language_id, language_name }) => ({
        id: String(language_id),
        name: language_name,
    }));
};

export const getDocumentTypes = async () => [
    { id: "PDF", name: "PDF" },
    { id: "PPT", name: "PPT" },
    { id: "Video", name: "Video" },
];

export const getDocumentCategories = async (languageId) => {
    const response = await API.get("/documents/categories", {
        params: languageId ? { language_id: languageId } : {},
    });
    return response.data;
};

export const createDocument = async (payload) => {
    const response = await API.post("/documents", payload, {
        headers: { "Content-Type": undefined },
    });
    return response.data;
};

export const updateDocument = async (docId, payload) => {
    const response = await API.put(`/documents/${docId}`, payload, {
        headers: { "Content-Type": undefined },
    });
    return response.data;
};

export const deleteDocument = async (docId) => {
    const response = await API.delete(`/documents/${docId}`);
    return response.data;
};

export const exportDocuments = async (params = {}) => {
    const response = await API.get("/documents/export/csv", {
        params,
        responseType: "blob",
    });
    return response.data;
};
// =========================================
// Translation APIs
// =========================================

export const getTranslationForm = async (documentId) => {
    const response = await API.get(
        `/documents/${documentId}/translation/form`
    );

    return response.data;
};

export const getTranslation = async (documentId, languageId) => {
    const response = await API.get(
        `/documents/${documentId}/translation/${languageId}`
    );

    return response.data;
};

export const saveTranslation = async (documentId, payload) => {
    const response = await API.post(
        `/documents/${documentId}/translation/save`,
        payload,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};