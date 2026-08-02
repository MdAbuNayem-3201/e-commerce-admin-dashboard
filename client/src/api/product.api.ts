import api from "./axios.ts";

export const getProducts = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  brandId?: string;
  categoryId?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}) => {
  const res = await api.get("/product", { params });
  return res.data?.data ?? res.data;
};

export const getProductById = async (id: string) => {
  const res = await api.get(`/product/${id}`);
  return res.data.data;
};

export const createProduct = async (payload: any) => {
  const res = await api.post("/product", payload);
  return res.data;
};

export const updateProduct = async (id: string, payload: any) => {
  const res = await api.patch(`/product/${id}`, payload);
  return res.data;
};

export const deleteProduct = async (id: string) => {
  const res = await api.delete(`/product/${id}`);
  return res.data;
};
