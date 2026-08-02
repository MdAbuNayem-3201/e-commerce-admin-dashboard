import { Request, Response } from "express";
import prisma from "../../config/prisma.js";

import { asyncHandler } from "../../utils/asyncHandler.js";
import { ApiError } from "../../utils/ApiError.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

import { comparePassword } from "../../utils/bcrypt.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";

import { loginSchema, refreshTokenSchema } from "./auth.validation.js";
import { JwtRefreshPayload } from "./auth.types.js";

//generate access and refresh token
const generateAccessAndRefreshTokens = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const accessToken = generateAccessToken({
    id: user.id,
    roleId: user.roleId,
  });

  const refreshToken = generateRefreshToken({
    id: user.id,
  });

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      refreshToken,
    },
  });

  return {
    accessToken,
    refreshToken,
  };
};

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: {
      email: validatedData.email,
    },
    include: {
      role: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  if (!user.isActive) {
    throw new ApiError(403, "User is not active");
  }

  const isPasswordCorrect = await comparePassword(
    validatedData.password,
    user.password,
  );

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user.id,
  );

  const { password, refreshToken: _, ...loggedInUser } = user;

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User loggedin successfully",
      ),
    );
});

//Refresh access token
export const refreshAccessToken = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.body.refreshToken || req.cookies?.refreshToken;

    const validatedData = refreshTokenSchema.parse({
      refreshToken: token,
    });

    const decoded = verifyRefreshToken(
      validatedData.refreshToken,
    ) as JwtRefreshPayload;

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!user) {
      throw new ApiError(401, "Refresh token is not valid");
    }

    if (user.refreshToken !== validatedData.refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      user.id,
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          accessToken,
          refreshToken,
        },
        "Access token refreshed successfully",
      ),
    );
  },
);

//Logout user

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Unauthorized request");
  }

  // Update user to remove refresh token
  await prisma.user.update({
    where: {
      id: req.user.id,
    },
    data: {
      refreshToken: null,
    },
  });

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
  };

  // Clear cookies properly
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, null, "User logged out successfully"));
});

// Get current user with role and permissions
export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    // Since req.user might not have the full role with permissions
    // We need to fetch the user again with full role and permissions
    const user = await prisma.user.findUnique({
      where: {
        id: req.user?.id,
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Extract permissions as a flat list
    const permissions =
      user.role?.permissions.map((rp) => rp.permission.name) || [];

    // Remove sensitive data
    const { password, refreshToken, ...safeUser } = user;

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: safeUser,
          permissions,
        },
        "User fetched successfully",
      ),
    );
  },
);
