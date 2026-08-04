import API from "../../../api/Api";


// Get all active states
export const getStates = () => {
    return API.get("/centres/states");
};

// Get districts by state
export const getDistricts = (stateId) => {
    return API.get(`/centres/districts/${stateId}`);
};

// Get blocks by district
export const getBlocks = (districtId) => {
    return API.get(`/centres/blocks/${districtId}`);
};



/* =========================
   CENTRE CRUD  
========================= */

// Get all centres
export const getCentres = (params = {}) => {
    return API.get("/centres", {
        params,
    });
};

// Create centre
export const createCentre = (payload) => {
    return API.post("/centres", payload);
};

// Get single centre by ID
export const getCentreById = (centreId) => {
    return API.get(`/centres/${centreId}`);
};

// Update centre
export const updateCentre = (centreId, payload) => {
    return API.put(`/centres/${centreId}`, payload);
};

// Update centre status
export const updateCentreStatus = (centreId, status) => {
    return API.patch(`/centres/${centreId}/status`, {
        status,
    });
};

// Delete centre
export const deleteCentre = (centreId) => {
    return API.delete(`/centres/${centreId}`);
};