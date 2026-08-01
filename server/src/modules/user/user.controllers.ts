import { Request, Response } from "express";
import prisma from "../../config/prisma.js";

import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

import { hashPassword } from "../../utils/bcrypt.js";

import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
} from "./user.validation.js";

import { Gender } from "../../generated/prisma/enums.js";


//Create a user
export const createUser = asyncHandler(
  async (req: Request, res: Response) => {
    const payload = createUserSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });

    if (existingUser) {
      throw new ApiError(409, "User already exists");
    }

    const role = await prisma.role.findUnique({
      where: {
        id: payload.roleId,
      },
    });

    if (!role) {
      throw new ApiError(404, "Role not found");
    }

    const hashedPassword = await hashPassword(
      payload.password,
    );

    const user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        phone: payload.phone,
        gender: payload.gender,
        roleId: payload.roleId,
      },
      include: {
        role: true,
      },
    });

    const { password, refreshToken, ...createdUser } =
      user;

    return res.status(201).json(
      new ApiResponse(
        201,
        createdUser,
        "User created successfully",
      ),
    );
  },
);


//Get all users with pagination
export const getUsers = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search?.toString().trim();
    const roleId = req.query.roleId?.toString();
    const isActive =
      req.query.isActive !== undefined
        ? req.query.isActive === "true"
        : undefined;

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (roleId) {
      where.roleId = roleId;
    }

    if (typeof isActive === "boolean") {
      where.isActive = isActive;
    }

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        include: {
          role: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),

      prisma.user.count({
        where,
      }),
    ]);

    const sanitizedUsers = users.map(
      ({ password, refreshToken, ...user }) => user
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          users: sanitizedUsers,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        "Users fetched successfully"
      )
    );
  }
);

//Get a user by id
export const getUserById = asyncHandler(
  async (req: Request, res: Response) => {
    const id  = req.params.id as string;

    const user = await prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const { password, refreshToken, ...safeUser } = user;

    return res.status(200).json(
      new ApiResponse(
        200,
        safeUser,
        "User fetched successfully"
      )
    );
  }
);


//Update user
export const updateUser = asyncHandler(
  async (req: Request, res: Response) => {
    const id  = req.params.id as string;

    const payload = updateUserSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (payload.roleId) {
      const role = await prisma.role.findUnique({
        where: {
          id: payload.roleId,
        },
      });

      if (!role) {
        throw new ApiError(404, "Role not found");
      }
    }

    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        name: payload.name,
        phone: payload.phone,
        gender: payload.gender as Gender | null,
        roleId: payload.roleId,
      },
      include: {
        role: true,
      },
    });

    const { password, refreshToken, ...safeUser } = updatedUser;

    return res.status(200).json(
      new ApiResponse(
        200,
        safeUser,
        "User updated successfully"
      )
    );
  }
);


//Update user status

export const updateUserStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const payload = updateUserStatusSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        isActive: payload.isActive,
      },
      include: {
        role: true,
      },
    });

    const { password, refreshToken, ...safeUser } = updatedUser;

    return res.status(200).json(
      new ApiResponse(
        200,
        safeUser,
        "User status updated successfully"
      )
    );
  }
);


//Delete a user (soft delete, since our schema includes => deletedAt DateTime?)
export const deleteUser = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const user = await prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    await prisma.user.update({
      where: {
        id,
      },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        null,
        "User deleted successfully"
      )
    );
  }
);



// Watch users for real-time monitoring and statistics

export const watchUsers = asyncHandler(
  async (req: Request, res: Response) => {
    // Get total counts
    const [totalUsers, activeUsers, inactiveUsers, totalRoles] = await prisma.$transaction([
      prisma.user.count({
        where: { deletedAt: null },
      }),
      prisma.user.count({
        where: { 
          isActive: true,
          deletedAt: null,
        },
      }),
      prisma.user.count({
        where: { 
          isActive: false,
          deletedAt: null,
        },
      }),
      prisma.role.count(),
    ]);

    // Get users by role (distribution)
    const usersByRole = await prisma.role.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            users: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Get recent users (last 10 created)
    const recentUsers = await prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      take: 10,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    // Get users by gender distribution
    const usersByGender = await prisma.user.groupBy({
      by: ['gender'],
      _count: {
        _all: true,
      },
      where: {
        deletedAt: null,
      },
    });

    // Get recently inactive users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentlyInactive = await prisma.user.findMany({
      where: {
        isActive: false,
        deletedAt: null,
        updatedAt: {
          gte: sevenDaysAgo,
        },
      },
      take: 5,
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        role: {
          select: {
            name: true,
          },
        },
      },
    });

    // Get users with no role assigned (should be 0)
    const usersWithoutRole = await prisma.user.count({
      where: {
        roleId: undefined,
        deletedAt: null,
      },
    });

    // Get deleted users count (soft deleted)
    const deletedUsers = await prisma.user.count({
      where: {
        deletedAt: {
          not: null,
        },
      },
    });

    // Get user activity summary
    const lastWeekDate = new Date();
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);

    const newUsersLastWeek = await prisma.user.count({
      where: {
        createdAt: {
          gte: lastWeekDate,
        },
        deletedAt: null,
      },
    });

    // Remove sensitive data from recent users
    const sanitizedRecentUsers = recentUsers.map(({ password, refreshToken, ...user }) => user);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          overview: {
            totalUsers,
            activeUsers,
            inactiveUsers,
            deletedUsers,
            totalRoles,
            usersWithoutRole,
            newUsersLastWeek,
          },
          distribution: {
            byRole: usersByRole.map(role => ({
              roleId: role.id,
              roleName: role.name,
              userCount: role._count.users,
            })),
            byGender: usersByGender.map(gender => ({
              gender: gender.gender || 'Not specified',
              count: gender._count._all,
            })),
          },
          recentActivity: {
            recentUsers: sanitizedRecentUsers,
            recentlyInactive: recentlyInactive.map(({ password, refreshToken, ...user }) => user),
          },
          healthMetrics: {
            activePercentage: totalUsers > 0 
              ? ((activeUsers / totalUsers) * 100).toFixed(1) 
              : 0,
            inactivePercentage: totalUsers > 0 
              ? ((inactiveUsers / totalUsers) * 100).toFixed(1) 
              : 0,
          },
          timestamp: new Date().toISOString(),
        },
        "User watch data fetched successfully"
      )
    );
  }
);