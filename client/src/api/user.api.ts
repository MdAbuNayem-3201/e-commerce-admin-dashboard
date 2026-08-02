import api from "./axios.ts";

export type CreateUserPayload = {
  name: string;
  email: string;
  password: string;
  phone?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  roleId: string;
};

export type UpdateUserPayload = {
  name?: string;
  phone?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  roleId?: string;
};

export const getUsers = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
  isActive?: boolean;
}) => {
  const res = await api.get("/user", { params });
  return res.data.data;
};

export const createUser = async (payload: CreateUserPayload) => {
  const res = await api.post("/user", payload);
  return res.data;
};

export const updateUser = async (id: string, payload: UpdateUserPayload) => {
  const res = await api.patch(`/user/${id}`, payload);
  return res.data;
};

export const updateUserStatus = async (id: string, isActive: boolean) => {
  const res = await api.patch(`/user/${id}/status`, { isActive });
  return res.data;
};

export const deleteUser = async (id: string) => {
  const res = await api.delete(`/user/${id}`);
  return res.data;
};
