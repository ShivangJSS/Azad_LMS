import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
    headers: {
        "Content-Type": "application/json",
    },
});

let isRefreshing = false;
let failedQueue = [];

// Process all waiting requests
const processQueue = (error, token = null) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
        }
    });

    failedQueue = [];
};

// ================= Request Interceptor =================

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ================= Response Interceptor =================

API.interceptors.response.use(
    (response) => response,

    async (error) => {
        const originalRequest = error.config;

        // Only handle 401 once
        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {

            // If refresh request already running
            if (isRefreshing) {

                return new Promise((resolve, reject) => {

                    failedQueue.push({
                        resolve,
                        reject,
                    });

                }).then((token) => {

                    originalRequest.headers.Authorization =
                        `Bearer ${token}`;

                    return API(originalRequest);

                }).catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {

                const refresh_token =
                    localStorage.getItem("refresh_token");

                if (!refresh_token) {
                    throw new Error("Refresh token not found");
                }

                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/auth/refresh`,
                    {
                        refresh_token,
                    }
                );

                const newAccessToken =
                    response.data.access_token;

                localStorage.setItem(
                    "access_token",
                    newAccessToken
                );

                processQueue(null, newAccessToken);

                originalRequest.headers.Authorization =
                    `Bearer ${newAccessToken}`;

                return API(originalRequest);

            } catch (err) {

                processQueue(err, null);

                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                localStorage.removeItem("user");

                window.location.href = "/Login";

                return Promise.reject(err);

            } finally {

                isRefreshing = false;

            }
        }

        return Promise.reject(error);
    }
);

export default API;