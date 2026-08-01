import { Router } from "express";

import { getDashboard } from "./dashboard.controllers.js";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.js";

import { PERMISSIONS } from "../../constants/permissions.js";

const router = Router();

router.get(
  "/",
  verifyJWT,
  authorize(PERMISSIONS.DASHBOARD.WATCH),
  getDashboard
);

export default router;