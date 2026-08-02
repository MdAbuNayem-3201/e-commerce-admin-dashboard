import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";

import { deleteAttribute, getAttributes } from "../../api/attribute.api";
import type { Attribute } from "../../types/attribute";
import AttributeFormModal from "../../components/catalog/AttributeFormModal";

export default function AttributePage() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] = useState<Attribute | null>(
    null,
  );

  const loadAttributes = async () => {
    try {
      setLoading(true);
      const data = await getAttributes();
      setAttributes(data.attributes ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load attributes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttributes();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this attribute?");
    if (!confirmed) return;

    try {
      await deleteAttribute(id);
      toast.success("Attribute deleted");
      loadAttributes();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Unable to delete attribute");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Attributes</h1>
          <p className="text-sm text-slate-500">
            Create and edit attributes, choose a type, and manage values
            including color values.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingAttribute(null);
            setOpen(true);
          }}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus size={18} />
          New attribute
        </button>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading attributes...
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {attributes.map((attribute) => (
            <div
              key={attribute.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">
                    {attribute.name}
                  </h3>
                  <p className="text-sm text-slate-500">{attribute.slug}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {attribute.type}
                </span>
              </div>
              <p className="mt-3 text-sm text-slate-500">
                {attribute.description || "No description"}
              </p>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                <span>{attribute._count?.values ?? 0} values</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingAttribute(attribute);
                      setOpen(true);
                    }}
                    className="rounded px-3 py-2 text-blue-600 hover:bg-blue-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(attribute.id)}
                    className="rounded px-3 py-2 text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AttributeFormModal
        open={open}
        editingAttribute={editingAttribute}
        onClose={() => {
          setOpen(false);
          setEditingAttribute(null);
        }}
        onSaved={loadAttributes}
      />
    </div>
  );
}
