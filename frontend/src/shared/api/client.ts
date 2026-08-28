import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { clearSession, getAccessToken, setAccessToken } from "@/shared/auth/session";
import { resolveApiBaseUrl } from "./resolveApiBase";

// Resolve the API base once at module load so every request shares the same
// origin contract for the current runtime.
const API_URL = resolveApiBaseUrl();

// The storefront relies on refresh cookies, so requests must allow credentials
// even when local development uses the Vite proxy.
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach the latest access token right before each request so refreshed tokens
// take effect immediately without rebuilding the client.
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Retry one time after a successful refresh so callers see a normal success
// path instead of duplicating auth recovery logic in every feature.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const token = getAccessToken();

    if (error.response?.status === 401 && token && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        const { accessToken } = response.data;

        setAccessToken(accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        // Once refresh fails, the browser cannot restore the session on its
        // own, so we clear local state and force a clean login.
        clearSession();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
