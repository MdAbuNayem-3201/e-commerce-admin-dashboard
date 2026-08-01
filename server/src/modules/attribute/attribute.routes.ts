import { Router } from "express";

import {
  createAttribute,
  getAttributes,
  getAttributeById,
  updateAttribute,
  deleteAttribute,
  createAttributeValue,
  getAttributeValues,
  updateAttributeValue,
  deleteAttributeValue,
  watchAttributes,
} from "./attribute.controllers.js";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.js";

import { PERMISSIONS } from "../../constants/permissions.js";

const router = Router();

// route   POST /api/v1/attributes
// Create a new attribute
router
  .route("/")
  .post(
    verifyJWT,
    authorize(PERMISSIONS.ATTRIBUTE.CREATE),
    createAttribute
  );

// route   GET /api/v1/attributes
// Get all attributes with pagination and filters
router
  .route("/")
  .get(
    verifyJWT,
    authorize(PERMISSIONS.ATTRIBUTE.READ),
    getAttributes
  );

//watch attribute for monitoring changes
router
  .route("/watch")
  .get(
    verifyJWT,
    authorize(PERMISSIONS.ATTRIBUTE.WATCH),
    watchAttributes
  );


// route   GET /api/v1/attributes/:id
// Get a single attribute by ID
router
  .route("/:id")
  .get(
    verifyJWT,
    authorize(PERMISSIONS.ATTRIBUTE.READ),
    getAttributeById
  );

// route   PATCH /api/v1/attributes/:id
// Update an attribute
router
  .route("/:id")
  .patch(
    verifyJWT,
    authorize(PERMISSIONS.ATTRIBUTE.UPDATE),
    updateAttribute
  );

// route   DELETE /api/v1/attributes/:id
// Delete an attribute
router
  .route("/:id")
  .delete(
    verifyJWT,
    authorize(PERMISSIONS.ATTRIBUTE.DELETE),
    deleteAttribute
  );

// route   POST /api/v1/attributes/:attributeId/values
// Create a new attribute value
router
  .route("/:id/values")
  .post(
    verifyJWT,
    authorize(PERMISSIONS.ATTRIBUTE.CREATE),
    createAttributeValue
  );

// route   GET /api/v1/attributes/:attributeId/values
// Get all values for an attribute
router
  .route("/:id/values")
  .get(
    verifyJWT,
    authorize(PERMISSIONS.ATTRIBUTE.READ),
    getAttributeValues
  );


// route   PATCH /api/v1/attributes/values/:id
// Update an attribute value
router
  .route("/values/:id")
  .patch(
    verifyJWT,
    authorize(PERMISSIONS.ATTRIBUTE.UPDATE),
    updateAttributeValue
  );

// route   DELETE /api/v1/attribute/values/:id
// Delete an attribute value
router
  .route("/values/:id")
  .delete(
    verifyJWT,
    authorize(PERMISSIONS.ATTRIBUTE.DELETE),
    deleteAttributeValue
  );

export default router;