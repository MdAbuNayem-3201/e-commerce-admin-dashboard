export interface PermissionGroup {
  id: string;
  name: string;
  description?: string;
}

export interface Permission {
  id: string;
  name: string;
  description?: string;
  groupId: string;
  createdAt: string;
  updatedAt: string;
  group: PermissionGroup;
}

export interface PermissionWatchGroup {
  id: string;
  name: string;
  description?: string;
  actions: string[];
  permissionCount: number;
  permissions: Permission[];
  hasWatch: boolean;
  hasCreate: boolean;
  hasRead: boolean;
  hasUpdate: boolean;
  hasDelete: boolean;
}

export interface CreatePermissionPayload {
  name: string;
  description?: string;
  groupId: string;
}

export interface UpdatePermissionPayload {
  name?: string;
  description?: string;
  groupId?: string;
}
