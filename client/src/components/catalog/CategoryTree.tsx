import { FolderTree } from "lucide-react";
import type { Category } from "../../types/category";

type Props = {
  items: Category[];
  onEdit: (item: Category) => void;
  onDelete: (id: string) => void;
};

type CategoryNodeProps = {
  item: Category;
  onEdit: (item: Category) => void;
  onDelete: (id: string) => void;
};

function CategoryNode({ item, onEdit, onDelete }: CategoryNodeProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FolderTree size={16} className="text-slate-500" />
          <div>
            <div className="font-semibold text-slate-900">{item.name}</div>
            <div className="text-sm text-slate-500">{item.slug}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${item.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}
          >
            {item.isActive ? "Active" : "Inactive"}
          </span>
          <button
            onClick={() => onEdit(item)}
            className="rounded px-2 py-1 text-sm text-blue-600 hover:bg-blue-50"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(item.id)}
            className="rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>

      {item.children?.length ? (
        <div className="mt-4 space-y-3 border-l border-slate-200 pl-4">
          {item.children.map((child) => (
            <CategoryNode
              key={child.id}
              item={child}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function CategoryTree({ items, onEdit, onDelete }: Props) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <CategoryNode
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
