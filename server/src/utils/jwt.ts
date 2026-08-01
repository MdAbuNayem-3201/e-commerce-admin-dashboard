import jwt from "jsonwebtoken";

import { ApiError } from "./ApiError.js";
import {
  JwtAccessPayload,
  JwtRefreshPayload,
} from "../modules/auth/auth.types.js";

const getJwtSecret = (name: "ACCESS_TOKEN_SECRET" | "REFRESH_TOKEN_SECRET"): string => {
  const secret = process.env[name];

  if (!secret) {
    throw new ApiError(500, `Missing ${name} environment variable`);
  }

  return secret;
};

export const generateAccessToken = (
  payload: JwtAccessPayload,
): string => {
  try {
    return jwt.sign(payload, getJwtSecret("ACCESS_TOKEN_SECRET"));
  } catch {
    throw new ApiError(500, "Could not generate access token");
  }
};

export const generateRefreshToken = (
  payload: JwtRefreshPayload,
): string => {
  try {
    return jwt.sign(payload, getJwtSecret("REFRESH_TOKEN_SECRET"));
  } catch {
    throw new ApiError(500, "Could not generate refresh token");
  }
};

export const verifyAccessToken = (
  token: string,
): JwtAccessPayload => {
  const decoded = jwt.verify(token, getJwtSecret("ACCESS_TOKEN_SECRET"));

  if (typeof decoded === "string" || typeof decoded !== "object") {
    throw new ApiError(401, "Invalid access token");
  }

  return decoded as JwtAccessPayload;
};

export const verifyRefreshToken = (
  token: string,
): JwtRefreshPayload => {
  const decoded = jwt.verify(token, getJwtSecret("REFRESH_TOKEN_SECRET"));

  if (typeof decoded === "string" || typeof decoded !== "object") {
    throw new ApiError(401, "Invalid refresh token");
  }

  return decoded as JwtRefreshPayload;
};