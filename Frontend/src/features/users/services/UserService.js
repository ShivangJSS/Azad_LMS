import API from "../../../api/Api";



export const createUser = async (payload) => {
    const { data } = await API.post("/users", payload);
    return data;
};

export const getAllUsers = async () => {
    const { data } = await API.get("/users");
    return data;
}

export const getUserById = async (userId) => {
    const { data } = await API.get(`/users/${userId}`);
    return data;
}

export const updateUser = async (userId, payload) => {
    const { data } = await API.put(`/users/${userId}`, payload);
    return data;
}

export const deleteUser = async (userId) => {
    const { data } = await API.delete(`/users/${userId}`);
    return data;
};

export const getCreatableRoles = async () => {
    const { data } = await API.get("/users/creatable-roles");
    return data;
};
