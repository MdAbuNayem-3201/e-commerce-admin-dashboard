import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "react-hot-toast";

import { getProducts, deleteProduct } from "../../api/product.api";
import { getBrands } from "../../api/brand.api";
import { getCategories } from "../../api/category.api";
import type { Product } from "../../types/product";
import ProductTable from "../../components/catalog/ProductTable";
import ProductFormModal from "../../components/catalog/ProductFormModal";

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([]);
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [brandId, setBrandId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [isActive, setIsActive] = useState<string>("");
  const [isFeatured, setIsFeatured] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [productData, brandData, categoryData] = await Promise.all([
        getProducts({
          page: 1,
          limit: 20,
          search: search || undefined,
          brandId: brandId || undefined,
          categoryId: categoryId || undefined,
          isActive: isActive === "" ? undefined : isActive === "true",
          isFeatured: isFeatured === "" ? undefined : isFeatured === "true",
        }),
        getBrands(),
        getCategories(),
      ]);
      const normalizedProducts = Array.isArray(productData)
        ? productData
        : (productData?.products ?? []);
      setProducts(normalizedProducts);
      setBrands(
        Array.isArray(brandData)
          ? brandData
          : ((brandData?.brands ?? []) as Array<{ id: string; name: string }>),
      );
      setCategories(
        Array.isArray(categoryData)
          ? categoryData
          : ((categoryData?.categories ?? []) as Array<{
              id: string;
              name: string;
            }>),
      );
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      loadProducts();
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [search, brandId, categoryId, isActive, isFeatured]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) return;

    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      loadProducts();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Unable to delete product");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500">
            Browse products with search, filtering, and full CRUD editing.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          New product
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
            <Search size={16} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products"
              className="w-full border-none bg-transparent text-sm outline-none"
            />
          </label>
          <select
            value={brandId}
            onChange={(e) => setBrandId(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All brands</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <select
              value={isActive}
              onChange={(e) => setIsActive(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">All status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <select
              value={isFeatured}
              onChange={(e) => setIsFeatured(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="">Any featured</option>
              <option value="true">Featured</option>
              <option value="false">Not featured</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading products...
        </div>
      ) : (
        <ProductTable
          products={products}
          onEdit={(product) => {
            setEditingProduct(product);
            setOpen(true);
          }}
          onDelete={handleDelete}
        />
      )}

      <ProductFormModal
        open={open}
        editingProduct={editingProduct}
        onClose={() => {
          setOpen(false);
          setEditingProduct(null);
        }}
        onSaved={loadProducts}
      />
    </div>
  );
}
