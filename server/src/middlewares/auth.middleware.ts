import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import prisma from "../config/prisma.js";
import type { AuthenticatedUser } from "../types/express.js";

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

export const verifyJWT = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token =
    req.cookies?.accessToken ||
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET ?? "") as {
    id?: string;
  };

  if (typeof decodedToken === "string" || typeof decodedToken !== "object") {
    throw new ApiError(401, "Invalid token");
  }

  if (typeof decodedToken.id !== "string") {
    throw new ApiError(401, "Invalid token payload");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: decodedToken.id,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new ApiError(401, "User not found");
  }

  req.user = user;

  next();
});


