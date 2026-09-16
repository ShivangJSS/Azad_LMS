import API from "@/api/Api";

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

export const getTopicCountByModule = async (moduleId, languageId) => {
    const response = await API.get("/topics", {
        params: {
            module_id: moduleId,
            language_id: languageId,
            page: 1,
            limit: 1,
        },
    });

    const data = response.data?.data ?? response.data;
    return data?.pagination?.total_records ?? data?.pagination?.total ?? 0;
};

export const getTopicCountsByModule = async (languageId = 1) => {
    const counts = {};
    let page = 1;
    let totalPages = 1;

    do {
        const response = await getTopics({
            language_id: languageId,
            page,
            limit: 100,
        });

        const payload = response?.data ?? response;

        const topics = Array.isArray(payload?.topics)
            ? payload.topics
            : [];

        topics.forEach((topic) => {
            const moduleIds = [
                topic.module_id,
                topic.fk_module_id,
                topic.parent_module_id,
                topic.base_module_id,
            ]
                .filter((id) => id != null)
                .map(String);

            [...new Set(moduleIds)].forEach((key) => {
                counts[key] = (counts[key] || 0) + 1;
            });

            if (topic.module_name) {
                const nameKey = `name:${String(topic.module_name).trim().toLowerCase()}`;
                counts[nameKey] = (counts[nameKey] || 0) + 1;
            }
        });

        totalPages = payload?.pagination?.total_pages ?? page;
        page += 1;
    } while (page <= totalPages);

    return counts;
};