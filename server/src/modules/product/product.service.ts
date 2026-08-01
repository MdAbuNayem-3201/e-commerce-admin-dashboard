import {
  StockStatus
} from "../../generated/prisma/enums.js";
import prisma from "../../config/prisma.js";
import { ApiError } from "../../utils/ApiError.js";

type ProductVariantInput = {
  sku: string;
  price: number;
  salePrice?: number;
  stock: number;
  stockStatus: StockStatus;
  weight?: number;
  isActive?: boolean;
  attributeValueIds: string[];
  media?: {
    mediaId: string;
    isThumbnail?: boolean;
    isGallery?: boolean;
    sortOrder?: number;
  }[];
};

export const validateBrand = async (
  tx: any,
  brandId?: string
) => {
  if (!brandId) return;

  const brand = await tx.brand.findUnique({
    where: {
      id: brandId,
    },
    select: {
      id: true,
      status: true,
    },
  });

  if (!brand) {
    throw new ApiError(404, "Brand not found");
  }

  if (brand.status !== "ACTIVE") {
    throw new ApiError(
      400,
      "Inactive brand cannot be assigned to a product"
    );
  }
};



//validate category
export const validateCategories = async (
  tx: any,
  categoryIds: string[]
) => {
  if (!categoryIds.length) return;

  const categories = await tx.category.findMany({
    where: {
      id: {
        in: categoryIds,
      },

      isActive: true,
    },

    select: {
      id: true,
    },
  });

  if (categories.length !== categoryIds.length) {
    throw new ApiError(
      400,
      "One or more categories are invalid or inactive"
    );
  }
};


export const validateMedia = async (
  tx: any,
  media: {
    mediaId: string;
  }[]
) => {
  if (!media.length) return;

  const ids = media.map((m) => m.mediaId);

  const existingMedia = await tx.media.findMany({
    where: {
      id: {
        in: ids,
      },
    },

    select: {
      id: true,
    },
  });

  if (existingMedia.length !== ids.length) {
    throw new ApiError(
      400,
      "One or more media files do not exist"
    );
  }
};


//Validate attribute

export const validateAttributeValues = async (
  tx: any,
  variants: any[]
) => {
  const ids = variants.flatMap(
    (variant) => variant.attributeValueIds
  );

  if (!ids.length) return;

  const values = await tx.attributeValue.findMany({
    where: {
      id: {
        in: ids,
      },
    },

    select: {
      id: true,
      attributeId: true,
    },
  });

  if (values.length !== ids.length) {
    throw new ApiError(
      400,
      "Invalid attribute values supplied"
    );
  }
};



//Validate variant attribute combination

export const validateVariantAttributeCombination = async (
  tx: any,
  variants: {
    attributeValueIds: string[];
  }[]
) => {
  for (const variant of variants) {
    if (!variant.attributeValueIds.length) continue;

    const values = await tx.attributeValue.findMany({
      where: {
        id: {
          in: variant.attributeValueIds,
        },
      },
      select: {
        id: true,
        attributeId: true,
      },
    });

    const attributeIds = values.map(
      (value: any) => value.attributeId
    );

    const uniqueAttributeIds = new Set(attributeIds);

    if (attributeIds.length !== uniqueAttributeIds.size) {
      throw new ApiError(
        400,
        "A product variant cannot contain multiple values from the same attribute."
      );
    }
  }
};


//Attach category

export const attachCategories = async (
  tx: any,
  productId: string,
  categoryIds: string[]
) => {
  if (!categoryIds.length) return;

  await tx.productCategory.createMany({
    data: categoryIds.map((categoryId) => ({
      productId,
      categoryId,
    })),
  });
};

//Attach product media

export const attachProductMedia = async (
  tx: any,
  productId: string,
  media: any
) => {
  if (!media.length) return;

  await tx.mediaAttachment.createMany({
    data: media.map((item: any) => ({
      mediaId: item.mediaId,

      productId,

      isThumbnail:
        item.isThumbnail ?? false,

      isGallery:
        item.isGallery ?? true,

      sortOrder:
        item.sortOrder ?? 0,
    })),
  });
};

//create variant
export const createVariants = async (
  tx: any,
  productId: string,
  variants: ProductVariantInput[]
) => {
  if (!variants.length) return;

  for (const variant of variants) {
    const createdVariant = await tx.productVariant.create({
      data: {
        productId,

        sku: variant.sku,

        price: variant.price,

        salePrice: variant.salePrice,

        stock: variant.stock,

        stockStatus: variant.stockStatus,

        weight: variant.weight,

        isActive: variant.isActive ?? true,
      },

      select: {
        id: true,
      },
    });

    if (variant.attributeValueIds.length > 0) {
      await tx.variantAttributeValue.createMany({
        data: variant.attributeValueIds.map((attributeValueId) => ({
          variantId: createdVariant.id,
          attributeValueId,
        })),
      });
    }
  }
};