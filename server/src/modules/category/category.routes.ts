import { Router } from "express";

import {
  createCategory,
  getCategories,
  getCategoryTree,
  getCategoryById,
  updateCategory,
  deleteCategory,
  watchCategories
} from "./category.controllers.js";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.js";

import { PERMISSIONS } from "../../constants/permissions.js";

const router = Router();


// route   POST /api/v1/categories
// Create a new category
router
  .route("/")
  .post(
    verifyJWT,
    authorize(PERMISSIONS.CATEGORY.CREATE),
    createCategory
  );

// route   GET /api/v1/categories
// Get all categories with pagination and filters

router
  .route("/")
  .get(
    verifyJWT,
    authorize(PERMISSIONS.CATEGORY.READ),
    getCategories
  );


 //route   GET /api/v1/categories/watch
 // Watch categories for real-time monitoring

router.get(
  "/watch",
  verifyJWT,
  authorize(PERMISSIONS.CATEGORY.WATCH),
  watchCategories
);


// Category Tree Route

// route   GET /api/v1/categories/tree
// Get category tree (nested structure)
router
  .route("/tree")
  .get(
    verifyJWT,
    authorize(PERMISSIONS.CATEGORY.READ),
    getCategoryTree
  );

// route   GET /api/v1/categories/:id
// Get a single category by ID
router
  .route("/:id")
  .get(
    verifyJWT,
    authorize(PERMISSIONS.CATEGORY.READ),
    getCategoryById
  );

// route   PATCH /api/v1/categories/:id
// Update a category
router
  .route("/:id")
  .patch(
    verifyJWT,
    authorize(PERMISSIONS.CATEGORY.UPDATE),
    updateCategory
  );

// route   DELETE /api/v1/categories/:id
// Delete a category
router
  .route("/:id")
  .delete(
    verifyJWT,
    authorize(PERMISSIONS.CATEGORY.DELETE),
    deleteCategory
  );

export default router;