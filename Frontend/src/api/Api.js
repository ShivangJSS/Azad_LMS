import axios from "axios";

import { startLoading, stopLoading } from "./loadingBus";

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const API = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

const AUTH_PATHS = ["/auth/login", "/auth/refresh", "/auth/logout"];

const isAuthRequest = (url = "") =>
    AUTH_PATHS.some((path) => url.includes(path));

let isRefreshing = false;
let failedQueue = [];

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

const forceLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    if (window.location.pathname !== "/login") {
        window.location.href = "/login";
    }
};

// ================= Request Interceptor =================

API.interceptors.request.use(
    (config) => {
        // Drive the global loading indicator for every request.
        startLoading();

        // Let the browser add the multipart boundary when a request uploads files.
        // The API client's JSON default would otherwise make FastAPI treat all
        // multipart fields as missing and respond with 422.
        if (config.data instanceof FormData) {
            config.headers.setContentType(undefined);
        }

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
    (response) => {
        stopLoading();
        return response;
    },

    async (error) => {
        // Balance the startLoading() from this request's request-interceptor.
        // (A refresh-token retry is a fresh request with its own start/stop.)
        stopLoading();

        const originalRequest = error.config;

        const shouldAttemptRefresh =
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest._retry &&
            !isAuthRequest(originalRequest.url);

        if (!shouldAttemptRefresh) {
            return Promise.reject(error);
        }

        // A refresh is already in flight — queue this request behind it.
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                    originalRequest._retry = true;
                    originalRequest.headers.Authorization = `Bearer ${token}`;

                    return API(originalRequest);
                })
                .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
            const refresh_token = localStorage.getItem("refresh_token");

            if (!refresh_token) {
                throw new Error("Refresh token not found");
            }

            // Plain axios, not API — avoids recursing through this interceptor.
            const response = await axios.post(
                `${BASE_URL}/auth/refresh`,
                { refresh_token },
                { headers: { "Content-Type": "application/json" } }
            );

            const newAccessToken = response.data.access_token;

            if (!newAccessToken) {
                throw new Error("No access token in refresh response");
            }

            localStorage.setItem("access_token", newAccessToken);

            if (response.data.refresh_token) {
                localStorage.setItem(
                    "refresh_token",
                    response.data.refresh_token
                );
            }

            processQueue(null, newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

            return API(originalRequest);
        } catch (err) {
            processQueue(err, null);
            forceLogout();

            return Promise.reject(err);
        } finally {
            isRefreshing = false;
        }
    }
);

export default API;
