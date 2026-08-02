import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";

import { deleteCategory, getCategoryTree } from "../../api/category.api";
import type { Category } from "../../types/category";
import CategoryFormModal from "../../components/catalog/CategoryFormModal";
import CategoryTree from "../../components/catalog/CategoryTree";

export default function CategoryPage() {
  const [items, setItems] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const tree = await getCategoryTree();
      setItems(tree ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this category?");
    if (!confirmed) return;

    try {
      await deleteCategory(id);
      toast.success("Category deleted");
      loadCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Unable to delete category");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500">
            Manage a hierarchical category tree with parent assignment, image
            selection, status, and order.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          New category
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading categories...
        </div>
      ) : (
        <CategoryTree
          items={items}
          onEdit={(item) => {
            setEditingCategory(item);
            setOpen(true);
          }}
          onDelete={handleDelete}
        />
      )}

      <CategoryFormModal
        open={open}
        editingCategory={editingCategory}
        onClose={() => {
          setOpen(false);
          setEditingCategory(null);
        }}
        onSaved={loadCategories}
      />
    </div>
  );
}
