import API from "../../../api/Api";

const cleanParams = (params = {}) =>
    Object.fromEntries(
        Object.entries(params).filter(
            ([, value]) =>
                value !== "" &&
                value !== null &&
                value !== undefined
        )
    );

/* ============================
   Dashboard Summary
============================ */

export const getDashboardSummary = async (filters = {}) => {
    const response = await API.get("/dashboard", {
        params: cleanParams(filters),
    });

    return response.data;
};

/* ============================
   Trainee Status (detail list)
============================ */

export const getTraineeStatusDetails = async (filters = {}) => {
    const response = await API.get("/dashboard/trainee-status/details", {
        params: cleanParams(filters),
    });

    return response.data;
};

/* ============================
   State Wise Participants
============================ */

export const getStateWiseParticipants = async (filters = {}) => {
    const response = await API.get(
        "/dashboard/state-wise-participants",
        {
            params: cleanParams(filters),
        }
    );

    return response.data;
};

/* ============================
   District Wise Participants
============================ */

export const getDistrictWiseParticipants = async (
    filters = {}
) => {
    const response = await API.get(
        "/dashboard/district-wise-participants",
        {
            params: cleanParams(filters),
        }
    );

    return response.data;
};

/* ============================
   Gender Distribution
============================ */

export const getGenderDistribution = async (
    filters = {}
) => {
    const response = await API.get(
        "/dashboard/gender-distribution",
        {
            params: cleanParams(filters),
        }
    );

    return response.data;
};

/* ============================
   Age Group Distribution
============================ */

export const getAgeGroupDistribution = async (
    filters = {}
) => {
    const response = await API.get(
        "/dashboard/age-group-distribution",
        {
            params: cleanParams(filters),
        }
    );

    return response.data;
};

/* ============================
   State Wise Centres
============================ */

export const getStateWiseCentres = async (
    filters = {}
) => {
    const response = await API.get(
        "/dashboard/state-wise-centres",
        {
            params: cleanParams(filters),
        }
    );

    return response.data;
};

/* ============================
   Module Performance
============================ */

export const getModulePerformance = async (
    filters = {}
) => {
    const response = await API.get(
        "/dashboard/module-wise-performance",
        {
            params: cleanParams(filters),
        }
    );

    return response.data;
};

/* ============================
   Document Distribution
============================ */

export const getDocumentDistribution = async () => {
    const response = await API.get(
        "/dashboard/document-type-distribution"
    );

    return response.data;
};

/* ============================
   Monthly Logins
============================ */

export const getMonthlyLogins = async (
    filters = {}
) => {
    const response = await API.get(
        "/dashboard/monthly-logins",
        {
            params: cleanParams(filters),
        }
    );

    return response.data;
};

/* ============================
   Monthly Login Details
============================ */

export const getMonthlyLoginDetails = async (
    filters = {}
) => {
    const response = await API.get(
        "/dashboard/monthly-logins/details",
        {
            params: cleanParams(filters),
        }
    );

    return response.data;
};