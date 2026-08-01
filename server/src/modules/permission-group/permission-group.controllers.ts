import { Request, Response } from "express";

import prisma from "../../config/prisma.js";

import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

import {
  createPermissionGroupSchema,
  updatePermissionGroupSchema,
} from "./permission-group.validation.js";


//create permission group

export const createPermissionGroup = asyncHandler(
  async (req: Request, res: Response) => {
    const payload =
      createPermissionGroupSchema.parse(req.body);

    const existingGroup =
      await prisma.permissionGroup.findUnique({
        where: {
          name: payload.name,
        },
      });

    if (existingGroup) {
      throw new ApiError(
        409,
        "Permission group already exists"
      );
    }

    const group = await prisma.$transaction(
      async (tx) => {
        const createdGroup =
          await tx.permissionGroup.create({
            data: {
              name: payload.name,
              description: payload.description,
            },
          });

        await tx.permission.createMany({
          data: payload.actions.map((action) => ({
            name: `${payload.name.toLowerCase()}:${action}`,
            groupId: createdGroup.id,
          })),
        });

        return createdGroup;
      }
    );

    const created =
      await prisma.permissionGroup.findUnique({
        where: {
          id: group.id,
        },

        include: {
          permissions: true,
        },
      });

    return res.status(201).json(
      new ApiResponse(
        201,
        created,
        "Permission group created successfully"
      )
    );
  }
);

//get permission groups

export const getPermissionGroups =
  asyncHandler(async (_req, res) => {
    const groups =
      await prisma.permissionGroup.findMany({
        include: {
          permissions: {
            orderBy: {
              name: "asc",
            },
          },
        },

        orderBy: {
          name: "asc",
        },
      });

    return res.status(200).json(
      new ApiResponse(
        200,
        groups,
        "Permission groups fetched successfully"
      )
    );
  });


//get permission group by id

export const getPermissionGroupById =
  asyncHandler(async (req, res) => {
    const group =
      await prisma.permissionGroup.findUnique({
        where: {
          id: req.params.id as string,
        },

        include: {
          permissions: {
            orderBy: {
              name: "asc",
            },
          },
        },
      });

    if (!group) {
      throw new ApiError(
        404,
        "Permission group not found"
      );
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        group,
        "Permission group fetched successfully"
      )
    );
  });


// update permission group

export const updatePermissionGroup =
  asyncHandler(async (req, res) => {
    const payload =
      updatePermissionGroupSchema.parse(req.body);

    const group =
      await prisma.permissionGroup.findUnique({
        where: {
          id: req.params.id as string,
        },

        include: {
          permissions: true,
        },
      });

    if (!group) {
      throw new ApiError(
        404,
        "Permission group not found"
      );
    }

    const updated =
      await prisma.$transaction(async (tx) => {
        await tx.permissionGroup.update({
          where: {
            id: group.id,
          },

          data: {
            name: payload.name,
            description: payload.description,
          },
        });

        if (payload.actions) {
          const existingActions =
            group.permissions.map((permission: any) =>
              permission.name.split(":")[1]
            );

          const actionsToCreate =
            payload.actions.filter(
              (action) =>
                !existingActions.includes(action)
            );

          const actionsToDelete =
            existingActions.filter(
              (action) =>
                !payload.actions?.includes(action as any)
            );

          if (actionsToDelete.length) {
            const permissions =
              group.permissions.filter((permission: any) =>
                actionsToDelete.includes(
                  permission.name.split(":")[1]
                )
              );

            const permissionIds =
              permissions.map((permission) => permission.id);

            const used =
              await tx.rolePermission.findFirst({
                where: {
                  permissionId: {
                    in: permissionIds,
                  },
                },
              });

            if (used) {
              throw new ApiError(
                409,
                "One or more permissions are assigned to roles"
              );
            }

            await tx.permission.deleteMany({
              where: {
                id: {
                  in: permissionIds,
                },
              },
            });
          }

          if (actionsToCreate.length) {
            await tx.permission.createMany({
              data: actionsToCreate.map(
                (action) => ({
                  name: `${(
                    payload.name ??
                    group.name
                  ).toLowerCase()}:${action}`,
                  groupId: group.id,
                })
              ),
            });
          }
        }

        return tx.permissionGroup.findUnique({
          where: {
            id: group.id,
          },

          include: {
            permissions: true,
          },
        });
      });

    return res.status(200).json(
      new ApiResponse(
        200,
        updated,
        "Permission group updated successfully"
      )
    );
  });

//delete permission group

export const deletePermissionGroup =
  asyncHandler(async (req, res) => {
    const group =
      await prisma.permissionGroup.findUnique({
        where: {
          id: req.params.id as string,
        },

        include: {
          permissions: {
            include: {
              roles: true,
            },
          },
        },
      });

    if (!group) {
      throw new ApiError(
        404,
        "Permission group not found"
      );
    }

    const isAssigned =
      group.permissions.some(
        (permission: any) =>
          permission.roles.length > 0
      );

    if (isAssigned) {
      throw new ApiError(
        409,
        "Cannot delete permission group because one or more permissions are assigned to roles"
      );
    }

    await prisma.permissionGroup.delete({
      where: {
        id: group.id,
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        null,
        "Permission group deleted successfully"
      )
    );
  });



//watch

export const watchPermissionGroups = asyncHandler(
  async (_req: Request, res: Response) => {
    const permissionGroups = await prisma.permissionGroup.findMany({
      include: {
        permissions: {
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            name: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        permissionGroups,
        "Permission groups fetched successfully"
      )
    );
  }
);
