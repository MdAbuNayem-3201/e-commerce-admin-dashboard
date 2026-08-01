import { Request, Response } from "express";
import prisma from "../../config/prisma.js";

import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation.js";

//Create category

export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const payload = createCategorySchema.parse(req.body);

    const existingCategory = await prisma.category.findUnique({
      where: {
        slug: payload.slug,
      },
    });

    if (existingCategory) {
      throw new ApiError(409, "Category slug already exists");
    }

    if (payload.parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: {
          id: payload.parentId,
        },
      });

      if (!parentCategory) {
        throw new ApiError(404, "Parent category not found");
      }
    }

    if (payload.imageId) {
      const media = await prisma.media.findUnique({
        where: {
          id: payload.imageId,
        },
      });

      if (!media) {
        throw new ApiError(404, "Image not found");
      }
    }

    const category = await prisma.category.create({
      data: {
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        imageId: payload.imageId,
        parentId: payload.parentId,
        sortOrder: payload.sortOrder ?? 0,
        isActive: payload.isActive ?? true,
      },
      include: {
        image: true,
        parent: true,
      },
    });

    return res
      .status(201)
      .json(new ApiResponse(201, category, "Category created successfully"));
  },
);

//Get categories(all)
export const getCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const search = req.query.search?.toString();

    const parentId = req.query.parentId?.toString();

    const isActive =
      req.query.isActive !== undefined
        ? req.query.isActive === "true"
        : undefined;

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

    if (parentId) {
      where.parentId = parentId;
    }

    if (typeof isActive === "boolean") {
      where.isActive = isActive;
    }

    const [categories, total] = await prisma.$transaction([
      prisma.category.findMany({
        where,
        include: {
          image: true,
          parent: true,

          _count: {
            select: {
              products: true,
              children: true,
            },
          },
        },

        skip,
        take: limit,

        orderBy: [
          {
            sortOrder: "asc",
          },
          {
            name: "asc",
          },
        ],
      }),

      prisma.category.count({
        where,
      }),
    ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          categories,

          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        "Categories fetched successfully",
      ),
    );
  },
);

//Get category tree
export const getCategoryTree = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      include: {
        image: true,
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          name: "asc",
        },
      ],
    });

    const buildTree = (parentId: string | null = null): any => {
      return categories
        .filter((category) => category.parentId === parentId)
        .map((category): any => ({
          ...category,
          children: buildTree(category.id),
        }));
    };

    const categoryTree = buildTree();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          categoryTree,
          "Category tree fetched successfully",
        ),
      );
  },
);

//Get category by id

// category.controllers.ts - Replace your getCategoryById with this

//Get category by id with full nested tree (all descendants)
export const getCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    // Helper function to recursively get category with all children
    const getCategoryWithChildren = async (
      categoryId: string,
    ): Promise<any> => {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        include: {
          image: true,
          parent: true,
          _count: {
            select: {
              products: true,
              children: true,
            },
          },
        },
      });

      if (!category) return null;

      // Get all direct children
      const children = await prisma.category.findMany({
        where: { parentId: categoryId },
        include: {
          image: true,
          _count: {
            select: {
              products: true,
              children: true,
            },
          },
        },
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      });

      // Recursively get children for each child
      const childrenWithDescendants = await Promise.all(
        children.map(async (child) => {
          const childWithDescendants = await getCategoryWithChildren(child.id);
          return childWithDescendants;
        }),
      );

      return {
        ...category,
        children: childrenWithDescendants.filter(Boolean),
      };
    };

    // Get category with full tree
    const categoryWithTree = await getCategoryWithChildren(
      req.params.id as string,
    );

    if (!categoryWithTree) {
      throw new ApiError(404, "Category not found");
    }

    // Get full path from root to this category
    const getPath = async (categoryId: string): Promise<any[]> => {
      const path: any[] = [];
      let currentId: string | null = categoryId;

      while (currentId) {
        const category:any = await prisma.category.findUnique({
          where: { id: currentId },
          select: {
            id: true,
            name: true,
            slug: true,
            parentId: true,
          },
        });

        if (!category) break;
        path.unshift(category);
        currentId = category.parentId;
      }

      return path;
    };

    const path = await getPath(req.params.id as string);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          ...categoryWithTree,
          path: path,
          fullPath: path.map((p) => p.name).join(" > "),
        },
        "Category fetched successfully",
      ),
    );
  },
);

//Update category

