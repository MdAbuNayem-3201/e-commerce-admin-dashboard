import api from "./axios.ts";

export const getCategories = async (params?: {
  search?: string;
  parentId?: string;
  isActive?: boolean;
}) => {
  const res = await api.get("/category", { params });
  return res.data.data;
};

export const getCategoryTree = async () => {
  const res = await api.get("/category/tree");
  return res.data.data;
};

export const createCategory = async (payload: any) => {
  const res = await api.post("/category", payload);
  return res.data;
};

export const updateCategory = async (id: string, payload: any) => {
  const res = await api.patch(`/category/${id}`, payload);
  return res.data;
};

export const deleteCategory = async (id: string) => {
  const res = await api.delete(`/category/${id}`);
  return res.data;
};
