import { Router } from "express";

import {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  watchBrands
} from "./brand.controllers.js";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.js";

import { PERMISSIONS } from "../../constants/permissions.js";

const router = Router();

// route   POST /api/v1/brand
// Create a new brand
router
  .route("/")
  .post(
    verifyJWT,
    authorize(PERMISSIONS.BRAND.CREATE),
    createBrand
  );

// route   GET /api/v1/brand
// Get all brands with pagination and filters
router
  .route("/")
  .get(
    verifyJWT,
    authorize(PERMISSIONS.BRAND.READ),
    getBrands
  );

//watch route   GET /api/v1/brand/watch
router
  .route("/watch")
  .get(
    verifyJWT,
    authorize(PERMISSIONS.BRAND.WATCH),
    watchBrands
  );

// route   GET /api/v1/brand/:id
// Get a single brand by ID
router
  .route("/:id")
  .get(
    verifyJWT,
    authorize(PERMISSIONS.BRAND.READ),
    getBrandById
  );

// route   PATCH /api/v1/brand/:id
// Update a brand
router
  .route("/:id")
  .patch(
    verifyJWT,
    authorize(PERMISSIONS.BRAND.UPDATE),
    updateBrand
  );

// route   DELETE /api/v1/brand/:id
// Delete a brand
router
  .route("/:id")
  .delete(
    verifyJWT,
    authorize(PERMISSIONS.BRAND.DELETE),
    deleteBrand
  );

export default router;