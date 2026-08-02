import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

import {
  createAttribute,
  createAttributeValue,
  deleteAttributeValue,
  updateAttribute,
} from "../../api/attribute.api";
import type { Attribute, AttributeValue } from "../../types/attribute";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingAttribute?: Attribute | null;
};

export default function AttributeFormModal({
  open,
  onClose,
  onSaved,
  editingAttribute,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    type: "TEXT" as Attribute["type"],
    description: "",
    isRequired: false,
  });
  const [values, setValues] = useState<AttributeValue[]>([]);
  const [draftValue, setDraftValue] = useState("");
  const [draftSlug, setDraftSlug] = useState("");
  const [draftReference, setDraftReference] = useState("");

  useEffect(() => {
    if (!open) return;
    if (editingAttribute) {
      setForm({
        name: editingAttribute.name,
        slug: editingAttribute.slug,
        type: editingAttribute.type,
        description: editingAttribute.description ?? "",
        isRequired: editingAttribute.isRequired ?? false,
      });
      setValues(editingAttribute.values ?? []);
    } else {
      setForm({
        name: "",
        slug: "",
        type: "TEXT",
        description: "",
        isRequired: false,
      });
      setValues([]);
    }
  }, [open, editingAttribute]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (editingAttribute) {
        await updateAttribute(editingAttribute.id, form);
      } else {
        await createAttribute(form);
      }

      onSaved();
      onClose();
      toast.success(
        editingAttribute ? "Attribute updated" : "Attribute created",
      );
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to save attribute");
    } finally {
      setLoading(false);
    }
  };

  const addValue = async () => {
    if (!draftValue.trim() || !draftSlug.trim()) return;
    try {
      if (!editingAttribute) {
        toast.error("Create the attribute first, then add values");
        return;
      }
      const res = await createAttributeValue(editingAttribute.id, {
        value: draftValue,
        slug: draftSlug,
        referenceValue: draftReference || undefined,
      });
      setValues((current) => [...current, res.data]);
      setDraftValue("");
      setDraftSlug("");
      setDraftReference("");
      toast.success("Value added");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Unable to add value");
    }
  };

  const removeValue = async (id: string) => {
    try {
      await deleteAttributeValue(id);
      setValues((current) => current.filter((value) => value.id !== id));
      toast.success("Value removed");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Unable to remove value");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold">
          {editingAttribute ? "Edit attribute" : "Create attribute"}
        </h2>
        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
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

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Type</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value as Attribute["type"],
                  })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="TEXT">Text</option>
                <option value="NUMBER">Number</option>
                <option value="BOOLEAN">Boolean</option>
                <option value="COLOR">Color</option>
                <option value="SELECT">Select</option>
                <option value="MULTISELECT">Multi Select</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Description
              </label>
              <input
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={form.isRequired}
              onChange={(e) =>
                setForm({ ...form, isRequired: e.target.checked })
              }
            />
            Required
          </label>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="font-semibold text-slate-900">Values</h3>
            <p className="mt-1 text-sm text-slate-500">
              Add values for the attribute, including color entries.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <input
                value={draftValue}
                onChange={(e) => setDraftValue(e.target.value)}
                placeholder="Value"
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
              <input
                value={draftSlug}
                onChange={(e) => setDraftSlug(e.target.value)}
                placeholder="Slug"
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
              <input
                value={draftReference}
                onChange={(e) => setDraftReference(e.target.value)}
                placeholder="Reference (optional)"
                className="rounded-lg border border-slate-300 px-3 py-2"
              />
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={addValue}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
              >
                <Plus size={16} /> Add value
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {values.map((value) => (
                <div
                  key={value.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium text-slate-900">
                      {value.value}
                    </div>
                    <div className="text-slate-500">
                      {value.slug}
                      {value.referenceValue ? ` · ${value.referenceValue}` : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeValue(value.id)}
                    className="rounded p-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
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
              {loading ? "Saving..." : editingAttribute ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
