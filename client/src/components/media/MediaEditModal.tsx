import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { updateMedia } from "../../api/media.api";
import type { MediaItem } from "../../types/media";

type Props = {
  open: boolean;
  item: MediaItem | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function MediaEditModal({
  open,
  item,
  onClose,
  onSaved,
}: Props) {
  const [title, setTitle] = useState("");
  const [altText, setAltText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setAltText(item.altText || "");
    }
  }, [item, open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!item) return;

    setLoading(true);
    setError("");

    try {
      await updateMedia(item.id, { title, altText });
      toast.success("Media updated");
      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to update media");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-xl font-semibold">Edit media</h2>
        <p className="mt-1 text-sm text-slate-500">
          Update the title and alt text for this file.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Alt text</label>
            <textarea
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
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
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
