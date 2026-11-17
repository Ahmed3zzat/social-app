import Joi from "joi";

export const registerSchema = Joi.object({
  userName: Joi.string().trim().min(3).max(30).required().messages({
    "string.base": "User name must be a string",
    "string.empty": "User name is required",
    "any.required": "User name is required",
    "string.min": "User name must be at least 3 characters",
    "string.max": "User name must not exceed 30 characters",
  }),

  email: Joi.string().email().trim().lowercase().required().messages({
    "string.base": "Email must be a string",
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
    "any.required": "Email is required",
  }),

  password: Joi.string().min(8).required().messages({
    "string.base": "Password must be a string",
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters",
    "any.required": "Password is required",
  }),

  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "string.empty": "Confirm password is required",
    "any.only": "Passwords do not match",
    "any.required": "Confirm password is required",
  }),
}).required();

export const loginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  password: Joi.string().required().messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
}).required();

export const sendOtpSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
}).required();

export const verifyOtpSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),

  otp: Joi.string().trim().length(6).required().messages({
    "string.base": "OTP must be a string",
    "string.empty": "OTP is required",
    "string.length": "OTP must be exactly 6 characters",
    "any.required": "OTP is required",
  }),
}).required();

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required().messages({
    "string.email": "Please provide a valid email address",
    "string.empty": "Email is required",
    "any.required": "Email is required",
  }),
}).required();

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),

  otp: Joi.string().trim().length(6).required(),

  newPassword: Joi.string().min(8).required().messages({
    "string.min": "Password must be at least 8 characters",
    "any.required": "New password is required",
  }),

  confirmPassword: Joi.string()
    .valid(Joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Passwords do not match",
      "any.required": "Confirm password is required",
    }),
}).required();

export const loginWithGmailSchema = Joi.object({
    idToken: Joi.string().trim().required().messages({
    "string.base": "id-token must be a string",
    "string.empty": "id-token is required",
    "any.required": "id-token is required",
  }),
});
