export interface PermissionGroup {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionGroupPayload {
  name: string;
  description?: string;
  actions: string[];
}