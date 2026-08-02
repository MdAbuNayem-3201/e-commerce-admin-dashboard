import axios from "axios";

import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from "../utils/token";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  "https://e-commerce-admin-dashboard-backend.onrender.com/api/v1";

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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const response = await axios.post(
            `${apiBaseUrl}/auth/refresh-token`,
            {},
            {
              withCredentials: true,
            },
          );

          const token = response.data.data.accessToken;

          setAccessToken(token);

          isRefreshing = false;

          originalRequest.headers.Authorization = `Bearer ${token}`;

          return api(originalRequest);
        } catch {
          removeAccessToken();

          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api;
