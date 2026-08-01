import { Router } from "express";

import {
  createPermissionGroup,
  getPermissionGroups,
  getPermissionGroupById,
  updatePermissionGroup,
  deletePermissionGroup,
  watchPermissionGroups
} from "./permission-group.controllers.js";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.js";

import { PERMISSIONS } from "../../constants/permissions.js";

const router = Router();

/**
 * Create Permission Group
 */
router.route("/").post(
  verifyJWT,
  authorize(PERMISSIONS.PERMISSION.CREATE),
  createPermissionGroup
);

/**
 * Get All Permission Groups
 */
router.route("/").get(
  verifyJWT,
  authorize(PERMISSIONS.PERMISSION.READ),
  getPermissionGroups
);

//watch permission groups
router.route("/watch").get(
  verifyJWT,
  authorize(PERMISSIONS.PERMISSION.WATCH),
  watchPermissionGroups
);

/**
 * Get Permission Group By Id
 */
router.route("/:id").get(
  verifyJWT,
  authorize(PERMISSIONS.PERMISSION.READ),
  getPermissionGroupById
);

/**
 * Update Permission Group
 */
router.route("/update/:id").patch(
  verifyJWT,
  authorize(PERMISSIONS.PERMISSION.UPDATE),
  updatePermissionGroup
);

/**
 * Delete Permission Group
 */
router.route("/delete/:id").delete(
  verifyJWT,
  authorize(PERMISSIONS.PERMISSION.DELETE),
  deletePermissionGroup
);



export default router;