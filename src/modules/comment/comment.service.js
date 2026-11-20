import { Comment } from "../../DB/models/comment.model.js";
import Post from "../../DB/models/post.model.js";
import { roles } from "../../DB/models/user.model.js";
import cloudinary from "../../utils/file uploading/cloudinary.config.js";

// ==================== Create Comment ====================
const createComment = async (req, res, next) => {
  const { text } = req.body;
  const { file, user } = req;
  const { postId } = req.params;

  const post = await Post.findOne({
    _id: postId,
    isDeleted: false,
  });
  let image;
  if (!post) {
    return next(new Error("Post not found", { cause: 404 }));
  }
  if (file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/user/${post.user}/posts/${post.cloudFolder}/comments`,
      },
    );
    image = { secure_url, public_id };
  }

  const comment = await Comment.create({
    image,
    text,
    user: user._id,
    post: postId,
  });

  /*
      const cloudFolder = nanoid();
     folder: `${process.env.CLOUD_FOLDER_NAME}/user/${_id}/posts/${cloudFolder}`,
  */

  return res.status(201).json({
    success: true,
    message: "Comment Create successfully",
    data: {
      comment,
    },
  });
};

// ==================== Update Comment ====================
const updateComment = async (req, res, next) => {
  const { text } = req.body;
  const { file, user } = req;
  const { commentId } = req.params;

  // Check if comment exists
  const comment = await Comment.findOne({
    _id: commentId,
    isDeleted: false,
  });

  if (!comment) {
    return next(new Error("Comment not found", { cause: 404 }));
  }

  // Check comment ownership
  if (comment.user.toString() !== user._id.toString()) {
    return next(new Error("User Not Authorized", { cause: 403 }));
  }

  // Check if post exists
  const postExist = await Post.findOne({
    _id: comment.post,
    isDeleted: false,
  });

  if (!postExist) {
    return next(new Error("Post not found", { cause: 404 }));
  }

  let image;
  let oldImagePublicId;

  // Upload new image if provided
  if (file) {
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      file.path,
      {
        folder: `${process.env.CLOUD_FOLDER_NAME}/user/${postExist.user}/posts/${postExist.cloudFolder}/comments`,
      },
    );

    image = { secure_url, public_id };

    oldImagePublicId = comment.image?.public_id;

    comment.image = image;
  }

  // Update text if provided
  if (text !== undefined) {
    comment.text = text;
  }

  // Save updated comment
  await comment.save();

  // Delete old image after successful save
  if (oldImagePublicId) {
    await cloudinary.uploader.destroy(oldImagePublicId);
  }

  return res.status(200).json({
    success: true,
    message: "Comment Updated successfully",
    data: {
      comment,
    },
  });
};


// ==================== Soft Delete Comment ====================
const deleteComment = async (req, res, next) => {
  const { user } = req;
  const { commentId } = req.params;

  // Check if comment exists
  const comment = await Comment.findOne({
    _id: commentId,
    isDeleted: false,
  });

  if (!comment) {
    return next(new Error("Comment not found", { cause: 404 }));
  }

  // Check if post exists
  const post = await Post.findOne({
    _id: comment.post,
    isDeleted: false,
  });

  if (!post) {
    return next(new Error("Post not found", { cause: 404 }));
  }

  // Check permissions
  const commentOwner =
    comment.user.toString() === user._id.toString();

  const postOwner =
    post.user.toString() === user._id.toString();

  const admin = user.role === roles.admin;

  if (!commentOwner && !postOwner && !admin) {
    return next(new Error("Not Allowed To delete!", { cause: 403 }));
  }

  // Soft Delete Comment
  comment.isDeleted = true;
  comment.deletedBy = user._id;

  await comment.save();

  return res.status(200).json({
    success: true,
    message: "Comment Deleted successfully",
    data: {
      comment,
    },
  });
};

// ==================== Soft Delete Comment ====================
const getComment = async (req, res, next) => {
  const { postId } = req.params;

  // Check if post exists
  const post = await Post.findOne({
    _id: postId,
    isDeleted: false,
  });
  if (!post) {
    return next(new Error("Post not found", { cause: 404 }));
  }
  // Check if comment exists
  const comment = await Comment.find({
    post: postId,
    isDeleted: false,
  });
  if (!comment) {
    return next(new Error("Comment not found", { cause: 404 }));
  }

  return res.status(200).json({
    success: true,
    data: {
      comment,
    },
  });
};




export { createComment, updateComment, deleteComment,getComment };
