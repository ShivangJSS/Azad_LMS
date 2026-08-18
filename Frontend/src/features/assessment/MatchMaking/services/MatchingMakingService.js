import API from "../../../../api/API";

// ======================================================
// IMAGE UPLOAD
// Uploads the actual file and returns the permanent backend
// URL (e.g. "/uploads/assessment_images/<file>"). Never a blob.
// ======================================================

export const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await API.post(
        "/assessment/upload-image",
        formData
    );

    return response.data?.image_url || "";
};

// ======================================================
// MATCH MAKING
// ======================================================

export const getMatchMakings = async (params = {}) => {
    const response = await API.get("/match-making/", {
        params,
    });

    return response.data;
};

export const getMatchMakingById = async (
    parentId,
    languageId
) => {
    const response = await API.get(
        `/match-making/${parentId}`,
        {
            params: {
                language_id: languageId,
            },
        }
    );

    return response.data;
};

export const createMatchMaking = async (data) => {
    const response = await API.post(
        "/match-making/",
        data
    );

    return response.data;
};

export const updateMatchMaking = async (
    matchMakingId,
    data
) => {
    const response = await API.put(
        `/match-making/${matchMakingId}`,
        data
    );

    return response.data;
};

export const deleteMatchMaking = async (
    matchMakingId
) => {
    const response = await API.delete(
        `/match-making/${matchMakingId}`
    );

    return response.data;
};

// ======================================================
// LEFT ITEMS
// ======================================================

export const getLeftItems = async (
    matchMakingId,
    languageId
) => {
    const response = await API.get(
        `/match-making/${matchMakingId}/left-items`,
        {
            params: {
                language_id: languageId,
            },
        }
    );

    return response.data;
};

export const createLeftItem = async (
    matchMakingId,
    data
) => {

    const response = await API.post(
        `/match-making/${matchMakingId}/left-items`,
        data
    );

    return response.data;
};

export const getLeftItemById = async (
    matchLeftId
) => {
    const response = await API.get(
        `/match-making/left-items/${matchLeftId}`
    );

    return response.data;
};

export const updateLeftItem = async (
    matchLeftId,
    data
) => {
    const response = await API.put(
        `/match-making/left-items/${matchLeftId}`,
        data
    );

    return response.data;
};

export const deleteLeftItem = async (
    matchLeftId
) => {
    const response = await API.delete(
        `/match-making/left-items/${matchLeftId}`
    );

    return response.data;
};

// ======================================================
// RIGHT ITEMS
// ======================================================

export const getRightItems = async (
    matchMakingId,
    languageId
) => {
    const response = await API.get(
        `/match-making/${matchMakingId}/right-items`,
        {
            params: {
                language_id: languageId,
            },
        }
    );

    return response.data;
};

export const createRightItem = async (
    matchMakingId,
    data
) => {

    const response = await API.post(
        `/match-making/${matchMakingId}/right-items`,
        data
    );

    return response.data;
};

export const getRightItemById = async (
    matchRightId
) => {
    const response = await API.get(
        `/match-making/right-items/${matchRightId}`
    );

    return response.data;
};

export const updateRightItem = async (
    matchRightId,
    data
) => {
    const response = await API.put(
        `/match-making/right-items/${matchRightId}`,
        data
    );

    return response.data;
};

export const deleteRightItem = async (
    matchRightId
) => {
    const response = await API.delete(
        `/match-making/right-items/${matchRightId}`
    );

    return response.data;
};
// ======================================================
// CORRECT ANSWERS
// ======================================================

export const getCorrectAnswers = async (
    matchMakingId
) => {
    const response = await API.get(
        `/match-making/${matchMakingId}/correct-answers`
    );


    return response.data;
};

export const createCorrectAnswer = async (
    matchMakingId,
    data
) => {

    const response = await API.post(
        `/match-making/${matchMakingId}/correct-answers`,
        data
    );

    return response.data;
};

export const getCorrectAnswerById = async (
    correctAnswerId
) => {
    const response = await API.get(
        `/match-making/correct-answers/${correctAnswerId}`
    );

    return response.data;
};

export const updateCorrectAnswer = async (
    correctAnswerId,
    data
) => {
    const response = await API.put(
        `/match-making/correct-answers/${correctAnswerId}`,
        data
    );

    return response.data;
};

export const deleteCorrectAnswer = async (
    correctAnswerId
) => {
    const response = await API.delete(
        `/match-making/correct-answers/${correctAnswerId}`
    );

    return response.data;
};