import API from "../../../../api/Api";

export const getAllDistricts = async (params = {}) => {
    const response = await API.get("/districts", {
        params,
    });
    return response.data;
};

export const getDistrict = async (code) => {
    const response = await API.get(`/districts/${code}`);
    return response.data;
};

export const createDistrict = async (payload) => {
    const response = await API.post("/districts", payload);
    return response.data;
};

export const updateDistrict = async (code, payload) => {
    const response = await API.put(`/districts/${code}`, payload);
    return response.data;
};

export const deleteDistrict = async (code) => {
    const response = await API.delete(`/districts/${code}`);
    return response.data;
};