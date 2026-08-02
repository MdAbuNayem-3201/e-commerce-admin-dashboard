import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

import { getBrands } from "../../api/brand.api";
import { getCategories } from "../../api/category.api";
import { getAttributes } from "../../api/attribute.api";
import { getMedia } from "../../api/media.api";
import { createProduct, updateProduct } from "../../api/product.api";
import type { Product, ProductVariant } from "../../types/product";
import type { Brand } from "../../types/brand";
import type { Category } from "../../types/category";
import type { Attribute } from "../../types/attribute";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  editingProduct?: Product | null;
};

type MediaOption = {
  id: string;
  publicUrl: string;
  title?: string | null;
  altText?: string | null;
};

type FormState = {
  name: string;
  slug: string;
  sku: string;
  shortDescription: string;
  longDescription: string;
  hasVariants: boolean;
  price: string;
  salePrice: string;
  stock: string;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK";
  weight: string;
  brandId: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: string;
  categoryIds: string[];
  media: Array<{
    mediaId: string;
    isThumbnail?: boolean;
    isGallery?: boolean;
    sortOrder?: number;
  }>;
  variants: ProductVariant[];
};

const emptyVariant = (): ProductVariant => ({
  sku: "",
  price: 0,
  salePrice: 0,
  stock: 0,
  stockStatus: "IN_STOCK",
  weight: 0,
  isActive: true,
  attributeValueIds: [],
  media: [],
});

const initialForm = (): FormState => ({
  name: "",
  slug: "",
  sku: "",
  shortDescription: "",
  longDescription: "",
  hasVariants: false,
  price: "",
  salePrice: "",
  stock: "",
  stockStatus: "IN_STOCK",
  weight: "",
  brandId: "",
  isActive: true,
  isFeatured: false,
  sortOrder: "0",
  categoryIds: [],
  media: [],
  variants: [],
});

