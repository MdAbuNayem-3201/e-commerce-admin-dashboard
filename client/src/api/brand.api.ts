import api from "./axios.ts";

export const getBrands = async (params?: {
  search?: string;
  status?: string;
}) => {
  const res = await api.get("/brand", { params });
  return res.data.data;
};

export const createBrand = async (payload: any) => {
  const res = await api.post("/brand", payload);
  return res.data;
};

export const updateBrand = async (id: string, payload: any) => {
  const res = await api.patch(`/brand/${id}`, payload);
  return res.data;
};

export const deleteBrand = async (id: string) => {
  const res = await api.delete(`/brand/${id}`);
  return res.data;
};
