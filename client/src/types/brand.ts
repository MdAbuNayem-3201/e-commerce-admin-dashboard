export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logoId: string | null;
  status: "ACTIVE" | "INACTIVE";
  logo?: {
    id: string;
    publicUrl: string;
  } | null;
  _count?: {
    products: number;
  };
}
