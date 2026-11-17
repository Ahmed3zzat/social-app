import { Router } from "express";
import isAuthorized from "../../middleware/Authorization.middleware.js";
import { roles } from "../../DB/models/user.model.js";
import authMiddleware from "../../middleware/Authentication.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { uploadCloud } from "../../utils/file uploading/multerCloud.js";
import { middleValidation } from "../../middleware/validation.middleware.js";
import { createPostSchema, freezePostSchema, getSinglePostSchema, likeAndUnLikePostSchema, unFreezePostSchema, updatePostSchema } from "./post.validation.js";
import { createPost, freezePost, getActivePost, getFreezePost, getSinglePost, likeAndUnLikePost, unFreezePost, updatePost } from "./post.service.js";

const router = Router({caseSensitive: true, strict: true, mergeParams: true});
// caseSensitive   endPoint ("/like") != ("/Like")
// strict   endPoint ("/like/") != ("/like")
// mergeParams   


// create post
router.post(
  "/",
  asyncHandler(authMiddleware),
  isAuthorized(roles.user),
  uploadCloud().array("images", 5),
  middleValidation(createPostSchema),
  asyncHandler(createPost),
);


// update post
router.patch(
  "/:id",
  asyncHandler(authMiddleware),
  isAuthorized(roles.user),
  uploadCloud().array("images", 5),
  middleValidation(updatePostSchema),
  asyncHandler(updatePost),
);


// soft delete post
router.patch
(
  "/:id/freeze",
  asyncHandler(authMiddleware),
  isAuthorized(roles.user, roles.admin),
  uploadCloud().array("images", 5),
  middleValidation(freezePostSchema),
  asyncHandler(freezePost),
);

// unfreeze post
router.patch
(
  "/:id/unfreeze",
  asyncHandler(authMiddleware),
  isAuthorized(roles.user, roles.admin),
  uploadCloud().array("images", 5),
  middleValidation(unFreezePostSchema),
  asyncHandler(unFreezePost),
);

// Get All Active post
router.get
(
  "/active",
  asyncHandler(authMiddleware),
  isAuthorized(roles.user, roles.admin),
  asyncHandler(getActivePost),
);

// Get All Freezed post
router.get
(
  "/freeze",
  asyncHandler(authMiddleware),
  isAuthorized(roles.user, roles.admin),
  asyncHandler(getFreezePost),
);

// Get Single post
router.get
(
  "/:id",
  asyncHandler(authMiddleware),
  isAuthorized(roles.user, roles.admin),
  middleValidation(getSinglePostSchema),
  asyncHandler(getSinglePost),
);


// Like & unLike

router.patch(
  "/:id/like-unlike",
  asyncHandler(authMiddleware),
  isAuthorized(roles.user),
  middleValidation(likeAndUnLikePostSchema),
  asyncHandler(likeAndUnLikePost),
);




export default router;
