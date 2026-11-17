import { Router } from "express";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import authMiddleware from "../../middleware/Authentication.js";
import {
  confirmPassword,
  confirmUpdateEmail,
  deleteProfilePicture,
  deleteProfilePictureCloudnairy,
  getAllProfiles,
  shareProfile,
  updateEmail,
  updateProfile,
  uploadCoverPictures,
  uploadProfilePicture,
  uploadProfilePictureCloudnairy,
} from "./user.service.js";
import {
  confirmPasswordSchema,
  confirmUpdateEmailSchema,
  shareProfileSchema,
  updateEmailSchema,
  updateUserSchema,
} from "./user.validation.js";
import { middleValidation } from "../../middleware/validation.middleware.js";
import {
  fileValidation,
  uploadFileDisk,
} from "../../utils/file uploading/multerUploading.js";
import { uploadCloud } from "../../utils/file uploading/multerCloud.js";

const router = Router();

router.get("/", asyncHandler(authMiddleware), asyncHandler(getAllProfiles));

router.get(
  "/:id",
  asyncHandler(authMiddleware),
  middleValidation(shareProfileSchema),
  asyncHandler(shareProfile),
);

router.patch(
  "/update-profile",
  asyncHandler(authMiddleware),
  middleValidation(updateUserSchema),
  asyncHandler(updateProfile),
);

router.patch(
  "/update-email",
  asyncHandler(authMiddleware),
  middleValidation(updateEmailSchema),
  asyncHandler(updateEmail),
);

router.patch(
  "/confirm-update-email",
  asyncHandler(authMiddleware),
  middleValidation(confirmUpdateEmailSchema),
  asyncHandler(confirmUpdateEmail),
);

router.patch(
  "/confirmPassword",
  asyncHandler(authMiddleware),
  middleValidation(confirmPasswordSchema),
  asyncHandler(confirmPassword),
);

// Upload Profile Picture
router.patch(
  "/upload-profile-picture",
  asyncHandler(authMiddleware),
  uploadFileDisk(fileValidation.images, "profile-photos").single(
    "profilePicture",
  ),
  asyncHandler(uploadProfilePicture),
);

// Upload Cover Pictures
router.patch(
  "/upload-cover-pictures",
  asyncHandler(authMiddleware),
  uploadFileDisk(fileValidation.images, "cover-photos").array(
    "coverPictures",
    5,
  ),
  asyncHandler(uploadCoverPictures),
);

// Upload Cover Pictures
router.post(
  "/testFields",
  asyncHandler(authMiddleware),
  uploadFileDisk(fileValidation.images, "test-fields").fields([
    { name: "pets", maxCount: 3 },
    { name: "cars", maxCount: 5 },
  ]),
  (req, res, next) => {
    return res.json({ files: req.files });
  },
);

router.delete(
  "/profile-picture",
  asyncHandler(authMiddleware),
  asyncHandler(deleteProfilePicture),
);

// Upload Profile Picture With Cloud
router.post(
  "/upload-profile-picture-cloud",
  asyncHandler(authMiddleware),
  uploadCloud().single("profilePicture"),
  asyncHandler(uploadProfilePictureCloudnairy),
);

router.delete(
  "/remove-profile-picture-cloud",
  asyncHandler(authMiddleware),
  uploadCloud().single("profilePicture"),
  asyncHandler(deleteProfilePictureCloudnairy),
);

// delete folder from cloudnairy

export default router;
