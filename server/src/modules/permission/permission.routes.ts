import { Router } from "express";

import {
  createPermission,
  getPermissions,
  watchPermissions,
  getPermissionById,
  updatePermission,
  deletePermission,
} from "./permission.controllers.js";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.js";

import { PERMISSIONS } from "../../constants/permissions.js";

const router = Router();

/**
 * route   POST /api/v1/permission-group
 * Create a new permission or permission group
 */
router.post(
  "/",
  verifyJWT,
  authorize(PERMISSIONS.PERMISSION.CREATE),
  createPermission
);

/**
 * route   GET /api/v1/permissions
 * Get all permissions grouped by module with pagination
 * @query   { page, limit, search, module }
 */
router.get(
  "/",
  verifyJWT,
  authorize(PERMISSIONS.PERMISSION.READ),
  getPermissions
);

/**
 * route   GET /api/v1/permissions/watch
 * Watch permissions for real-time monitoring
 */
router.get(
  "/watch",
  verifyJWT,
  authorize(PERMISSIONS.PERMISSION.WATCH),
  watchPermissions
);

/**
 * route   GET /api/v1/permissions/:id
 * Get a single permission by ID
 */
router.get(
  "/:id",
  verifyJWT,
  authorize(PERMISSIONS.PERMISSION.READ),
  getPermissionById
);

/**
 * route   PUT /api/v1/permissions/:id
 * Update an existing permission
 */

router.put(
  "/:id",
  verifyJWT,
  authorize(PERMISSIONS.PERMISSION.UPDATE),
  updatePermission
);

/**
 * route   DELETE /api/v1/permissions/:id
 * Delete a permission (checks if assigned to roles first)
 */
router.delete(
  "/:id",
  verifyJWT,
  authorize(PERMISSIONS.PERMISSION.DELETE),
  deletePermission
);

export default router;