import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const authorize =
  (...requiredPermissions: string[]) =>
  asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new ApiError(
        401,
        "Unauthorized request"
      );
    }

    const role = await prisma.role.findUnique({
      where: {
        id: req.user.role.id,
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
        403,
        "Role not found"
      );
    }

    const userPermissions = role.permissions.map(
      (item) => item.permission.name
    );

    const hasPermission = requiredPermissions.every((permission) =>
      userPermissions.includes(permission)
    );

    if (!hasPermission) {
      throw new ApiError(
        403,
        "You don't have permission to perform this action."
      );
    }

    next();
  });