export interface DashboardResponse {
  success: boolean;

  message: string;

  data: {
    totalUsers: number;

    totalRoles: number;

    totalPermissions: number;

    totalPermissionGroups: number;

    totalProducts: number;

    totalBrands: number;

    totalCategories: number;

    totalAttributes: number;

    totalMedia: number;
  };
}