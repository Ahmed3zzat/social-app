import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import authMiddleware from "../../middleware/Authentication.js";
import { roles } from "../../DB/models/user.model.js";
import isAuthorized from "../../middleware/Authorization.middleware.js";
import { changeRole, getAll } from "./admin.service.js";
import { middleValidation } from "../../middleware/validation.middleware.js";
import { changeRoleSchema } from "./admin.validation.js";
import { canChangeRoleMiddleWare } from "../../middleware/change-role.js";

const router = Router();

// get all userrs and posts
router.get(
  "/",
  asyncHandler(authMiddleware),
  isAuthorized(roles.admin, roles.superAdmin),
  asyncHandler(getAll),
);

// change Roles
router.patch(
  "/change-role",
  asyncHandler(authMiddleware),
  isAuthorized(roles.admin, roles.superAdmin),
  middleValidation(changeRoleSchema),
  canChangeRoleMiddleWare,
  asyncHandler(changeRole),
);

// deleteone
// /:id
// updateone
// /:id
// getone
// /:id

// router.route("/:id").get()

export default router;
