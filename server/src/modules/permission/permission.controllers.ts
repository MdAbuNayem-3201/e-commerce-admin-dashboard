import { Request, Response } from "express";

import prisma from "../../config/prisma.js";

import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

import {
  createPermissionSchema,
  updatePermissionSchema,
} from "./permission.validation.js";


//create permission

export const createPermission = asyncHandler(
  async (req: Request, res: Response) => {
    const payload = createPermissionSchema.parse(req.body);

    const existingPermission =
      await prisma.permission.findUnique({
        where: {
          name: payload.name,
        },
      });

    if (existingPermission) {
      throw new ApiError(
        409,
        "Permission already exists"
      );
    }

    const group =
      await prisma.permissionGroup.findUnique({
        where: {
          id: payload.groupId,
        },
      });

    if (!group) {
      throw new ApiError(
        404,
        "Permission group not found"
      );
    }

    const permission =
      await prisma.permission.create({
        data: {
          name: payload.name,
          description: payload.description,
          groupId: payload.groupId,
        },

        include: {
          group: true,
        },
      });

    return res.status(201).json(
      new ApiResponse(
        201,
        permission,
        "Permission created successfully"
      )
    );
  }
);


//get all permissions

export const getPermissions = asyncHandler(
  async (_req: Request, res: Response) => {
    const permissions =
      await prisma.permission.findMany({
        include: {
          group: true,
        },

        orderBy: [
          {
            group: {
              name: "asc",
            },
          },
          {
            name: "asc",
          },
        ],
      });

    return res.status(200).json(
      new ApiResponse(
        200,
        permissions,
        "Permissions fetched successfully"
      )
    );
  }
);

//watch permissions
// permission.controller.ts - Enhanced watch implementation

export const watchPermissions = asyncHandler(
  async (req: Request, res: Response) => {
    // Get all groups with their permissions
    const groups = await prisma.permissionGroup.findMany({
      include: {
        permissions: {
          orderBy: {
            name: 'asc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Get total counts
    const totalPermissions = await prisma.permission.count();
    const totalGroups = await prisma.permissionGroup.count();
    const totalRolePermissions = await prisma.rolePermission.count();

    // Get permissions assigned to roles (for usage statistics)
    const permissionsWithRoles = await prisma.permission.findMany({
      where: {
        roles: {
          some: {},
        },
      },
      include: {
        roles: {
          include: {
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Get groups with no permissions (orphaned groups)
    const emptyGroups = groups.filter(g => g.permissions.length === 0);

    // Get most used permissions (assigned to most roles)
    const mostUsedPermissions = await prisma.permission.findMany({
      take: 10,
      orderBy: {
        roles: {
          _count: 'desc',
        },
      },
      include: {
        group: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            roles: true,
          },
        },
      },
    });

    // Format groups as module grid (like the assessment screenshot)
    const formattedGroups = groups.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description,
      actions: group.permissions.map(p => p.name.split(':')[1]), // Extract action from "module:action"
      permissionCount: group.permissions.length,
      permissions: group.permissions,
      hasWatch: group.permissions.some(p => p.name.endsWith(':watch')),
      hasCreate: group.permissions.some(p => p.name.endsWith(':create')),
      hasRead: group.permissions.some(p => p.name.endsWith(':read')),
      hasUpdate: group.permissions.some(p => p.name.endsWith(':update')),
      hasDelete: group.permissions.some(p => p.name.endsWith(':delete')),
    }));

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          // Module grid view (for UI)
          moduleGrid: formattedGroups,

          // Flat list view
          flatList: groups.flatMap(g => g.permissions),

          // Statistics
          stats: {
            totalPermissions,
            totalGroups,
            totalRolePermissions,
            emptyGroups: emptyGroups.length,
            averagePermissionsPerGroup: totalGroups > 0 
              ? (totalPermissions / totalGroups).toFixed(1) 
              : 0,
          },

          // Insights
          insights: {
            emptyGroups: emptyGroups.map(g => ({ id: g.id, name: g.name })),
            mostUsedPermissions: mostUsedPermissions.map(p => ({
              name: p.name,
              group: p.group.name,
              roleCount: p._count.roles,
            })),
            permissionsAssignedToRoles: permissionsWithRoles.length,
          },

          // Timestamp
          timestamp: new Date().toISOString(),
        },
        "Permission watch data fetched successfully"
      )
    );
  }
);


//Get permission by id

export const getPermissionById = asyncHandler(
  async (req: Request, res: Response) => {
    const permission =
      await prisma.permission.findUnique({
        where: {
          id: req.params.id as string,
        },

        include: {
          group: true,
        },
      });

    if (!permission) {
      throw new ApiError(
        404,
        "Permission not found"
      );
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        permission,
        "Permission fetched successfully"
      )
    );
  }
);


//Update permission

export const updatePermission = asyncHandler(
  async (req: Request, res: Response) => {
    const payload =
      updatePermissionSchema.parse(req.body);

    const permission =
      await prisma.permission.findUnique({
        where: {
          id: req.params.id as string,
        },
      });

    if (!permission) {
      throw new ApiError(
        404,
        "Permission not found"
      );
    }

    if (payload.name) {
      const existing =
        await prisma.permission.findFirst({
          where: {
            name: payload.name,

            NOT: {
              id: permission.id,
            },
          },
        });

      if (existing) {
        throw new ApiError(
          409,
          "Permission already exists"
        );
      }
    }

    if (payload.groupId) {
      const group =
        await prisma.permissionGroup.findUnique({
          where: {
            id: payload.groupId,
          },
        });

      if (!group) {
        throw new ApiError(
          404,
          "Permission group not found"
        );
      }
    }

    const updated =
      await prisma.permission.update({
        where: {
          id: permission.id,
        },

        data: payload,

        include: {
          group: true,
        },
      });

    return res.status(200).json(
      new ApiResponse(
        200,
        updated,
        "Permission updated successfully"
      )
    );
  }
);

//delete permission

export const deletePermission = asyncHandler(
  async (req: Request, res: Response) => {
    const permission =
      await prisma.permission.findUnique({
        where: {
          id: req.params.id as string,
        },

        include: {
          roles: true,
        },
      });

    if (!permission) {
      throw new ApiError(
        404,
        "Permission not found"
      );
    }

    if (permission.roles.length > 0) {
      throw new ApiError(
        409,
        "Permission is assigned to one or more roles"
      );
    }

    await prisma.permission.delete({
      where: {
        id: permission.id,
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        null,
        "Permission deleted successfully"
      )
    );
  }
);