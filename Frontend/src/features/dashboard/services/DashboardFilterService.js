import API from "../../../api/Api";

export const getDashboardSummary = async (filters = {}) => {
    const response = await API.get("/dashboard", {
        params: filters,
    });

    return response.data;
};

export const getDashboardStates = async () => {
    const response = await API.get("/centres/states");
    return response.data;
};

export const getDashboardDistricts = async (stateId) => {
    const response = await API.get(
        `/centres/districts/${stateId}`
    );

    return response.data;
};

export const getDashboardCentres = async (
    stateId,
    districtId
) => {
    const response = await API.get("/centres", {
        params: {
            state_id: stateId,
            district_id: districtId,
        },
    });

    return response.data;
};