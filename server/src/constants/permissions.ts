// constants/permissions.ts
export const PERMISSIONS = {
  DASHBOARD: {
    WATCH: "dashboard:watch",
  },
  
  PERMISSION: {
    WATCH: "permission:watch",
    CREATE: "permission:create",
    READ: "permission:read",
    UPDATE: "permission:update",
    DELETE: "permission:delete",
  },
  
  ROLE: {
    WATCH: "role:watch",
    CREATE: "role:create",
    READ: "role:read",
    UPDATE: "role:update",
    DELETE: "role:delete",
  },
  
  USER: {
    WATCH: "user:watch",
    CREATE: "user:create",
    READ: "user:read",
    UPDATE: "user:update",
    DELETE: "user:delete",
  },
  
  MEDIA: {
    WATCH: "media:watch",
    READ: "media:read",
    UPLOAD: "media:upload",
    WRITE: "media:write",  
    DELETE: "media:delete",
  },
  
  CATEGORY: {
    WATCH: "category:watch",
    CREATE: "category:create",
    READ: "category:read",
    UPDATE: "category:update",
    DELETE: "category:delete",
  },
  
  BRAND: {
    WATCH: "brand:watch",
    CREATE: "brand:create",
    READ: "brand:read",
    UPDATE: "brand:update",
    DELETE: "brand:delete",
  },
  
  ATTRIBUTE: {
    WATCH: "attribute:watch",
    CREATE: "attribute:create",
    READ: "attribute:read",
    UPDATE: "attribute:update",
    DELETE: "attribute:delete",
  },
  
  PRODUCT: {
    WATCH: "product:watch",
    CREATE: "product:create",
    READ: "product:read",
    UPDATE: "product:update",
    DELETE: "product:delete",
  },
} as const;