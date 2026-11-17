import Joi from "joi";
import { isValidOBJ } from "../../middleware/validation.middleware.js";

const fileSchema = Joi.object({
  fieldname: Joi.string().required(),
  originalname: Joi.string().required(),
  mimetype: Joi.string()
    .valid("image/png", "image/jpeg", "image/jpg", "image/jfif")
    .required(),
  destination: Joi.string().required(),
  filename: Joi.string().required(),
  encoding: Joi.string().required(),
  path: Joi.string().required(),
  size: Joi.number()
    .positive()
    .max(9 * 1024 * 1024)
    .required(),
});

export const createPostSchema = Joi.object({
  text: Joi.string().trim().min(2).optional(),
  file: Joi.array().items(fileSchema).min(1).max(5).optional(),
}).or("text", "file");

export const updatePostSchema = Joi.object({
  id: Joi.custom(isValidOBJ).required(),
  text: Joi.string().trim().min(2).optional(),
  file: Joi.array().items(fileSchema).min(1).max(5).optional(),
}).or("text", "file");

export const freezePostSchema = Joi.object({
  id: Joi.custom(isValidOBJ).required(),
});

export const unFreezePostSchema = Joi.object({
  id: Joi.custom(isValidOBJ).required(),
});

export const getSinglePostSchema = Joi.object({
  id: Joi.custom(isValidOBJ).required(),
});

export const likeAndUnLikePostSchema = Joi.object({
  id: Joi.custom(isValidOBJ).required(),
});
