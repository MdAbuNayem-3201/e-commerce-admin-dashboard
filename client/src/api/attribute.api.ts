import api from "./axios.ts";

export const getAttributes = async (params?: {
  search?: string;
  type?: string;
}) => {
  const res = await api.get("/attribute", { params });
  return res.data.data;
};

export const createAttribute = async (payload: any) => {
  const res = await api.post("/attribute", payload);
  return res.data;
};

export const updateAttribute = async (id: string, payload: any) => {
  const res = await api.patch(`/attribute/${id}`, payload);
  return res.data;
};

export const deleteAttribute = async (id: string) => {
  const res = await api.delete(`/attribute/${id}`);
  return res.data;
};

export const createAttributeValue = async (
  attributeId: string,
  payload: any,
) => {
  const res = await api.post(`/attribute/${attributeId}/values`, payload);
  return res.data;
};

export const updateAttributeValue = async (id: string, payload: any) => {
  const res = await api.patch(`/attribute/values/${id}`, payload);
  return res.data;
};

export const deleteAttributeValue = async (id: string) => {
  const res = await api.delete(`/attribute/values/${id}`);
  return res.data;
};
