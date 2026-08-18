import API from "../../../../api/Api";

export const getTopics = async (params) => {
    try {
        const response = await API.get('/topics', { params });
        return response.data;
    } catch (error) {

        console.error('Error fetching topics:', error);
        throw error;
    }
};

export const getTopicById = async (topicId) => {
    try {
        const response = await API.get(`/topics/${topicId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching topic by ID:', error);
        throw error;
    }
};

export const createTopic = async (topicData) => {
    try {
        const response = await API.post('/topics', topicData);
        return response.data;
    } catch (error) {
        console.error('Error creating topic:', error);
        throw error;
    }
};

export const updateTopic = async (topicId, topicData) => {
    try {

        const response = await API.put(`/topics/${topicId}`, topicData);
        return response.data;
    } catch (error) {
        console.error('Error updating topic:', error);
        throw error;
    }
};

export const deleteTopic = async (topicId) => {
    try {
        const response = await API.delete(`/topics/${topicId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting topic:', error);
        throw error;
    }
};


// =============================
// Topic Translation
// =============================

export const getTopicTranslation = async (topicId, languageId) => {
    try {
        const response = await API.get(
            `/topics/${topicId}/translation/${languageId}`
        );

        return response.data;
    } catch (error) {
        console.error("Error fetching topic translation:", error);
        throw error;
    }
};

export const saveTopicTranslation = async (topicId, payload) => {
    try {
        const response = await API.post(
            `/topics/${topicId}/translation`,
            payload
        );

        return response.data;
    } catch (error) {
        console.error("Error saving topic translation:", error);
        throw error;
    }
};