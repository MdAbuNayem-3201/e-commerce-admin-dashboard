import { Request, Response } from "express";

import prisma from "../../config/prisma.js";

import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export const getDashboard = asyncHandler(
  async (_req: Request, res: Response) => {
    const [
      totalUsers,
      activeUsers,

      totalRoles,

      totalPermissionGroups,
      totalPermissions,

      totalCategories,

      totalBrands,

      totalAttributes,

      totalProducts,

      activeProducts,

      featuredProducts,

      totalVariants,

      totalMedia,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          deletedAt: null,
        },
      }),

      prisma.user.count({
        where: {
          deletedAt: null,
          isActive: true,
        },
      }),

      prisma.role.count(),

      prisma.permissionGroup.count(),

      prisma.permission.count(),

      prisma.category.count(),

      prisma.brand.count(),

      prisma.attribute.count(),

      prisma.product.count(),

      prisma.product.count({
        where: {
          isActive: true,
        },
      }),

      prisma.product.count({
        where: {
          isFeatured: true,
        },
      }),

      prisma.productVariant.count(),

      prisma.media.count(),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          users: {
            total: totalUsers,
            active: activeUsers,
          },

          roles: totalRoles,

          permissionGroups: totalPermissionGroups,

          permissions: totalPermissions,

          categories: totalCategories,

          brands: totalBrands,

          attributes: totalAttributes,

          products: {
            total: totalProducts,
            active: activeProducts,
            featured: featuredProducts,
          },

          variants: totalVariants,

          media: totalMedia,
        },
        "Dashboard data fetched successfully"
      )
    );
  }
);