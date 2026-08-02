export interface Permission {
  id: string;
  name: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;

  permissions: {
    permission: Permission;
  }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
  };
}