import API from "../../../api/Api";

const cleanParams = (params = {}) =>
    Object.fromEntries(
        Object.entries(params).filter(
            ([, value]) =>
                value !== "" &&
                value !== undefined &&
                value !== null
        )
    );

export const getDashboardSummary = async (filters = {}) => {
    const response = await API.get("/dashboard", {
        params: cleanParams(filters),
    });

    return response.data;
};