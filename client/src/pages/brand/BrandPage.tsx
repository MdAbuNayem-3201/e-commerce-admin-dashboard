import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";

import { deleteBrand, getBrands } from "../../api/brand.api";
import type { Brand } from "../../types/brand";
import BrandFormModal from "../../components/catalog/BrandFormModal";

export default function BrandPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const data = await getBrands();
      setBrands(data.brands ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this brand?");
    if (!confirmed) return;

    try {
      await deleteBrand(id);
      toast.success("Brand deleted");
      loadBrands();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Unable to delete brand");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Brands</h1>
          <p className="text-sm text-slate-500">
            Create and edit brands, and pick a logo from the media library.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBrand(null);
            setOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          New brand
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading brands...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{brand.name}</h3>
                  <p className="text-sm text-slate-500">{brand.slug}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${brand.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}
                >
                  {brand.status}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3">
                {brand.logo?.publicUrl ? (
                  <img
                    src={brand.logo.publicUrl}
                    alt={brand.name}
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-500">
                    Logo
                  </div>
                )}
                <p className="text-sm text-slate-500">
                  {brand.description || "No description"}
                </p>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEditingBrand(brand);
                    setOpen(true);
                  }}
                  className="rounded px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(brand.id)}
                  className="rounded px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <BrandFormModal
        open={open}
        editingBrand={editingBrand}
        onClose={() => {
          setOpen(false);
          setEditingBrand(null);
        }}
        onSaved={loadBrands}
      />
    </div>
  );
}
