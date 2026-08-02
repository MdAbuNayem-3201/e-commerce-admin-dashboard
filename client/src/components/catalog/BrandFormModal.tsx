import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { createBrand, updateBrand } from "../../api/brand.api";
import { getMedia } from "../../api/media.api";
import type { Brand } from "../../types/brand";
import type { MediaItem } from "../../types/media";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingBrand?: Brand | null;
};

export default function BrandFormModal({
  open,
  onClose,
  onSaved,
  editingBrand,
}: Props) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    logoId: "",
    status: "ACTIVE" as "ACTIVE" | "INACTIVE",
  });

  useEffect(() => {
    if (!open) return;

    const loadMedia = async () => {
      try {
        const resp = await getMedia({ limit: 100 });
        setMedia(resp.media ?? []);
      } catch {
        setError("Failed to load media");
      }
    };

    loadMedia();

    if (editingBrand) {
      setForm({
        name: editingBrand.name,
        slug: editingBrand.slug,
        description: editingBrand.description ?? "",
        logoId: editingBrand.logoId ?? "",
        status: editingBrand.status,
      });
    } else {
      setForm({
        name: "",
        slug: "",
        description: "",
        logoId: "",
        status: "ACTIVE",
      });
    }
  }, [open, editingBrand]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = { ...form, logoId: form.logoId || undefined };
      if (editingBrand) {
        await updateBrand(editingBrand.id, payload);
        toast.success("Brand updated");
      } else {
        await createBrand(payload);
        toast.success("Brand created");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to save brand");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold">
          {editingBrand ? "Edit brand" : "Create brand"}
        </h2>
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Logo</label>
              <select
                value={form.logoId}
                onChange={(e) => setForm({ ...form, logoId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">No logo</option>
                {media.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.fileName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value as "ACTIVE" | "INACTIVE",
                  })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-300 px-4 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {loading ? "Saving..." : editingBrand ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
