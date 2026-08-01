import { StockStatus } from "../../generated/prisma/enums.js";
import { z } from "zod";

/* Media */

const mediaSchema = z.object({
  mediaId: z.string().cuid(),

  isThumbnail: z.boolean().optional(),

  isGallery: z.boolean().optional(),

  sortOrder: z.coerce.number().int().optional(),
});

/* Variant */

const variantSchema = z
  .object({
    sku: z.string().trim().min(2).max(100),

    price: z.coerce.number().positive(),

    salePrice: z.coerce.number().positive().optional(),

    stock: z.coerce.number().int().min(0),

    stockStatus: z.nativeEnum(StockStatus),

    weight: z.coerce.number().positive().optional(),

    isActive: z.boolean().optional(),

    attributeValueIds: z.array(z.string().cuid()).min(1),

    media: z.array(mediaSchema).optional(),
  })
  .superRefine((variant, ctx) => {
    if (
      variant.salePrice !== undefined &&
      variant.salePrice > variant.price
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["salePrice"],
        message: "Sale price cannot exceed regular price.",
      });
    }
  });

/* Product */

export const createProductSchema = z
  .object({
    name: z.string().trim().min(2).max(255),

    slug: z.string().trim().min(2).max(255),

    sku: z.string().trim().max(100).optional(),

    shortDescription: z.string().optional(),

    longDescription: z.string().optional(),

    hasVariants: z.boolean(),

    price: z.coerce.number().positive().optional(),

    salePrice: z.coerce.number().positive().optional(),

    stock: z.coerce.number().int().min(0).optional(),

    stockStatus: z.nativeEnum(StockStatus).optional(),

    weight: z.coerce.number().positive().optional(),

    brandId: z.string().cuid().optional(),

    isActive: z.boolean().optional(),

    isFeatured: z.boolean().optional(),

    sortOrder: z.coerce.number().int().optional(),

    categoryIds: z.array(z.string().cuid()).default([]),

    media: z.array(mediaSchema).default([]),

    variants: z.array(variantSchema).default([]),
  })
  .superRefine((data, ctx) => {
    // Simple Product

    if (!data.hasVariants) {
      if (!data.sku) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sku"],
          message: "SKU is required.",
        });
      }

      if (data.price === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["price"],
          message: "Price is required.",
        });
      }

      if (data.stock === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["stock"],
          message: "Stock is required.",
        });
      }

      if (data.variants.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variants"],
          message: "Simple products cannot contain variants.",
        });
      }
    }

    // Variable Product

    if (data.hasVariants) {
      if (data.variants.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variants"],
          message: "At least one variant is required.",
        });
      }

      if (data.sku) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sku"],
          message: "Do not provide product SKU for variable products.",
        });
      }

      if (data.price !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["price"],
          message: "Price belongs to variants.",
        });
      }

      if (data.stock !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["stock"],
          message: "Stock belongs to variants.",
        });
      }
    }

    // Product Sale Price

    if (
      data.salePrice !== undefined &&
      data.price !== undefined &&
      data.salePrice > data.price
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["salePrice"],
        message: "Sale price cannot exceed regular price.",
      });
    }

    // Duplicate Categories

    if (
      new Set(data.categoryIds).size !==
      data.categoryIds.length
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["categoryIds"],
        message: "Duplicate categories are not allowed.",
      });
    }

    // Product Thumbnail

    const productThumbs = data.media.filter(
      (m) => m.isThumbnail
    );

    if (productThumbs.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["media"],
        message: "Only one product thumbnail is allowed.",
      });
    }

    // Duplicate Variant SKU

    const skuSet = new Set<string>();

    for (const variant of data.variants) {
      if (skuSet.has(variant.sku)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variants"],
          message: `Duplicate variant SKU: ${variant.sku}`,
        });
      }

      skuSet.add(variant.sku);

      const thumbs = variant.media?.filter(
        (m) => m.isThumbnail
      );

      if (thumbs && thumbs.length > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variants"],
          message: `Variant ${variant.sku} has multiple thumbnails.`,
        });
      }

      const combination = [...variant.attributeValueIds]
        .sort()
        .join("-");

      if (
        data.variants.filter(
          (v) =>
            [...v.attributeValueIds].sort().join("-") ===
            combination
        ).length > 1
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variants"],
          message: "Duplicate variant attribute combination.",
        });
      }
    }
  });



