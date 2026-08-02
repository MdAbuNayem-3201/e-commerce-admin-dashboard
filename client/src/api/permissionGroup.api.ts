import api from "./axios";

export const getPermissionGroups = async () => {
  const res = await api.get("/permission-groups");
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

export const getPermissionGroupById = async (id: string) => {
  const res = await api.get(`/permission-groups/${id}`);
  return res.data?.data ?? null;
};

export const createPermissionGroup = (data: any) => {
  return api.post("/permission-groups", data);
};

export const updatePermissionGroup = (id: string, data: any) => {
  return api.patch(`/permission-groups/update/${id}`, data);
};

export const deletePermissionGroup = (id: string) => {
  return api.delete(`/permission-groups/delete/${id}`);
};

export const watchPermissionGroups = async () => {
  const res = await api.get("/permission-groups/watch");
  return Array.isArray(res.data?.data) ? res.data.data : [];
};
