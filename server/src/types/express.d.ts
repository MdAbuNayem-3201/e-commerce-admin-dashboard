import type { User, Role, Permission } from "../generated/prisma/client.js";

export type RoleWithPermissions = Role & {
  permissions: {
    permission: Permission;
  }[];
};

export type AuthenticatedUser = Omit<User, "password" | "refreshToken"> & {
  role: RoleWithPermissions;
};


declare global {
  namespace Express {
    interface Request {
      user: AuthenticatedUser; // ✅ Made required (not optional)
    }
  }
}


export {};

export interface AuthenticatedRequest extends Express.Request {
  user: AuthenticatedUser;
}