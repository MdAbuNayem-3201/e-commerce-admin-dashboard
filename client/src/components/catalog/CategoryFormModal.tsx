import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

import { createCategory, updateCategory } from "../../api/category.api";
import { getMedia } from "../../api/media.api";
import type { Category } from "../../types/category";
import type { MediaItem } from "../../types/media";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingCategory?: Category | null;
};

export default function CategoryFormModal({
  open,
  onClose,
  onSaved,
  editingCategory,
}: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    parentId: "",
    imageId: "",
    sortOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      try {
        const [categoryData, mediaData] = await Promise.all([
          (await import("../../api/category.api")).getCategories({
            isActive: undefined,
          }),
          getMedia({ limit: 100 }),
        ]);
        setCategories(categoryData.categories ?? []);
        setMedia(mediaData.media ?? []);
      } catch {
        setError("Failed to load category data");
      }
    };

    loadData();

    if (editingCategory) {
      setForm({
        name: editingCategory.name,
        slug: editingCategory.slug,
        description: editingCategory.description ?? "",
        parentId: editingCategory.parentId ?? "",
        imageId: editingCategory.imageId ?? "",
        sortOrder: editingCategory.sortOrder ?? 0,
        isActive: editingCategory.isActive,
      });
    } else {
      setForm({
        name: "",
        slug: "",
        description: "",
        parentId: "",
        imageId: "",
        sortOrder: 0,
        isActive: true,
      });
    }
  }, [open, editingCategory]);

  const availableParents = useMemo(
    () => categories.filter((item) => item.id !== editingCategory?.id),
    [categories, editingCategory],
  );

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...form,
        parentId: form.parentId || undefined,
        imageId: form.imageId || undefined,
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        toast.success("Category updated");
      } else {
        await createCategory(payload);
        toast.success("Category created");
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to save category");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold">
          {editingCategory ? "Edit category" : "Create category"}
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

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Parent</label>
              <select
                value={form.parentId}
                onChange={(e) => setForm({ ...form, parentId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">None</option>
                {availableParents.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Image</label>
              <select
                value={form.imageId}
                onChange={(e) => setForm({ ...form, imageId: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="">No image</option>
                {media.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.fileName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Sort order
              </label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: Number(e.target.value) })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            Active
          </label>

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
              {loading ? "Saving..." : editingCategory ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
