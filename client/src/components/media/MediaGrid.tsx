import { Edit3, Eye, Trash2 } from "lucide-react";
import type { MediaItem } from "../../types/media";

type Props = {
  items: MediaItem[];
  loading: boolean;
  onEdit: (item: MediaItem) => void;
  onDelete: (id: string) => void;
};

export default function MediaGrid({ items, loading, onEdit, onDelete }: Props) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        Loading media...
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
        No media yet.
      </div>
    );
  }

  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <div
          key={item.id}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="aspect-video bg-slate-100">
            {item.mimeType.startsWith("image/") ? (
              <img
                src={item.publicUrl}
                alt={item.altText || item.title || item.fileName}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-slate-50 text-sm text-slate-500">
                {item.type}
              </div>
            )}
          </div>

          <div className="space-y-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-slate-900">
                  {item.title || item.fileName}
                </h3>
                <p className="text-sm text-slate-500">{item.fileName}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                {item.type}
              </span>
            </div>

            <p className="text-sm text-slate-500">
              {item.altText || "No alt text"}
            </p>

            <div className="flex items-center justify-between pt-2">
              <a
                href={item.publicUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600"
              >
                <Eye size={16} />
                Preview
              </a>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(item)}
                  className="rounded p-2 text-blue-600 hover:bg-blue-50"
                  title="Edit metadata"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="rounded p-2 text-red-600 hover:bg-red-50"
                  title="Delete media"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
