import { Router } from "express";

import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
} from "./auth.controllers.js";

import { verifyJWT } from "../../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post( loginUser);

router.route("/refresh-token",).post(
  refreshAccessToken
);

router.route("/logout").post(
  verifyJWT,
  logoutUser,
);

router.route("/me").get(
  verifyJWT,
  getCurrentUser,
);

export default router;