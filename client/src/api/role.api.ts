import api from "./axios.ts";

export const getPermissionGroups =
  async () => {
    const res = await api.get(
      "/permission-groups/watch"
    );

    return res.data.data;
  };

export const getRoles = async () => {
  const res = await api.get("/role/all-roles");
  return res.data.data;
};

export const getRoleById = async (id: string) => {
  const res = await api.get(`/role/${id}`);
  return res.data.data;
};

export const createRole = async (payload: any) => {
  const res = await api.post("/role", payload);
  return res.data;
};

export const updateRole = async (
  id: string,
  payload: any
) => {
  const res = await api.patch(`/role/${id}`, payload);
  return res.data;
};

export const deleteRole = async (id: string) => {
  const res = await api.delete(`/role/${id}`);
  return res.data;
};