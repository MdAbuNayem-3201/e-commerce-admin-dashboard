import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { toast } from "react-hot-toast";

import { uploadMedia } from "../../api/media.api";

type Props = {
  onUploaded: () => void;
};

export default function MediaUploadPanel({ onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const handleSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    setFiles(selectedFiles);
    setError("");
  };

  const handleUpload = async () => {
    if (!files.length) return;

    setUploading(true);
    setProgress(0);
    setError("");

    try {
      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        await uploadMedia(file, file.name.replace(/\.[^/.]+$/, ""), "");
        setProgress(Math.round(((index + 1) / files.length) * 100));
      }

      toast.success("Files uploaded successfully");
      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
      onUploaded();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      setProgress(100);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Upload files</h2>
          <p className="text-sm text-slate-500">
            Add images, videos, or documents to your media library.
          </p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <UploadCloud size={16} />
          Pick files
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleSelect}
      />

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <div
              key={`${file.name}-${file.size}`}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
            >
              <span className="truncate">{file.name}</span>
              <button
                onClick={() =>
                  setFiles((current) => current.filter((item) => item !== file))
                }
                className="text-slate-500 hover:text-red-600"
              >
                <X size={16} />
              </button>
            </div>
          ))}

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => {
                setFiles([]);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              Clear
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {uploading ? `Uploading ${progress}%` : "Upload"}
            </button>
          </div>

          {uploading && (
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
