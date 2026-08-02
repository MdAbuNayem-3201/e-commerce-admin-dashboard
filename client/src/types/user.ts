export type UserStatus = "ACTIVE" | "INACTIVE";

export interface UserRole {
  id: string;
  name: string;
  description: string | null;
  status: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  gender: string | null;
  avatar: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  roleId: string;
  role: UserRole;
}

export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
