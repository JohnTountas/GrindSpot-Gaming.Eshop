import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { clearSession, getAccessToken, setAccessToken } from "@/shared/auth/session";
import { resolveApiBaseUrl } from "./resolveApiBase";

// Base API URL used by the frontend HTTP client.
const API_URL = resolveApiBaseUrl();

// The storefront relies on refresh cookies, so every request must be allowed to
// carry credentials even when the frontend and backend live on separate hosts.
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies for refresh tokens
});

// The access token stays in memory/local storage on the client side. We attach
// it late, per request, so token refreshes immediately affect subsequent calls.
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

//Τhe short-lived access token expired while the refresh cookie is still valid.
// The retry marker prevents infinite loops if `/auth/refresh` also fails.
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const token = getAccessToken();

    // Only refresh when the user still has an active local session.
    if (error.response?.status === 401 && token && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });

        const { accessToken } = response.data;
        setAccessToken(accessToken);

        // Replay the original request once with the fresh bearer token so
        // calling code sees a normal success path instead of refresh plumbing.
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // When refresh fails, the browser session is no longer recoverable from
        // the client alone, so we clear local state and send the user through a
        // clean login flow.
        clearSession();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
