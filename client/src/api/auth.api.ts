import api from "./axios";

export const login = (data: {
  email: string;
  password: string;
}) => {
  return api.post("/auth/login", data);
};

export const logout = () => {
  return api.post("/auth/logout");
};

export const getCurrentUser = () => {
  return api.get("/auth/me");
};

export const refreshToken = () => {
  return api.post("/auth/refresh-token");
};