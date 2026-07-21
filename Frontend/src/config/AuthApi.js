import API from "./Api";

export const getCaptcha = async () => {
    const { data } = await API.get("/auth/captcha");
    return data;
};

export const loginUser = async (payload) => {
    const { data } = await API.post("/auth/login", payload);
    return data;
};

export const refreshToken = async () => {
    const refresh_token = localStorage.getItem("refresh_token");

    const { data } = await API.post("/auth/refresh", {
        refresh_token,
    });

    return data;
};

export const logoutUser = async () => {
    const { data } = await API.post("/auth/logout");
    return data;
};