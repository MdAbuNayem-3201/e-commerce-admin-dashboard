import type { Role } from "../generated/prisma/client.js";

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
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