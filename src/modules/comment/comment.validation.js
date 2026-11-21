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

const createCommentSchema = Joi.object({
  text: Joi.string().trim().min(2).optional(),
  file: fileSchema.optional(),
  postId: Joi.custom(isValidOBJ).required(),
}).or("text", "file");

const updateCommentSchema = Joi.object({
  text: Joi.string().trim().min(2).optional(),
  file: fileSchema.optional(),
  commentId: Joi.custom(isValidOBJ).required(),
}).or("text", "file");

const deleteCommentSchema = Joi.object({
  commentId: Joi.custom(isValidOBJ).required(),
});
const getCommentSchema = Joi.object({
  postId: Joi.custom(isValidOBJ).required(),
});

const likeAndUnLikeCommentSchema = Joi.object({
  postId: Joi.custom(isValidOBJ).required(),
});
const replayCommentSchema = Joi.object({
  text: Joi.string().trim().min(2).optional(),
  file: fileSchema.optional(),
  postId: Joi.custom(isValidOBJ).required(),
  commentId: Joi.custom(isValidOBJ).required(),
}).or("text", "file");

export {
  createCommentSchema,
  updateCommentSchema,
  deleteCommentSchema,
  getCommentSchema,
  likeAndUnLikeCommentSchema,
  replayCommentSchema,
};
