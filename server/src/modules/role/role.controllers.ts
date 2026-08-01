import { Request, Response } from "express";

import prisma from "../../config/prisma.js";

import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

import {
  createRoleSchema,
  updateRoleSchema,
} from "./role.validation.js";


//Create role

export const createRole = asyncHandler(
  async (req: Request, res: Response) => {
    const payload = createRoleSchema.parse(req.body);

    const existingRole = await prisma.role.findUnique({
      where: {
        name: payload.name,
      },
    });

    if (existingRole) {
      throw new ApiError(
        409,
        "Role already exists"
      );
    }

    const permissions = await prisma.permission.findMany({
      where: {
        id: {
          in: payload.permissionIds,
        },
      },
    });

    if (permissions.length !== payload.permissionIds.length) {
      throw new ApiError(
        400,
        "One or more permissions are invalid"
      );
    }

    const role = await prisma.$transaction(async (tx) => {
      const createdRole = await tx.role.create({
        data: {
          name: payload.name,
          description: payload.description,
          status: payload.status,
        },
      });

      await tx.rolePermission.createMany({
        data: payload.permissionIds.map((permissionId) => ({
          roleId: createdRole.id,
          permissionId,
        })),
      });

      return createdRole;
    });

    const createdRole = await prisma.role.findUnique({
      where: {
        id: role.id,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        createdRole,
        "Role created successfully"
      )
    );
  }
);


//Get all roles

export const getRoles = asyncHandler(
  async (_req: Request, res: Response) => {
    const roles = await prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        roles,
        "Roles fetched successfully"
      )
    );
  }
);



//Get a single role by id
export const getRoleById = asyncHandler(
  async (req: Request, res: Response) => {
    const role = await prisma.role.findUnique({
      where: {
        id: req.params.id as string,
      },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new ApiError(
        404,
        "Role not found"
      );
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        role,
        "Role fetched successfully"
      )
    );
  }
);


//Update role 
export const updateRole = asyncHandler(
  async (req: Request, res: Response) => {
    const payload = updateRoleSchema.parse(req.body);

    const role = await prisma.role.findUnique({
      where: {
        id: req.params.id as string,
      },
    });

    if (!role) {
      throw new ApiError(
        404,
        "Role not found"
      );
    }

    const updatedRole = await prisma.$transaction(async (tx) => {
      await tx.role.update({
        where: {
          id: role.id,
        },
        data: {
          name: payload.name,
          description: payload.description,
          status: payload.status,
        },
      });

      if (payload.permissionIds) {
        const permissions = await tx.permission.findMany({
          where: {
            id: {
              in: payload.permissionIds,
            },
          },
        });

        if (permissions.length !== payload.permissionIds.length) {
          throw new ApiError(
            400,
            "Invalid permission ids"
          );
        }

        await tx.rolePermission.deleteMany({
          where: {
            roleId: role.id,
          },
        });

        await tx.rolePermission.createMany({
          data: payload.permissionIds.map((permissionId) => ({
            roleId: role.id,
            permissionId,
          })),
        });
      }

      return tx.role.findUnique({
        where: {
          id: role.id,
        },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        updatedRole,
        "Role updated successfully"
      )
    );
  }
);


//Delete role

export const deleteRole = asyncHandler(
  async (req: Request, res: Response) => {
    const role = await prisma.role.findUnique({
      where: {
        id: req.params.id as string,
      },
      include: {
        users: true,
      },
    });

    if (!role) {
      throw new ApiError(
        404,
        "Role not found"
      );
    }

    if (role.users?.length > 0) {
      throw new ApiError(
        409,
        "Cannot delete role because users are assigned to it"
      );
    }

    await prisma.role.delete({
      where: {
        id: role.id,
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        null,
        "Role deleted successfully"
      )
    );
  }
);

