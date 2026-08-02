import api from "./axios";

import type {
  Permission,
  PermissionWatchGroup,
  CreatePermissionPayload,
  UpdatePermissionPayload,
} from "../types/permission.ts";

export const getPermissions = async () => {
  const res = await api.get("/permissions");

  return res.data.data as Permission[];
};

export const getPermissionWatch = async () => {
  const res = await api.get("/permissions/watch");

  return res.data.data.moduleGrid as PermissionWatchGroup[];
};

export const createPermission = async (
  payload: CreatePermissionPayload
) => {
  const res = await api.post(
    "/permissions",
    payload
  );

  return res.data;
};

export const updatePermission = async (
  id: string,
  payload: UpdatePermissionPayload
) => {
  const res = await api.put(
    `/permissions/${id}`,
    payload
  );

  return res.data;
};

export const deletePermission = async (
  id: string
) => {
  const res = await api.delete(
    `/permissions/${id}`
  );

  return res.data;
};