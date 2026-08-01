import { Request, Response } from "express";
import prisma from "../../config/prisma.js";

import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";

import { createProductSchema } from "./product.validation.js";

import {
  validateBrand,
  validateCategories,
  validateMedia,
  validateAttributeValues,
  validateVariantAttributeCombination,
  attachCategories,
  attachProductMedia,
  createVariants,
} from "./product.service.js";


//Create product
export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const payload = createProductSchema.parse(req.body);

  const product = await prisma.$transaction(async (tx) => {
    // Validate
    await validateBrand(tx, payload.brandId);

    await validateCategories(tx, payload.categoryIds);

    await validateMedia(tx, payload.media);

    await validateAttributeValues(tx, payload.variants);

    await validateVariantAttributeCombination(tx, payload.variants);

    // Check duplicate slug
    const existingSlug = await tx.product.findUnique({
      where: {
        slug: payload.slug,
      },
    });

    if (existingSlug) {
      throw new ApiError(409, "Product slug already exists");
    }

    // Check duplicate SKU (Simple Product)
    if (!payload.hasVariants && payload.sku) {
      const existingSku = await tx.product.findFirst({
        where: {
          sku: payload.sku,
        },
      });

      if (existingSku) {
        throw new ApiError(409, "Product SKU already exists");
      }
    }

    // Check duplicate Variant SKU
    if (payload.hasVariants) {
      const variantSkus = payload.variants.map((v) => v.sku);

      const existingVariantSku = await tx.productVariant.findFirst({
        where: {
          sku: {
            in: variantSkus,
          },
        },
      });

      if (existingVariantSku) {
        throw new ApiError(
          409,
          `Variant SKU '${existingVariantSku.sku}' already exists`
        );
      }
    }

    // Create Product
    const createdProduct = await tx.product.create({
      data: {
        name: payload.name,

        slug: payload.slug,

        sku: payload.hasVariants ? null : payload.sku,

        shortDescription: payload.shortDescription,

        longDescription: payload.longDescription,

        hasVariants: payload.hasVariants,

        price: payload.hasVariants ? null : payload.price,

        salePrice: payload.hasVariants ? null : payload.salePrice,

        stock: payload.hasVariants ? null : payload.stock,

        stockStatus: payload.hasVariants
          ? null
          : payload.stockStatus,

        weight: payload.weight,

        brandId: payload.brandId,

        isActive: payload.isActive ?? true,

        isFeatured: payload.isFeatured ?? false,

        sortOrder: payload.sortOrder ?? 0,
      },
    });

    // Categories
    await attachCategories(
      tx,
      createdProduct.id,
      payload.categoryIds
    );

    // Product Media
    await attachProductMedia(
      tx,
      createdProduct.id,
      payload.media
    );

    // Variants
    if (payload.hasVariants) {
      await createVariants(
        tx,
        createdProduct.id,
        payload.variants
      );
    }

    return createdProduct;
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      product,
      "Product created successfully"
    )
  );
});



// Get products 

export const getProducts = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const search = req.query.search?.toString();
  const brandId = req.query.brandId?.toString();
  const categoryId = req.query.categoryId?.toString();

  const isActive =
    req.query.isActive !== undefined
      ? req.query.isActive === "true"
      : undefined;

  const isFeatured =
    req.query.isFeatured !== undefined
      ? req.query.isFeatured === "true"
      : undefined;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  if (brandId) {
    where.brandId = brandId;
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  if (isFeatured !== undefined) {
    where.isFeatured = isFeatured;
  }

  if (categoryId) {
    where.categories = {
      some: {
        categoryId,
      },
    };
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,

      skip,

      take: limit,

      orderBy: {
        createdAt: "desc",
      },

      include: {
        brand: true,

        categories: {
          include: {
            category: true,
          },
        },

        variants: true,

        media: {
          where: {
            isThumbnail: true,
          },

          include: {
            media: true,
          },
        },
      },
    }),

    prisma.product.count({
      where,
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        products,

        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      "Products fetched successfully"
    )
  );
});


//Get product by id ( single )
export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const id  = req.params.id as string;

  const product = await prisma.product.findUnique({
    where: {
      id,
    },

    include: {
      brand: true,

      categories: {
        include: {
          category: true,
        },
      },

      media: {
        include: {
          media: true,
        },
      },

      variants: {
        include: {
          attributeValues: {
            include: {
              attributeValue: {
                include: {
                  attribute: true,
                },
              },
            },
          },

          media: {
            include: {
              media: true,
            },
          },
        },
      },
    },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      product,
      "Product fetched successfully"
    )
  );
});


// Delete product
export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  await prisma.product.delete({
    where: {
      id,
    },
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Product deleted successfully"
    )
  );
});


