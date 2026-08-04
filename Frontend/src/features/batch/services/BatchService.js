import API from '../../../api/Api';

// Reuse the already-working reference-data state/district/centre lookups
// (same ones used by the Participants module) rather than duplicating them.
export { getStates, getDistricts, getAllCentres } from '../../participant/services/participantService';

// ==========================================================
// Batches
// ==========================================================

export const getBatches = async ({ stateId, districtId, search } = {}) => {
    try {
        const response = await API.get('/batches', {
            params: {
                ...(stateId ? { state_id: stateId } : {}),
                ...(districtId ? { district_id: districtId } : {}),
                ...(search ? { search } : {}),
            },
        });
        console.log(response.data); // Log the response data
        return response.data;
    } catch (error) {
        console.error('Error fetching batches:', error);
        throw error;
    }
};

export const createBatch = async ({ batchName, centreId, fyYear, status }) => {
    try {
        const response = await API.post('/batches', {
            batch_name: batchName,
            centre_id: centreId,
            fy_year: fyYear,
            status,
        });
        return response.data;
    } catch (error) {
        console.error('Error creating batch:', error);
        throw error;
    }
};

export const getBatchParticipants = async (batchId) => {
    try {
        const response = await API.get(`/batches/${batchId}/participants`);
        return response.data;
    } catch (error) {
        console.error('Error fetching batch participants:', error);
        throw error;
    }
};

export const updateBatchStatus = async (batchId, newStatus) => {
    try {
        const response = await API.patch(`/batches/${batchId}/status`, {
            status: newStatus,
        });
        return response.data;
    } catch (error) {
        console.error('Error updating batch status:', error);
        throw error;
    }
};

export const deleteBatch = async (batchId) => {
    try {
        const response = await API.delete(`/batches/${batchId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting batch:', error);
        throw error;
    }
};

export const getBatchById = async (batchId) => {
    try {
        const response = await API.get(`/batches/${batchId}`);
        return response.data;
    }
    catch (error) {

        console.error(`Error fetching batch with ID ${batchId}:`, error);
        throw error;
    }
};

export const updateBatch = async (batchId, { batchName, centreId, fyYear, status }) => {
    try {
        const response = await API.put(`/batches/${batchId}`, {
            batch_name: batchName,
            centre_id: centreId,
            fy_year: fyYear,
            status,
        });
        return response.data;
    } catch (error) {
        console.error(`Error updating batch with ID ${batchId}:`, error);
        throw error;
    }
};
