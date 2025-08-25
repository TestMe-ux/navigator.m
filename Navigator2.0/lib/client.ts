// lib/api/client.ts
import axios from "axios";

// Check if API base URL is configured
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!baseURL) {
    console.error('❌ NEXT_PUBLIC_API_BASE_URL is not configured! Please create a .env.local file with your API base URL.');
    console.log('💡 Example: NEXT_PUBLIC_API_BASE_URL=https://your-api-server.com/api');
}

const apiClient = axios.create({
    baseURL: baseURL,
    timeout: 60000,
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
        // Centralized error handling with detailed information
        console.error("🚫 API Error Details:", {
            message: error.message,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            baseURL: error.config?.baseURL,
            method: error.config?.method?.toUpperCase(),
            params: error.config?.params,
            data: error.response?.data
        });

        // Provide helpful error messages for common issues
        if (!error.config?.baseURL) {
            console.error("❌ API Base URL is not configured! Please set NEXT_PUBLIC_API_BASE_URL in your environment variables.");
        } else if (error.response?.status === 400) {
            console.error("❌ Bad Request (400): Check if all required parameters are provided correctly.");
        } else if (error.response?.status === 401) {
            console.error("❌ Unauthorized (401): Check if authentication token is valid.");
        } else if (error.response?.status === 404) {
            console.error("❌ Not Found (404): Check if the API endpoint exists.");
        } else if (error.response?.status >= 500) {
            console.error("❌ Server Error (5xx): The API server is experiencing issues.");
        }

        return Promise.reject(error);
    }
);

export default apiClient;
