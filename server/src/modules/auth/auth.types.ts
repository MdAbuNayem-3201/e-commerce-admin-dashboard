import type { UserModel, RoleModel } from "../../generated/prisma/models.js";

export interface JwtAccessPayload {
  id: string;
  roleId: string;
}

export interface JwtRefreshPayload {
  id: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}

export type AuthUser = UserModel & {
  role: RoleModel;
};