//Update product
export const updateProduct = asyncHandler(async (req: Request, res:Response) => {
  const id = req.params.id as string;

  const payload = createProductSchema.parse(req.body);

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const updatedProduct = await prisma.$transaction(async (tx) => {
    // ----------------------------
    // Validate
    // ----------------------------

    await validateBrand(tx, payload.brandId);

    await validateCategories(tx, payload.categoryIds);

    await validateMedia(tx, payload.media);

    await validateAttributeValues(tx, payload.variants);

    await validateVariantAttributeCombination(
      tx,
      payload.variants
    );

    // Slug Check

    const existingSlug = await tx.product.findFirst({
      where: {
        slug: payload.slug,
        NOT: {
          id,
        },
      },
    });

    if (existingSlug) {
      throw new ApiError(409, "Slug already exists");
    }

    // Product SKU Check

    if (!payload.hasVariants && payload.sku) {
      const existingSku = await tx.product.findFirst({
        where: {
          sku: payload.sku,
          NOT: {
            id,
          },
        },
      });

      if (existingSku) {
        throw new ApiError(409, "SKU already exists");
      }
    }

    // Variant SKU Check

    if (payload.hasVariants) {
      const skus = payload.variants.map((v) => v.sku);

      const existingVariant = await tx.productVariant.findFirst({
        where: {
          sku: {
            in: skus,
          },
          productId: {
            not: id,
          },
        },
      });

      if (existingVariant) {
        throw new ApiError(
          409,
          `Variant SKU '${existingVariant.sku}' already exists`
        );
      }
    }

    // Update Product

    const updated = await tx.product.update({
      where: {
        id,
      },

      data: {
        name: payload.name,

        slug: payload.slug,

        sku: payload.hasVariants
          ? null
          : payload.sku,

        shortDescription:
          payload.shortDescription,

        longDescription:
          payload.longDescription,

        hasVariants: payload.hasVariants,

        price: payload.hasVariants
          ? null
          : payload.price,

        salePrice: payload.hasVariants
          ? null
          : payload.salePrice,

        stock: payload.hasVariants
          ? null
          : payload.stock,

        stockStatus: payload.hasVariants
          ? null
          : payload.stockStatus,

        weight: payload.weight,

        brandId: payload.brandId,

        isActive:
          payload.isActive ?? true,

        isFeatured:
          payload.isFeatured ?? false,

        sortOrder:
          payload.sortOrder ?? 0,
      },
    });

    // Remove Old Categories

    await tx.productCategory.deleteMany({
      where: {
        productId: id,
      },
    });

    // Remove Product Media

    await tx.mediaAttachment.deleteMany({
      where: {
        productId: id,
      },
    });

    // Remove Variants

    await tx.productVariant.deleteMany({
      where: {
        productId: id,
      },
    });

    // Recreate Categories

    await attachCategories(
      tx,
      id,
      payload.categoryIds
    );

    // Recreate Product Media

    await attachProductMedia(
      tx,
      id,
      payload.media
    );

    // Recreate Variants

    if (payload.hasVariants) {
      await createVariants(
        tx,
        id,
        payload.variants
      );
    }

    return updated;
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedProduct,
      "Product updated successfully"
    )
  );
});



//watch: Watch products for monitoring

export const watchProducts = asyncHandler(
  async (req: Request, res: Response) => {
    // Get total counts
    const [totalProducts, activeProducts, featuredProducts, totalVariants] = 
      await prisma.$transaction([
        prisma.product.count(),
        prisma.product.count({ where: { isActive: true } }),
        prisma.product.count({ where: { isFeatured: true } }),
        prisma.productVariant.count(),
      ]);

    // Get simple vs variable product count
    const simpleProducts = await prisma.product.count({
      where: { hasVariants: false },
    });
    const variableProducts = await prisma.product.count({
      where: { hasVariants: true },
    });

    // Get out of stock products count
    const outOfStockProducts = await prisma.product.count({
      where: {
        isActive: true,
        hasVariants: false,
        stockStatus: 'OUT_OF_STOCK',
      },
    });

    // Get low stock products count
    const lowStockProducts = await prisma.product.count({
      where: {
        isActive: true,
        hasVariants: false,
        stockStatus: 'LOW_STOCK',
      },
    });

    // Get recent products (last 5)
    const recentProducts = await prisma.product.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
        categories: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            variants: true,
          },
        },
      },
    });

    // Get low stock products list (top 5)
    const lowStockProductsList = await prisma.product.findMany({
      where: {
        isActive: true,
        hasVariants: false,
        stockStatus: 'LOW_STOCK',
      },
      take: 5,
      select: {
        id: true,
        name: true,
        sku: true,
        stock: true,
        stockStatus: true,
      },
      orderBy: {
        stock: 'asc',
      },
    });

    // Get products by brand (top 5)
    const productsByBrand = await prisma.brand.findMany({
      take: 5,
      orderBy: {
        products: {
          _count: 'desc',
        },
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          overview: {
            totalProducts,
            activeProducts,
            featuredProducts,
            simpleProducts,
            variableProducts,
            totalVariants,
            outOfStockProducts,
            lowStockProducts,
          },
          recentProducts,
          lowStockProducts: lowStockProductsList,
          productsByBrand: productsByBrand.map(brand => ({
            id: brand.id,
            name: brand.name,
            productCount: brand._count.products,
          })),
          timestamp: new Date().toISOString(),
        },
        "Product watch data fetched successfully"
      )
    );
  }
);