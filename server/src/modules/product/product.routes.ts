import { Router } from "express";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  watchProducts,
} from "./product.controllers.js";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.js";

import { PERMISSIONS } from "../../constants/permissions.js";

const router = Router();

/**
 * Create Product
 * POST /api/v1/product
 */
router.post(
  "/",
  verifyJWT,
  authorize(PERMISSIONS.PRODUCT.CREATE),
  createProduct,
);

/**
 * Get All Products
 * GET /api/v1/product
 */
router.get("/", verifyJWT, authorize(PERMISSIONS.PRODUCT.READ), getProducts);


//watch router
router.get(
  "/watch",
  verifyJWT,
  authorize(PERMISSIONS.PRODUCT.WATCH),
  watchProducts
);

/**
 * Get Product By Id
 * GET /api/v1/product/:id
 */
router.get(
  "/:id",
  verifyJWT,
  authorize(PERMISSIONS.PRODUCT.READ),
  getProductById,
);

/**
 * Update Product
 * PUT /api/v1/product/:id
 */
router.patch(
  "/:id",
  verifyJWT,
  authorize(PERMISSIONS.PRODUCT.UPDATE),
  updateProduct,
);

/**
 * Delete Product
 * DELETE /api/v1/product/:id
 */
router.delete(
  "/:id",
  verifyJWT,
  authorize(PERMISSIONS.PRODUCT.DELETE),
  deleteProduct,
);

export default router;
