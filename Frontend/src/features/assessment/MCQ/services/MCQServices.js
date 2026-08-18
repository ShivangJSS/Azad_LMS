import API from "../../../../api/Api";

/* ===========================
   IMAGE UPLOAD
   Uploads the actual file and returns the permanent backend URL
   (e.g. "/uploads/assessment_images/<file>"). Never a blob URL.
=========================== */

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await API.post(
        "/assessment/upload-image",
        formData
    );

    return response.data?.image_url || "";
};


/* ===========================
   MCQ LIST
=========================== */

export const getMCQs = async (params = {}) => {
    const response = await API.get("/mcqs", {
        params,
    });

    return response.data;
};


/* ===========================
   GET SINGLE MCQ / TRANSLATION
=========================== */

export const getMCQById = async (parentId, languageId = 1) => {
    const response = await API.get(`/mcqs/${parentId}`, {
        params: {
            language_id: languageId,
        },
    });

    return response.data;
};


/* ===========================
   SAVE TRANSLATION
=========================== */

export const saveMCQTranslation = async (parentId, payload) => {
    const response = await API.put(
        `/mcqs/${parentId}/translation`,
        payload
    );

    return response.data;
};


export const getMCQTranslation = async (parentId, languageId) => {
    const response = await API.get(`/mcqs/${parentId}`, {
        params: {
            language_id: languageId,
        },
    });

    return response.data;
};

/* ===========================
   CREATE
=========================== */

export const createMCQ = async (payload) => {
    const response = await API.post("/mcqs/", payload);

    return response.data;
};
/* ===========================
   DELETE
=========================== */

export const deleteMCQ = async (mcqId) => {
    const response = await API.delete(`/mcqs/${mcqId}`);

    return response.data;
};

export const updateMCQ = async (mcqId, payload) => {
    const response = await API.put(`/mcqs/${mcqId}`, payload, {
        headers: {
            "Content-Type": "application/json",
        },
    });
    return response.data;
};

/* ===========================
   EXPORT
=========================== */

export const exportMCQs = async (languageId) => {
    const response = await API.get("/mcqs/export", {
        params: {
            language_id: languageId,
        },
        responseType: "blob",
    });

    return response.data;
};