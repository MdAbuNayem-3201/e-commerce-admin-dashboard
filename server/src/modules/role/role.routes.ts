import { Router } from "express";

import {
  createRole,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
} from "./role.controllers.js";
import { PERMISSIONS } from "../../constants/permissions.js";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.js";


const router = Router();

// route   POST /api/v1/role
// Create a new role
router.route("/").post(verifyJWT, authorize(PERMISSIONS.ROLE.CREATE), createRole);

// route   GET /api/v1/role/all-roles
// Get all roles with pagination and filters
router.route("/all-roles").get(verifyJWT, authorize(PERMISSIONS.ROLE.READ), getRoles);

// route   GET /api/v1/role/:id
// Get a single role by ID
router.route("/:id").get(verifyJWT, authorize(PERMISSIONS.ROLE.READ), getRoleById);

// route   PATCH /api/v1/role/:id
// Update a role
router.route("/:id").patch(verifyJWT, authorize(PERMISSIONS.ROLE.UPDATE), updateRole);

// route   DELETE /api/v1/role/:id
// Delete a role
router.route("/:id").delete(verifyJWT, authorize(PERMISSIONS.ROLE.DELETE), deleteRole);


export default router;
