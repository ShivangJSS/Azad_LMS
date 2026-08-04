import API from '../../../api/Api';

// ==========================================================
// Participants
// ==========================================================

export const getParticipants = async (params) => {
    try {
        const response = await API.get('/participants', { params });
        return response.data;
    } catch (error) {
        console.error('Error fetching participants:', error);
        throw error;
    }
};

export const createParticipant = async (formData) => {
    try {
        const response = await API.post('/participants/', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        console.error('Error creating participant:', error);
        throw error;
    }
};

// ==========================================================
// Filter / form dropdown data
// ==========================================================

export const getStates = async () => {
    try {
        const response = await API.get('/participants/states');
        return response.data;
    } catch (error) {
        console.error('Error fetching states:', error);
        throw error;
    }
};

export const getDistricts = async (stateLgdCode) => {
    try {
        const response = await API.get(`/participants/districts/${stateLgdCode}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching districts:', error);
        throw error;
    }
};

export const getBlocks = async (districtLgdCode) => {
    try {
        const response = await API.get(`/participants/blocks/${districtLgdCode}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching blocks:', error);
        throw error;
    }
};

export const getCentres = async (blockId) => {
    try {
        const response = await API.get(`/participants/centres/${blockId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching centres:', error);
        throw error;
    }
};

export const getAllCentres = async () => {
    try {
        const response = await API.get('/participants/participants/all-centres');
        return response.data;
    } catch (error) {
        console.error('Error fetching centres:', error);
        throw error;
    }
};

export const getBatches = async (centreId) => {
    try {
        const response = await API.get('/participants/participants/batches', {
            params: centreId ? { centre_id: centreId } : {},
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching batches:', error);
        throw error;
    }
};

export const getEnrollment = async (batchId) => {
    try {
        const response = await API.get(`/participants/enrollment/${batchId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching enrollment:', error);
        throw error;
    }
};

// ==========================================================
// Participant Report
// ==========================================================

export const getParticipantReport = async (participantId) => {
    try {
        const response = await API.get(
            `/participants/${participantId}/report`
        );

        return response.data;
    } catch (error) {
        console.error("Error fetching participant report:", error);
        throw error;
    }
};