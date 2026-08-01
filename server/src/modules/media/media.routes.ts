import { Router } from "express";

import {
  uploadMedia,
  uploadMultipleMedia,
  getMedia,
  getMediaById,
  deleteMedia,
  updateMedia,
  watchMedia
} from "./media.controllers.js";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.js";
import { upload } from "../../middlewares/multer.middleware.js";

import { PERMISSIONS } from "../../constants/permissions.js";

const router = Router();



// route   POST /api/media/upload
// Upload a file
router
  .route("/upload")
  .post(
    verifyJWT,
    authorize(PERMISSIONS.MEDIA.UPLOAD),
    upload.single("file"),
    uploadMedia
  );

// route   POST /api/media/upload
// Upload a file
router.route("/upload/multiple").post(
  verifyJWT,
  authorize(PERMISSIONS.MEDIA.UPLOAD),
  upload.array("files", 20),
  uploadMultipleMedia
);

// route   GET /api/media
// Get all media with pagination and filters
router
  .route("/")
  .get(
    verifyJWT,
    authorize(PERMISSIONS.MEDIA.READ),
    getMedia
  );

//watch route
router
  .route("/watch")
  .get(
    verifyJWT,
    authorize(PERMISSIONS.MEDIA.WATCH),
    watchMedia
  );

// route   GET /api/media/:id
// Get a single media by ID
router
  .route("/:id")
  .get(
    verifyJWT,
    authorize(PERMISSIONS.MEDIA.READ),
    getMediaById
  );

// route   PATCH /api/media/:id
// Update a single media by ID
router
  .route("/:id")
  .patch(
    verifyJWT,
    authorize(PERMISSIONS.MEDIA.WRITE),
    updateMedia
  );

// route   DELETE /api/media/:id
// Delete a media
router
  .route("/:id")
  .delete(
    verifyJWT,
    authorize(PERMISSIONS.MEDIA.DELETE),
    deleteMedia
  );

export default router;