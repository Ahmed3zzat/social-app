import { Router } from "express";
import { roles } from "../../DB/models/user.model.js";
import { asyncHandler } from "../../middleware/asyncHandler.js";
import { loginWithGmailSchema, sendOtpSchema } from "./auth.validation.js";
import {
    forgetPassword,
  loginUserService,
  loginWithGmail,
  refreshToken,
  registerUser,
  resetPassword,
  sendOtp,
} from "./auth.service.js";
import isAuthorized from "../../middleware/Authorization.middleware.js";
import { middleValidation } from "../../middleware/validation.middleware.js";
import authMiddleware from "../../middleware/Authentication.js";

const router = Router();

// activate account route
router.post(
  "/send-otp",
  middleValidation(sendOtpSchema),
  asyncHandler(sendOtp),
);

// Example route for user registration
router.post("/register", asyncHandler(registerUser));

// Example route for user login
router.post("/login", asyncHandler(loginUserService));

// 
router.post("/forget-password", asyncHandler(forgetPassword));

router.post("/reset-password", asyncHandler(resetPassword));

router.post(
  "/refresh-token",

  asyncHandler(refreshToken),
);

router.post('/login-with-gmail',   middleValidation(loginWithGmailSchema),asyncHandler(loginWithGmail))

export default router;