export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const payload = updateCategorySchema.parse(req.body);

    const category = await prisma.category.findUnique({
      where: {
        id: req.params.id as string,
      },
    });

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    if (payload.parentId && payload.parentId === category.id) {
      throw new ApiError(400, "Category cannot be its own parent");
    }

    if (payload.parentId) {
      const parent = await prisma.category.findUnique({
        where: {
          id: payload.parentId,
        },
      });

      if (!parent) {
        throw new ApiError(404, "Parent category not found");
      }
    }

    if (payload.slug && payload.slug !== category.slug) {
      const slugExists = await prisma.category.findUnique({
        where: {
          slug: payload.slug,
        },
      });

      if (slugExists) {
        throw new ApiError(409, "Slug already exists");
      }
    }

    if (payload.imageId) {
      const media = await prisma.media.findUnique({
        where: {
          id: payload.imageId,
        },
      });

      if (!media) {
        throw new ApiError(404, "Image not found");
      }
    }

    const updatedCategory = await prisma.category.update({
      where: {
        id: req.params.id as string,
      },
      data: payload,
      include: {
        image: true,
        parent: true,
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedCategory, "Category updated successfully"),
      );
  },
);

//Delete category(single)
export const deleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await prisma.category.findUnique({
      where: {
        id: req.params.id as string,
      },
      include: {
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new ApiError(404, "Category not found");
    }

    if (category._count.children > 0) {
      throw new ApiError(400, "Cannot delete category with child categories");
    }

    if (category._count.products > 0) {
      throw new ApiError(400, "Cannot delete category that contains products");
    }

    await prisma.category.delete({
      where: {
        id: category.id,
      },
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Category deleted successfully"));
  },
);

//watch

// Add this to your category.controller.ts

/**
 * Watch categories for real-time monitoring
 * route   GET /api/v1/categories/watch
 */
export const watchCategories = asyncHandler(
  async (req: Request, res: Response) => {
    // Get total counts
    const [
      totalCategories,
      activeCategories,
      inactiveCategories,
      totalProducts,
    ] = await prisma.$transaction([
      prisma.category.count(),
      prisma.category.count({ where: { isActive: true } }),
      prisma.category.count({ where: { isActive: false } }),
      prisma.product.count(),
    ]);

    // Get recent activity (last 10 created/updated categories)
    const recentCategories = await prisma.category.findMany({
      take: 10,
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        image: {
          select: {
            publicUrl: true,
            thumbnailUrl: true,
          },
        },
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            products: true,
            children: true,
          },
        },
      },
    });

    // Get categories with most products
    const topCategories = await prisma.category.findMany({
      take: 5,
      orderBy: {
        products: {
          _count: "desc",
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
        isActive: true,
      },
    });

    // Get category tree depth statistics
    const allCategories = await prisma.category.findMany({
      select: {
        id: true,
        parentId: true,
      },
    });

    const maxDepth = calculateMaxDepth(allCategories);

    // Get categories with no products (for cleanup suggestions)
    const emptyCategories = await prisma.category.findMany({
      where: {
        isActive: true,
        products: {
          none: {},
        },
      },
      take: 5,
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Get recent category changes (example: categories created in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const newCategories = await prisma.category.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      include: {
        parent: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Get category status distribution
    const statusDistribution = await prisma.category.groupBy({
      by: ["isActive"],
      _count: {
        _all: true,
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          overview: {
            totalCategories,
            activeCategories,
            inactiveCategories,
            totalProducts,
            categoryToProductRatio:
              totalCategories > 0
                ? (totalProducts / totalCategories).toFixed(2)
                : 0,
          },
          recentActivity: {
            recentCategories,
            newCategoriesLast7Days: newCategories.length,
            categoriesWithMostProducts: topCategories,
          },
          healthMetrics: {
            emptyCategories: emptyCategories.length,
            maxDepth,
            statusDistribution,
            categoriesWithNoParent: await prisma.category.count({
              where: { parentId: null },
            }),
          },
          insights: {
            emptyCategoriesList: emptyCategories,
            newCategoriesList: newCategories.slice(0, 5),
          },
          timestamp: new Date().toISOString(),
        },
        "Category watch data fetched successfully",
      ),
    );
  },
);

// Helper function to calculate max depth of category tree
function calculateMaxDepth(
  categories: { id: string; parentId: string | null }[],
): number {
  const categoryMap = new Map<string, string | null>();
  categories.forEach((cat) => {
    categoryMap.set(cat.id, cat.parentId);
  });

  const getDepth = (
    categoryId: string,
    visited: Set<string> = new Set(),
  ): number => {
    // Prevent infinite loops
    if (visited.has(categoryId)) return 0;
    visited.add(categoryId);

    const parentId = categoryMap.get(categoryId);
    if (!parentId) return 1;

    return 1 + getDepth(parentId, visited);
  };

  let maxDepth = 0;
  categoryMap.forEach((_, categoryId) => {
    const depth = getDepth(categoryId);
    maxDepth = Math.max(maxDepth, depth);
  });

  return maxDepth;
}
