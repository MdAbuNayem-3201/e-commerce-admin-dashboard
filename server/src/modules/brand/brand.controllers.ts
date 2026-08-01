import { MediaType, BrandStatus } from "../../generated/prisma/enums.js";
import { Request, Response } from "express";

import prisma from "../../config/prisma.js";

import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

import {
  createBrandSchema,
  updateBrandSchema,
} from "./brand.validation.js";


//Create brand

export const createBrand = asyncHandler(
  async (req: Request, res: Response) => {
    const payload = createBrandSchema.parse(req.body);

    const existingBrand = await prisma.brand.findFirst({
      where: {
        OR: [
          { name: payload.name },
          { slug: payload.slug },
        ],
      },
    });

    if (existingBrand) {
      throw new ApiError(
        409,
        "Brand name or slug already exists"
      );
    }

    if (payload.logoId) {
      const media = await prisma.media.findUnique({
        where: {
          id: payload.logoId,
        },
      });

      if (!media) {
        throw new ApiError(404, "Logo not found");
      }
    }

    const brand = await prisma.brand.create({
      data: {
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        logoId: payload.logoId,
        status: payload.status ?? BrandStatus.ACTIVE,
      },
      include: {
        logo: true,
      },
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        brand,
        "Brand created successfully"
      )
    );
  }
);


//Get all brands

export const getBrands = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const search = req.query.search?.toString();

    const status = req.query.status as BrandStatus | undefined;

    const where: any = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          slug: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [brands, total] =
      await prisma.$transaction([
        prisma.brand.findMany({
          where,
          include: {
            logo: true,

            _count: {
              select: {
                products: true,
              },
            },
          },

          skip,
          take: limit,

          orderBy: {
            createdAt: "desc",
          },
        }),

        prisma.brand.count({
          where,
        }),
      ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          brands,

          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        "Brands fetched successfully"
      )
    );
  }
);


//Get brand by id (single)

export const getBrandById = asyncHandler(
  async (req: Request, res: Response) => {
    const brand = await prisma.brand.findUnique({
      where: {
        id: req.params.id as string,
      },

      include: {
        logo: true,

        products: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },

        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!brand) {
      throw new ApiError(404, "Brand not found");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        brand,
        "Brand fetched successfully"
      )
    );
  }
);


//Update a brand

export const updateBrand = asyncHandler(
  async (req: Request, res: Response) => {
    const payload = updateBrandSchema.parse(req.body);

    const brand = await prisma.brand.findUnique({
      where: {
        id: req.params.id as string,
      },
    });

    if (!brand) {
      throw new ApiError(404, "Brand not found");
    }

    if (payload.name && payload.name !== brand.name) {
      const existingName = await prisma.brand.findUnique({
        where: {
          name: payload.name,
        },
      });

      if (existingName) {
        throw new ApiError(409, "Brand name already exists");
      }
    }

    if (payload.slug && payload.slug !== brand.slug) {
      const existingSlug = await prisma.brand.findUnique({
        where: {
          slug: payload.slug,
        },
      });

      if (existingSlug) {
        throw new ApiError(409, "Brand slug already exists");
      }
    }

    if (payload.logoId) {
      const media = await prisma.media.findUnique({
        where: {
          id: payload.logoId,
        },
      });

      if (!media) {
        throw new ApiError(404, "Logo not found");
      }
    }

    const updatedBrand = await prisma.brand.update({
      where: {
        id: req.params.id as string,
      },

      data: payload,

      include: {
        logo: true,
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        updatedBrand,
        "Brand updated successfully"
      )
    );
  }
);


//Delete brand
export const deleteBrand = asyncHandler(
  async (req: Request, res:Response) => {
    const brand = await prisma.brand.findUnique({
      where: {
        id: req.params.id as string,
      },

      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!brand) {
      throw new ApiError(404, "Brand not found");
    }

    if (brand._count.products > 0) {
      throw new ApiError(
        400,
        "Cannot delete brand because it contains products"
      );
    }

    await prisma.brand.delete({
      where: {
        id: brand.id,
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        null,
        "Brand deleted successfully"
      )
    );
  }
);



//watch brand for monitoring

export const watchBrands = asyncHandler(
  async (req: Request, res: Response) => {
    // Get total counts
    const [totalBrands, activeBrands, inactiveBrands] = await prisma.$transaction([
      prisma.brand.count(),
      prisma.brand.count({ where: { status: BrandStatus.ACTIVE } }),
      prisma.brand.count({ where: { status: BrandStatus.INACTIVE } }),
    ]);

    // Get recent brands (last 5)
    const recentBrands = await prisma.brand.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        logo: {
          select: {
            publicUrl: true,
            thumbnailUrl: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    // Get brands with most products (top 5)
    const topBrands = await prisma.brand.findMany({
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
      where: {
        status: BrandStatus.ACTIVE,
      },
    });

    // Get brands with no products
    const emptyBrands = await prisma.brand.count({
      where: {
        products: {
          none: {},
        },
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalBrands,
          activeBrands,
          inactiveBrands,
          emptyBrands,
          recentBrands,
          topBrands: topBrands.map(brand => ({
            id: brand.id,
            name: brand.name,
            productCount: brand._count.products,
          })),
          timestamp: new Date().toISOString(),
        },
        "Brand watch data fetched successfully"
      )
    );
  }
);

