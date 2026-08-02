import axios from "axios";

import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
} from "../utils/token";

const api = axios.create({
  baseURL: "https://e-commerce-admin-dashboard-backend.onrender.com/api/v1",
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
            "http://localhost:5000/api/v1/auth/refresh-token",
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
