import api from "./axios.ts";

export const getMedia = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
}) => {
  const res = await api.get("/media", { params });
  return res.data.data;
};

export const uploadMedia = async (
  file: File,
  title?: string,
  altText?: string,
) => {
  const formData = new FormData();
  formData.append("file", file);
  if (title) formData.append("title", title);
  if (altText) formData.append("altText", altText);

  const res = await api.post("/media/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};

export const updateMedia = async (
  id: string,
  payload: { title?: string; altText?: string },
) => {
  const res = await api.patch(`/media/${id}`, payload);
  return res.data;
};

export const deleteMedia = async (id: string) => {
  const res = await api.delete(`/media/${id}`);
  return res.data;
};
