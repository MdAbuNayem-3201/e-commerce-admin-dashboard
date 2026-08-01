import { AttributeType } from "../../generated/prisma/enums.js";
import { Request, Response } from "express";

import prisma from "../../config/prisma.js";

import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

import {
  createAttributeSchema,
  updateAttributeSchema,
  createAttributeValueSchema,
  updateAttributeValueSchema
} from "./attribute.validation.js";


//Create Attribute

export const createAttribute = asyncHandler(
  async (req: Request, res: Response) => {
    const payload = createAttributeSchema.parse(req.body);

    const existingAttribute = await prisma.attribute.findFirst({
      where: {
        OR: [
          {
            name: payload.name,
          },
          {
            slug: payload.slug,
          },
        ],
      },
    });

    if (existingAttribute) {
      throw new ApiError(
        409,
        "Attribute name or slug already exists"
      );
    }

    const attribute = await prisma.attribute.create({
      data: payload,
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        attribute,
        "Attribute created successfully"
      )
    );
  }
);


//Get all attributes

export const getAttributes = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;

    const limit = Number(req.query.limit) || 10;

    const skip = (page - 1) * limit;

    const search = req.query.search?.toString();

    const type = req.query.type as AttributeType | undefined;

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

    if (type) {
      where.type = type;
    }

    const [attributes, total] =
      await prisma.$transaction([
        prisma.attribute.findMany({
          where,

          include: {
            _count: {
              select: {
                values: true,
              },
            },
          },

          skip,

          take: limit,

          orderBy: {
            createdAt: "desc",
          },
        }),

        prisma.attribute.count({
          where,
        }),
      ]);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          attributes,

          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        "Attributes fetched successfully"
      )
    );
  }
);


//Get attribute by id (single attribute)

export const getAttributeById = asyncHandler(
  async (req: Request, res: Response) => {
    const attribute = await prisma.attribute.findUnique({
      where: {
        id: req.params.id as string,
      },

      include: {
        values: {
          orderBy: {
            value: "asc",
          },
        },
      },
    });

    if (!attribute) {
      throw new ApiError(404, "Attribute not found");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        attribute,
        "Attribute fetched successfully"
      )
    );
  }
);


// Update attribute

export const updateAttribute = asyncHandler(
  async (req: Request, res: Response) => {
    const payload = updateAttributeSchema.parse(req.body);

    const attribute = await prisma.attribute.findUnique({
      where: {
        id: req.params.id as string,
      },
      include: {
        values: true,
      },
    });

    if (!attribute) {
      throw new ApiError(404, "Attribute not found");
    }

    if (
      payload.name &&
      payload.name !== attribute.name
    ) {
      const existing = await prisma.attribute.findUnique({
        where: {
          name: payload.name,
        },
      });

      if (existing) {
        throw new ApiError(
          409,
          "Attribute name already exists"
        );
      }
    }

    if (
      payload.slug &&
      payload.slug !== attribute.slug
    ) {
      const existing = await prisma.attribute.findUnique({
        where: {
          slug: payload.slug,
        },
      });

      if (existing) {
        throw new ApiError(
          409,
          "Attribute slug already exists"
        );
      }
    }

    if (
      payload.type &&
      payload.type !== attribute.type &&
      attribute.values.length > 0
    ) {
      throw new ApiError(
        400,
        "Cannot change attribute type after values have been created"
      );
    }

    const updatedAttribute =
      await prisma.attribute.update({
        where: {
          id: req.params.id as string,
        },
        data: payload,
      });

    return res.status(200).json(
      new ApiResponse(
        200,
        updatedAttribute,
        "Attribute updated successfully"
      )
    );
  }
);

//Delete attribute (single)

export const deleteAttribute = asyncHandler(
  async (req: Request, res: Response) => {
    const id  = req.params.id as string;

    const attribute = await prisma.attribute.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!attribute) {
      throw new ApiError(404, "Attribute not found");
    }

    const attributeInUse = await prisma.variantAttributeValue.findFirst({
      where: {
        attributeValue: {
          attributeId: id,
        },
      },
      select: {
        variantId: true,
      },
    });

    if (attributeInUse) {
      throw new ApiError(
        400,
        "Cannot delete attribute because one or more attribute values are used by product variants"
      );
    }

    await prisma.attribute.delete({
      where: {
        id,
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        null,
        "Attribute deleted successfully"
      )
    );
  }
);

// Create attribute value