// WITH THIS:
export const updateProductSchema = z
  .object({
    name: z.string().trim().min(2).max(255).optional(),
    slug: z.string().trim().min(2).max(255).optional(),
    sku: z.string().trim().max(100).optional(),
    shortDescription: z.string().optional(),
    longDescription: z.string().optional(),
    hasVariants: z.boolean().optional(),
    price: z.coerce.number().positive().optional(),
    salePrice: z.coerce.number().positive().optional(),
    stock: z.coerce.number().int().min(0).optional(),
    stockStatus: z.nativeEnum(StockStatus).optional(),
    weight: z.coerce.number().positive().optional(),
    brandId: z.string().cuid().optional(),
    isActive: z.boolean().optional(),
    isFeatured: z.boolean().optional(),
    sortOrder: z.coerce.number().int().optional(),
    categoryIds: z.array(z.string().cuid()).optional(),
    media: z.array(mediaSchema).optional(),
    variants: z.array(variantSchema).optional(),
  })
  .superRefine((data, ctx) => {
    // Simple Product Validation (only if hasVariants is explicitly set to false)
    if (data.hasVariants === false) {
      if (data.price === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["price"],
          message: "Price is required for simple products.",
        });
      }

      if (data.stock === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["stock"],
          message: "Stock is required for simple products.",
        });
      }

      if (data.variants && data.variants.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variants"],
          message: "Simple products cannot contain variants.",
        });
      }
    }

    // Variable Product Validation (only if hasVariants is explicitly set to true)
    if (data.hasVariants === true) {
      if (!data.variants || data.variants.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["variants"],
          message: "At least one variant is required for variable products.",
        });
      }

      if (data.price !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["price"],
          message: "Price belongs to variants, not the product.",
        });
      }

      if (data.stock !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["stock"],
          message: "Stock belongs to variants, not the product.",
        });
      }
    }

    // Product Sale Price
    if (
      data.salePrice !== undefined &&
      data.price !== undefined &&
      data.salePrice > data.price
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["salePrice"],
        message: "Sale price cannot exceed regular price.",
      });
    }

    // Duplicate Categories (if provided)
    if (data.categoryIds) {
      if (new Set(data.categoryIds).size !== data.categoryIds.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["categoryIds"],
          message: "Duplicate categories are not allowed.",
        });
      }
    }

    // Product Thumbnail (if media provided)
    if (data.media) {
      const productThumbs = data.media.filter((m) => m.isThumbnail);

      if (productThumbs.length > 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["media"],
          message: "Only one product thumbnail is allowed.",
        });
      }
    }

    // Validate variants (if provided)
    if (data.variants) {
      const skuSet = new Set<string>();

      for (const variant of data.variants) {
        if (skuSet.has(variant.sku)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["variants"],
            message: `Duplicate variant SKU: ${variant.sku}`,
          });
        }

        skuSet.add(variant.sku);

        const thumbs = variant.media?.filter((m) => m.isThumbnail);

        if (thumbs && thumbs.length > 1) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["variants"],
            message: `Variant ${variant.sku} has multiple thumbnails.`,
          });
        }

        const combination = [...variant.attributeValueIds]
          .sort()
          .join("-");

        if (
          data.variants.filter(
            (v) =>
              [...v.attributeValueIds].sort().join("-") ===
              combination
          ).length > 1
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["variants"],
            message: "Duplicate variant attribute combination.",
          });
        }
      }
    }
});