export default function ProductFormModal({
  open,
  onClose,
  onSaved,
  editingProduct,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaOption[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [activeTab, setActiveTab] = useState<
    "details" | "associations" | "variants"
  >("details");

  useEffect(() => {
    if (!open) return;
    const loadData = async () => {
      try {
        const [brandData, categoryData, attributeData, mediaData] =
          await Promise.all([
            getBrands(),
            getCategories(),
            getAttributes(),
            getMedia({ limit: 50 }),
          ]);
        setBrands((brandData?.brands ?? brandData ?? []) as Brand[]);
        setCategories(
          (categoryData?.categories ?? categoryData ?? []) as Category[],
        );
        setAttributes(
          (attributeData?.attributes ?? attributeData ?? []) as Attribute[],
        );
        setMediaItems(
          (mediaData?.media ??
            mediaData?.items ??
            mediaData ??
            []) as MediaOption[],
        );
      } catch {
        toast.error("Failed to load product form data");
      }
    };

    if (editingProduct) {
      setForm({
        name: editingProduct.name ?? "",
        slug: editingProduct.slug ?? "",
        sku: editingProduct.sku ?? "",
        shortDescription: editingProduct.shortDescription ?? "",
        longDescription: editingProduct.longDescription ?? "",
        hasVariants: editingProduct.hasVariants ?? false,
        price: editingProduct.price?.toString() ?? "",
        salePrice: editingProduct.salePrice?.toString() ?? "",
        stock: editingProduct.stock?.toString() ?? "",
        stockStatus:
          (editingProduct.stockStatus as FormState["stockStatus"]) ??
          "IN_STOCK",
        weight: editingProduct.weight?.toString() ?? "",
        brandId: editingProduct.brandId ?? "",
        isActive: editingProduct.isActive ?? true,
        isFeatured: editingProduct.isFeatured ?? false,
        sortOrder: editingProduct.sortOrder?.toString() ?? "0",
        categoryIds:
          editingProduct.categories?.map((item) => item.category.id) ?? [],
        media: (editingProduct.media ?? []).map((item) => ({
          mediaId: item.mediaId,
          isThumbnail: item.isThumbnail ?? false,
          isGallery: item.isGallery ?? true,
          sortOrder: item.sortOrder ?? 0,
        })),
        variants: (editingProduct.variants ?? []).map((variant) => ({
          ...variant,
          attributeValueIds: variant.attributeValueIds ?? [],
        })),
      });
    } else {
      setForm(initialForm());
    }

    loadData();
  }, [open, editingProduct]);

  const attributeOptions = useMemo(() => {
    return attributes.flatMap((attribute) =>
      (attribute.values ?? []).map((value) => ({ ...value, attribute })),
    );
  }, [attributes]);

  const addVariant = () => {
    setForm((current) => ({
      ...current,
      variants: [...current.variants, emptyVariant()],
    }));
  };

  const updateVariant = (index: number, updates: Partial<ProductVariant>) => {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...updates } : variant,
      ),
    }));
  };

  const removeVariant = (index: number) => {
    setForm((current) => ({
      ...current,
      variants: current.variants.filter(
        (_, variantIndex) => variantIndex !== index,
      ),
    }));
  };

  const toggleMediaSelection = (mediaId: string) => {
    setForm((current) => {
      const exists = current.media.some((item) => item.mediaId === mediaId);
      return {
        ...current,
        media: exists
          ? current.media.filter((item) => item.mediaId !== mediaId)
          : [
              ...current.media,
              {
                mediaId,
                isThumbnail: current.media.length === 0,
                isGallery: true,
                sortOrder: current.media.length,
              },
            ],
      };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...form,
        price: form.hasVariants ? undefined : Number(form.price || 0),
        salePrice: form.hasVariants ? undefined : Number(form.salePrice || 0),
        stock: form.hasVariants ? undefined : Number(form.stock || 0),
        stockStatus: form.hasVariants ? undefined : form.stockStatus,
        weight: form.weight ? Number(form.weight) : undefined,
        sortOrder: Number(form.sortOrder || 0),
        media: form.media,
        variants: form.variants.map((variant) => ({
          ...variant,
          price: Number(variant.price || 0),
          salePrice: variant.salePrice ? Number(variant.salePrice) : undefined,
          stock: Number(variant.stock || 0),
          weight: variant.weight ? Number(variant.weight) : undefined,
        })),
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        toast.success("Product updated");
      } else {
        await createProduct(payload);
        toast.success("Product created");
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Unable to save product");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {editingProduct ? "Edit product" : "Create product"}
            </h2>
            <p className="text-sm text-slate-500">
              Create simple or variable products with media, categories, brands,
              and variants.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            Close
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="mt-5 flex gap-2 rounded-xl bg-slate-100 p-1">
          {[
            { key: "details", label: "Details" },
            { key: "associations", label: "Brand & Categories" },
            { key: "variants", label: "Media & Variants" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`rounded-lg px-3 py-2 text-sm font-medium ${activeTab === tab.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {activeTab === "details" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
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
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Short description
                  </label>
                  <textarea
                    value={form.shortDescription}
                    onChange={(e) =>
                      setForm({ ...form, shortDescription: e.target.value })
                    }
                    className="min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Long description
                  </label>
                  <textarea
                    value={form.longDescription}
                    onChange={(e) =>
                      setForm({ ...form, longDescription: e.target.value })
                    }
                    className="min-h-32 w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      checked={form.hasVariants}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          hasVariants: e.target.checked,
                          variants: e.target.checked ? form.variants : [],
                        })
                      }
                    />{" "}
                    Variable product
                  </label>
                  <p className="mt-2 text-sm text-slate-500">
                    Turn this on to manage variants and attribute-driven
                    combinations.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      SKU
                    </label>
                    <input
                      value={form.sku}
                      onChange={(e) =>
                        setForm({ ...form, sku: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      disabled={form.hasVariants}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Price
                    </label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      disabled={form.hasVariants}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Sale price
                    </label>
                    <input
                      type="number"
                      value={form.salePrice}
                      onChange={(e) =>
                        setForm({ ...form, salePrice: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      disabled={form.hasVariants}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={(e) =>
                        setForm({ ...form, stock: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      disabled={form.hasVariants}
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Stock status
                    </label>
                    <select
                      value={form.stockStatus}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          stockStatus: e.target
                            .value as FormState["stockStatus"],
                        })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                      disabled={form.hasVariants}
                    >
                      <option value="IN_STOCK">In stock</option>
                      <option value="LOW_STOCK">Low stock</option>
                      <option value="OUT_OF_STOCK">Out of stock</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      Weight
                    </label>
                    <input
                      type="number"
                      value={form.weight}
                      onChange={(e) =>
                        setForm({ ...form, weight: e.target.value })
                      }
                      className="w-full rounded-lg border border-slate-300 px-3 py-2"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "associations" && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Brand</label>
                <select
                  value={form.brandId}
                  onChange={(e) =>
                    setForm({ ...form, brandId: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="">Select brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
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
                    setForm({ ...form, sortOrder: e.target.value })
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">
                  Categories
                </label>
                <div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-2">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center gap-2 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={form.categoryIds.includes(category.id)}
                        onChange={() =>
                          setForm((current) => ({
                            ...current,
                            categoryIds: current.categoryIds.includes(
                              category.id,
                            )
                              ? current.categoryIds.filter(
                                  (id) => id !== category.id,
                                )
                              : [...current.categoryIds, category.id],
                          }))
                        }
                      />
                      {category.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm({ ...form, isActive: e.target.checked })
                    }
                  />{" "}
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) =>
                      setForm({ ...form, isFeatured: e.target.checked })
                    }
                  />{" "}
                  Featured
                </label>
              </div>
            </div>
          )}

          {activeTab === "variants" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Media library
                    </h3>
                    <p className="text-sm text-slate-500">
                      Pick images for the product gallery and set one as the
                      thumbnail.
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {mediaItems.map((item) => {
                    const selected = form.media.some(
                      (entry) => entry.mediaId === item.id,
                    );
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleMediaSelection(item.id)}
                        className={`rounded-2xl border p-2 text-left ${selected ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white"}`}
                      >
                        <img
                          src={item.publicUrl}
                          alt={item.title ?? "media"}
                          className="h-24 w-full rounded-xl object-cover"
                        />
                        <div className="mt-2 text-sm font-medium text-slate-700">
                          {item.title || "Untitled"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">Variants</h3>
                    <p className="text-sm text-slate-500">
                      Choose attributes and values, then generate variant SKUs,
                      prices, stock, and images.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                  >
                    <Plus size={16} /> Add variant
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {form.variants.map((variant, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-slate-900">
                          Variant {index + 1}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="rounded p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="mt-3 grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-sm font-medium">
                            SKU
                          </label>
                          <input
                            value={variant.sku}
                            onChange={(e) =>
                              updateVariant(index, { sku: e.target.value })
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium">
                            Price
                          </label>
                          <input
                            type="number"
                            value={variant.price}
                            onChange={(e) =>
                              updateVariant(index, {
                                price: Number(e.target.value),
                              })
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium">
                            Sale price
                          </label>
                          <input
                            type="number"
                            value={variant.salePrice ?? ""}
                            onChange={(e) =>
                              updateVariant(index, {
                                salePrice: Number(e.target.value),
                              })
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium">
                            Stock
                          </label>
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(e) =>
                              updateVariant(index, {
                                stock: Number(e.target.value),
                              })
                            }
                            className="w-full rounded-lg border border-slate-300 px-3 py-2"
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="mb-2 block text-sm font-medium">
                          Attribute values
                        </label>
                        <div className="grid gap-2 md:grid-cols-2">
                          {attributeOptions.map((option) => (
                            <label
                              key={`${option.attribute.id}-${option.id}`}
                              className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700"
                            >
                              <input
                                type="checkbox"
                                checked={variant.attributeValueIds.includes(
                                  option.id,
                                )}
                                onChange={() => {
                                  const next =
                                    variant.attributeValueIds.includes(
                                      option.id,
                                    )
                                      ? variant.attributeValueIds.filter(
                                          (id) => id !== option.id,
                                        )
                                      : [
                                          ...variant.attributeValueIds,
                                          option.id,
                                        ];
                                  updateVariant(index, {
                                    attributeValueIds: next,
                                  });
                                }}
                              />
                              {option.attribute.name}: {option.value}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
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
              {loading ? "Saving..." : editingProduct ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
