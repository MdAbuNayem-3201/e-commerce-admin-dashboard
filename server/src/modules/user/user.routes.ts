import { Router } from "express";

import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
  deleteUser,
  watchUsers,
} from "./user.controllers.js";

import { verifyJWT } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/authorize.js";

import { PERMISSIONS } from "../../constants/permissions.js";

const router = Router();



const auth = verifyJWT;
const authWith = (permission: string) => [verifyJWT, authorize(permission)];


router
  .route("/")
  .post(...authWith(PERMISSIONS.USER.CREATE), createUser)
  .get(...authWith(PERMISSIONS.USER.READ), getUsers);

router
  .route("/watch")
  .get(...authWith(PERMISSIONS.USER.WATCH), watchUsers);

router
  .route("/:id")
  .get(...authWith(PERMISSIONS.USER.READ), getUserById)
  .patch(...authWith(PERMISSIONS.USER.UPDATE), updateUser)
  .delete(...authWith(PERMISSIONS.USER.DELETE), deleteUser);

router
  .route("/:id/status")
  .patch(...authWith(PERMISSIONS.USER.UPDATE), updateUserStatus);

export default router;