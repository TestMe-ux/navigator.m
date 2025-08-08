// lib/api/client.ts
import axios from "axios";

const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL, // from .env
    timeout: 30000,
    headers: {
        "Content-Type": "application/json",
    }
});

// Add interceptors if needed (auth tokens, logging)
apiClient.interceptors.request.use((config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Centralized error handling
        console.error("API Error:", error);
        return Promise.reject(error);
    }
);

export default apiClient;
