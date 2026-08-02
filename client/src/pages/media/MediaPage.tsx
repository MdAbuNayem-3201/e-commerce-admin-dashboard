import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "react-hot-toast";

import { deleteMedia, getMedia } from "../../api/media.api";
import type { MediaItem } from "../../types/media";
import MediaUploadPanel from "../../components/media/MediaUploadPanel";
import MediaGrid from "../../components/media/MediaGrid";
import MediaEditModal from "../../components/media/MediaEditModal";

export default function MediaPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const data = await getMedia({ search: search || undefined, limit: 50 });
      setItems(data.media ?? []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this media item?");
    if (!confirmed) return;

    try {
      await deleteMedia(id);
      toast.success("Media deleted");
      loadMedia();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete media");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Media library
            </h1>
            <p className="text-sm text-slate-500">
              Upload, browse, edit metadata, and manage your files in one place.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2">
            <Search size={16} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search media"
              className="w-48 border-0 bg-transparent text-sm outline-none"
            />
          </div>
        </div>
      </div>

      <MediaUploadPanel onUploaded={loadMedia} />

      <MediaGrid
        items={items.filter((item) =>
          `${item.fileName} ${item.title || ""}`
            .toLowerCase()
            .includes(search.toLowerCase()),
        )}
        loading={loading}
        onEdit={(item) => {
          setSelectedItem(item);
          setIsEditOpen(true);
        }}
        onDelete={handleDelete}
      />

      <MediaEditModal
        open={isEditOpen}
        item={selectedItem}
        onClose={() => {
          setIsEditOpen(false);
          setSelectedItem(null);
        }}
        onSaved={loadMedia}
      />
    </div>
  );
}
