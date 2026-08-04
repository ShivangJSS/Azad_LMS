import API from "../../../../api/Api";


// ================= GET ALL STATES =================

export const getAllStates = async () => {
    try {
        const response = await API.get("/states");
        return response.data;
    } catch (error) {
        console.error("Error fetching states:", error);
        throw error;
    }
};


// ================= GET STATE BY ID =================

export const getStateById = async (id) => {
    try {
        const response = await API.get(`/states/${id}`);
        return response.data;
    } catch (error) {
        console.error(
            `Error fetching state with ID ${id}:`,
            error
        );
        throw error;
    }
};


// ================= CREATE STATE =================

export const createState = async (data) => {
    try {
        const response = await API.post("/states", data);
        return response.data;
    } catch (error) {
        console.error("Error creating state:", error);
        throw error;
    }
};


// ================= UPDATE STATE =================

export const updateState = async (id, data) => {
    try {
        const response = await API.put(
            `/states/${id}`,
            data
        );

        return response.data;
    } catch (error) {
        console.error(
            `Error updating state with ID ${id}:`,
            error
        );
        throw error;
    }
};


// ================= DELETE STATE =================

export const deleteState = async (id) => {
    try {
        const response = await API.delete(
            `/states/${id}`
        );

        return response.data;
    } catch (error) {
        console.error(
            `Error deleting state with ID ${id}:`,
            error
        );
        throw error;
    }
};

// Shared, read-only lookup for forms and filters outside State management.
// Management screens must continue using getAllStates().
export const getReferenceStates = async () => {
    try {
        const response = await API.get("/reference/states");

        return response.data.map(({ code, name }) => ({
            state_lgd_code: code,
            state_name: name,
        }));
    } catch (error) {
        console.error("Error fetching reference states:", error);
        throw error;
    }
};
