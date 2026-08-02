import { Pencil, Trash2 } from "lucide-react";
import type { Product } from "../../types/product";

type Props = {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
};

export default function ProductTable({ products, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Brand</th>
              <th className="px-4 py-3 font-medium">Categories</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-slate-100 text-slate-500">
                      {product.media?.find((item) => item.isThumbnail)?.media
                        ?.publicUrl ? (
                        <img
                          src={
                            product.media.find((item) => item.isThumbnail)
                              ?.media?.publicUrl
                          }
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-xs">IMG</span>
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">
                        {product.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {product.sku || "—"}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {product.brand?.name || "—"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {product.categories
                    ?.map((item) => item.category.name)
                    .join(", ") || "—"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {product.price ? `$${product.price}` : "—"}
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {product.stock ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${product.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      className="rounded p-2 text-blue-600 hover:bg-blue-50"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(product.id)}
                      className="rounded p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
