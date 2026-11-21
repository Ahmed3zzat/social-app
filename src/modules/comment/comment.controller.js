import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import authMiddleware from "../../middleware/Authentication.js";
import isAuthorized from "../../middleware/Authorization.middleware.js";
import { middleValidation } from "../../middleware/validation.middleware.js";
import { roles } from "../../DB/models/user.model.js";
import { uploadCloud } from "../../utils/file uploading/multerCloud.js";
import {
  createComment,
  deleteComment,
  getComment,
  likeAndUnLikeComment,
  replayComment,
  updateComment,
} from "./comment.service.js";
import {
  createCommentSchema,
  deleteCommentSchema,
  getCommentSchema,
  likeAndUnLikeCommentSchema,
  replayCommentSchema,
  updateCommentSchema,
} from "./comment.validation.js";

const router = Router({ mergeParams: true });

// create Comment
router.post(
  "/",
  asyncHandler(authMiddleware),
  isAuthorized(roles.user),
  uploadCloud().single("image"),
  middleValidation(createCommentSchema),
  asyncHandler(createComment),
);

// LikeAndUnLike Comments
router.patch(
  "/LikeAndUnLike",
  asyncHandler(authMiddleware),
  isAuthorized(roles.user),
  middleValidation(likeAndUnLikeCommentSchema),
  asyncHandler(likeAndUnLikeComment),
);

// update Comment
router.patch(
  "/:commentId",
  asyncHandler(authMiddleware),
  isAuthorized(roles.user),
  uploadCloud().single("image"),
  middleValidation(updateCommentSchema),
  asyncHandler(updateComment),
);

// Soft Delete Comment
router.patch(
  "/:commentId/delete",
  asyncHandler(authMiddleware),
  isAuthorized(roles.user, roles.admin),
  middleValidation(deleteCommentSchema),
  asyncHandler(deleteComment),
);

// Get Comment
router.get(
  "/",
  asyncHandler(authMiddleware),
  isAuthorized(roles.user, roles.admin),
  middleValidation(getCommentSchema),
  asyncHandler(getComment),
);

// Add Replay
// /post/:postId/comment/:id
router.post(
  "/:commentId",
  asyncHandler(authMiddleware),
  isAuthorized(roles.user),
  uploadCloud().single("image"),
  middleValidation(replayCommentSchema),
  asyncHandler(replayComment),
);

export default router;
