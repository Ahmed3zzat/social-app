import Joi from "joi";

// ==================== Share Specific Profile ====================

export const shareProfileSchema = Joi.object({
  id: Joi.string()
    .hex()
    .length(24)
    .required()
    .messages({
      "string.hex": "Invalid user ID",
      "string.length": "User ID must be 24 characters",
      "any.required": "User ID is required",
    }),
}).required();

// ==================== Update Profile ====================

export const updateUserSchema = Joi.object({
  userName: Joi.string()
    .trim()
    .min(3)
    .max(30)
    .messages({
      "string.base": "User name must be a string",
      "string.empty": "User name cannot be empty",
      "string.min": "User name must be at least 3 characters",
      "string.max": "User name must not exceed 30 characters",
    }),
})
  .min(1)
  .required()
  .messages({
    "object.min": "At least one field is required for update",
  });

// ==================== Update Email ====================

export const updateEmailSchema = Joi.object({
  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required()
    .messages({
      "string.email": "Please provide a valid current email",
      "any.required": "Current email is required",
    }),

  newEmail: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required()
    .messages({
      "string.email": "Please provide a valid new email",
      "any.required": "New email is required",
    }),

  password: Joi.string()
    .required()
    .messages({
      "any.required": "Password is required",
      "string.empty": "Password cannot be empty",
    }),
});

// ==================== Confirm Update Email ====================

export const confirmUpdateEmailSchema = Joi.object({
  newEmail: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required()
    .messages({
      "string.email": "Please provide a valid new email",
      "any.required": "New email is required",
    }),

  otp: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "OTP is required",
      "any.required": "OTP is required",
    }),
});

// ==================== Confirm Password ====================

export const confirmPasswordSchema = Joi.object({
  oldPassword: Joi.string()
    .required()
    .messages({
      "any.required": "Old password is required",
      "string.empty": "Old password cannot be empty",
    }),

  newPassword: Joi.string()
    .min(8)
    .required()
    .messages({
      "string.min": "New password must be at least 8 characters",
      "any.required": "New password is required",
    }),
});