export const createAttributeValue = asyncHandler(
  async (req: Request, res: Response) => {
    const payload = createAttributeValueSchema.parse(req.body);

    const attributeId  = req.params.id as string;

    const attribute = await prisma.attribute.findUnique({
      where: {
        id: attributeId,
      },
    });

    if (!attribute) {
      throw new ApiError(404, "Attribute not found");
    }

    const existingValue = await prisma.attributeValue.findFirst({
      where: {
        attributeId,
        slug: payload.slug,
      },
    });

    if (existingValue) {
      throw new ApiError(
        409,
        "Attribute value slug already exists for this attribute"
      );
    }

    const attributeValue = await prisma.attributeValue.create({
      data: {
        value: payload.value,
        slug: payload.slug,
        referenceValue: payload.referenceValue,
        attributeId,
      },
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        attributeValue,
        "Attribute value created successfully"
      )
    );
  }
);


//Get attribute values by id
export const getAttributeValues = asyncHandler(
  async (req: Request, res: Response) => {
    const attributeId  = req.params.id as string;

    const attribute = await prisma.attribute.findUnique({
      where: {
        id: attributeId,
      },
    });

    if (!attribute) {
      throw new ApiError(404, "Attribute not found");
    }

    const values = await prisma.attributeValue.findMany({
      where: {
        attributeId,
      },

      orderBy: {
        value: "asc",
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        values,
        "Attribute values fetched successfully"
      )
    );
  }
);


//Update attribute value ( by id)

export const updateAttributeValue = asyncHandler(
  async (req: Request, res: Response) => {
    const payload = updateAttributeValueSchema.parse(req.body);

    const value = await prisma.attributeValue.findUnique({
      where: {
        id: req.params.id as string,
      },
    });

    if (!value) {
      throw new ApiError(404, "Attribute value not found");
    }

    if (
      payload.slug &&
      payload.slug !== value.slug
    ) {
      const existingSlug =
        await prisma.attributeValue.findFirst({
          where: {
            attributeId: value.attributeId,
            slug: payload.slug,
          },
        });

      if (existingSlug) {
        throw new ApiError(
          409,
          "Slug already exists for this attribute"
        );
      }
    }

    const updatedValue =
      await prisma.attributeValue.update({
        where: {
          id: value.id,
        },

        data: payload,
      });

    return res.status(200).json(
      new ApiResponse(
        200,
        updatedValue,
        "Attribute value updated successfully"
      )
    );
  }
);


//Delete attribute value

export const deleteAttributeValue = asyncHandler(
  async (req: Request, res: Response) => {
    const value = await prisma.attributeValue.findUnique({
      where: {
        id: req.params.id as string,
      },

      include: {
        _count: {
          select: {
            variantLinks: true,
            mediaAttachments: true,
          },
        },
      },
    });

    if (!value) {
      throw new ApiError(404, "Attribute value not found");
    }

    if (value._count.variantLinks > 0) {
      throw new ApiError(
        400,
        "Cannot delete attribute value because it is used by product variants"
      );
    }

    await prisma.attributeValue.delete({
      where: {
        id: value.id,
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        null,
        "Attribute value deleted successfully"
      )
    );
  }
);


//watch

// attribute.controllers.ts - Add this function

/**
 * @desc    Watch attributes for monitoring
 * @route   GET /api/v1/attributes/watch
 * @access  Private (Admin/Super Admin)
 */
export const watchAttributes = asyncHandler(
  async (req: Request, res: Response) => {
    // Get total counts
    const [totalAttributes, totalValues] = await prisma.$transaction([
      prisma.attribute.count(),
      prisma.attributeValue.count(),
    ]);

    // Get attributes by type distribution
    const attributesByType = await prisma.attribute.groupBy({
      by: ['type'],
      _count: {
        _all: true,
      },
    });

    // Get attributes with most values
    const topAttributes = await prisma.attribute.findMany({
      take: 5,
      orderBy: {
        values: {
          _count: 'desc',
        },
      },
      include: {
        _count: {
          select: {
            values: true,
          },
        },
      },
    });

    // Get recent attributes (last 5)
    const recentAttributes = await prisma.attribute.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        _count: {
          select: {
            values: true,
          },
        },
      },
    });

    // Get attributes with no values
    const emptyAttributes = await prisma.attribute.count({
      where: {
        values: {
          none: {},
        },
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          totalAttributes,
          totalValues,
          emptyAttributes,
          attributesByType: attributesByType.map(type => ({
            type: type.type,
            count: type._count._all,
          })),
          topAttributes: topAttributes.map(attr => ({
            id: attr.id,
            name: attr.name,
            valueCount: attr._count.values,
          })),
          recentAttributes,
          timestamp: new Date().toISOString(),
        },
        "Attribute watch data fetched successfully"
      )
    );
  }
);