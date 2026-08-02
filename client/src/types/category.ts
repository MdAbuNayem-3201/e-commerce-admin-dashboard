export interface CategoryImage {
  id: string;
  publicUrl: string;
  fileName?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
  imageId: string | null;
  image: CategoryImage | null;
  sortOrder: number;
  isActive: boolean;
  parent?: Category | null;
  children?: Category[];
  _count?: {
    products: number;
    children: number;
  };
}
