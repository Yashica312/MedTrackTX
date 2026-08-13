import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json"
  },
  timeout: 30000
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getUploadUrl(
  uploadPath: string | null | undefined
): string {
  if (!uploadPath) return "";

  if (
    uploadPath.startsWith("http://") ||
    uploadPath.startsWith("https://")
  ) {
    return uploadPath;
  }

  const normalized = uploadPath.replace(/\\/g, "/");

  if (normalized.startsWith("/uploads/")) {
    return `${API_BASE_URL}${normalized}`;
  }

  if (normalized.startsWith("uploads/")) {
    return `${API_BASE_URL}/${normalized}`;
  }

  return `${API_BASE_URL}/${normalized.replace(/^\/+/, "")}`;
}