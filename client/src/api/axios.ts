import axios from "axios";

import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from "../utils/token";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://e-commerce-admin-dashboard-backend.onrender.com";

const apiBaseUrl = `${BASE_URL}/api/v1`;

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

let isRefreshing = false;

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const response = await axios.post(
            `${apiBaseUrl}/auth/refresh-token`,
            {},
            {
              withCredentials: true,
            }
          );

          const accessToken = response.data.data.accessToken;

          setAccessToken(accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return api(originalRequest);
        } catch (err) {
          removeAccessToken();

          window.location.href = "/login";

          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;