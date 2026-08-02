export interface ProductMediaItem {
  id: string;
  mediaId: string;
  isThumbnail?: boolean;
  isGallery?: boolean;
  sortOrder?: number;
  media?: {
    id: string;
    publicUrl: string;
    title?: string | null;
    altText?: string | null;
  };
}

export interface ProductVariant {
  id?: string;
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK";
  weight?: number;
  isActive?: boolean;
  attributeValueIds: string[];
  media?: ProductMediaItem[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string | null;
  shortDescription?: string | null;
  longDescription?: string | null;
  hasVariants: boolean;
  price?: number | null;
  salePrice?: number | null;
  stock?: number | null;
  stockStatus?: string | null;
  weight?: number | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder?: number;
  brandId?: string | null;
  brand?: { id: string; name: string } | null;
  categories?: Array<{ category: { id: string; name: string } }>;
  media?: ProductMediaItem[];
  variants?: ProductVariant[];
  _count?: {
    variants: number;
  };
}
