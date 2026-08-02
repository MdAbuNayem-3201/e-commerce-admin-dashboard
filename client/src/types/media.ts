export interface MediaItem {
  id: string;
  fileName: string;
  storedPath: string;
  publicUrl: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  type: "IMAGE" | "VIDEO" | "DOCUMENT";
  title: string | null;
  altText: string | null;
  createdAt: string;
  updatedAt: string;
  uploadedBy?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface MediaResponse {
  media: MediaItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
