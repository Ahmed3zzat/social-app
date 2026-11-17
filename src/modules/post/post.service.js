import { nanoid } from "nanoid";
import Post from "../../DB/models/post.model.js";
import User, { roles } from "../../DB/models/user.model.js";
import cloudinary from "../../utils/file uploading/cloudinary.config.js";

// ==================== Create Post ====================
export const createPost = async (req, res, next) => {
  const { text } = req.body;
  const { _id } = req.user;

  const user = await User.findById(_id);
  const files = req.files || [];
  // ================== Check Files ====================

  if (files.length === 0 && !text?.trim()) {
    return next(
      new Error("Post must contain text or at least one image", {
        cause: 400,
      }),
    );
  }

  // ==================== Upload Images ====================
  const cloudFolder = nanoid();

  const images = await Promise.all(
    files.map(async (file) => {
      const { public_id, secure_url } = await cloudinary.uploader.upload(
        file.path,
        {
          folder: `${process.env.CLOUD_FOLDER_NAME}/user/${_id}/posts/${cloudFolder}`,
        },
      );

      return {
        public_id,
        secure_url,
      };
    }),
  );

  // ==================== Create Post ====================

  const post = await Post.create({
    text,
    images,
    cloudFolder,
    user: _id,
  });

  return res.status(201).json({
    success: true,
    message: "Post created successfully",
    data: {
      post,
    },
  });
};

// ==================== Update Post ====================
export const updatePost = async (req, res, next) => {
  const { text } = req.body;
  const { id } = req.params;
  const user = req.user;

  const post = await Post.findOne({
    _id: id,
    user: user._id,
  });

  if (!post) {
    return next(new Error("Post not found", { cause: 404 }));
  }

  const files = req.files || [];

  // ==================== Check Files ====================

  if (!text?.trim() && files.length === 0) {
    return next(
      new Error("Please provide text or images to update the post", {
        cause: 400,
      }),
    );
  }

  // ==================== Upload Images ====================

  if (files.length > 0) {
    // Keep old images before replacing them
    const oldImages = post.images;

    // Upload new images
    const images = await Promise.all(
      files.map(async (file) => {
        const { public_id, secure_url } = await cloudinary.uploader.upload(
          file.path,
          {
            folder: `${process.env.CLOUD_FOLDER_NAME}/user/${user._id}/posts/${post.cloudFolder}`,
          },
        );

        return {
          public_id,
          secure_url,
        };
      }),
    );

    // Replace old images with new images
    post.images = images;

    // Delete old images from Cloudinary
    for (const image of oldImages) {
      await cloudinary.uploader.destroy(image.public_id);
    }
  }

  // ==================== Update Text ====================

  if (text?.trim()) {
    post.text = text;
  }

  // ==================== Save Post ====================

  await post.save();

  return res.status(200).json({
    success: true,
    message: "Post updated successfully",
    data: {
      post,
    },
  });
};

// ==================== Soft Delete Post ====================
export const freezePost = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;

  const post = await Post.findById(id);

  if (!post) {
    return next(new Error("Post not found", { cause: 404 }));
  }

  // ==================== Check Files ====================

  if (post.user.toString() == user._id.toString() || user.role == roles.admin) {
    post.isDeleted = true;
    post.deletedBy = user._id;
  }

  await post.save();

  return res.status(200).json({
    success: true,
    message: "Post Deleted successfully",
    data: {
      post,
    },
  });
};

// ==================== UN Freeze Post ====================
export const unFreezePost = async (req, res, next) => {
  const { id } = req.params;
  const user = req.user;

  const post = await Post.findByIdAndUpdate(
    {
      _id: id,
      isDeleted: true,
      deletedBy: user._id,
    },
    {
      isDeleted: false,
      $unset: { deletedBy: 0 },
    },
    { new: true, runValidators: true },
  );

  if (!post) {
    return next(new Error("Post not found", { cause: 404 }));
  }

  await post.save();

  return res.status(200).json({
    success: true,
    message: "Post Retrived successfully",
    data: {
      post,
    },
  });
};

// ==================== Ge Single Post ====================
export const getSinglePost = async (req, res, next) => {
  const user = req.user;
  const { id } = req.params;

  const post = await Post.find({ _id: id, isDeleted: false }).populate({
    path: "user",
    select: "profilePicture.secure_url userName",
  });

  if (!post) {
    return next(new Error("Post not found", { cause: 404 }));
  }

  return res.status(200).json({
    success: true,
    data: {
      post,
    },
  });
};

// ==================== Get All Active Post ====================
export const getActivePost = async (req, res, next) => {
  const user = req.user;

  let posts;
  if (user.role == roles.admin) {
    posts = await Post.find({ isDeleted: false }).populate({
      path: "user",
      select: "profilePicture.secure_url userName",
    });
  } else if (user.role == roles.user) {
    posts = await Post.find({ isDeleted: false, user: user._id }).populate({
      path: "user",
      select: "profilePicture.secure_url userName",
    });
  }

  if (posts.length === 0) {
    return next(new Error("Posts not found", { cause: 404 }));
  }

  return res.status(200).json({
    success: true,
    data: {
      posts,
    },
  });
};

// ==================== Get All Active Post ====================
export const getFreezePost = async (req, res, next) => {
  const user = req.user;

  let posts;
  if (user.role == roles.admin) {
    posts = await Post.find({ isDeleted: true }).populate({
      path: "user",
      select: "profilePicture.secure_url userName",
    });
  } else if (user.role == roles.user) {
    posts = await Post.find({ isDeleted: true, user: user._id }).populate({
      path: "user",
      select: "profilePicture.secure_url userName",
    });
  }

  if (posts.length === 0) {
    return next(new Error("Posts not found", { cause: 404 }));
  }

  return res.status(200).json({
    success: true,
    data: {
      posts,
    },
  });
};

// ==================== Update Post ====================
export const likeAndUnLikePost = async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const post = await Post.findOne({
    _id: id,
    isDeleted: false,
  })
  if (!post) {
    return next(new Error("Post not found", { cause: 404 }));
  }

  const userExist = post.likes.find(
    (user) => user.toString() == userId.toString(),
  );
  if (!userExist) {
    post.likes.push(userId);
  } else {
    post.likes = post.likes.filter(
      (user) => user.toString() != userId.toString(),
    );
  }

  await post.save();
  const populatedPost =await Post.findOne({
    _id: id,
    isDeleted: false,
  }).populate({
    path: "likes",
    select: "profilePicture.secure_url userName",
  });

  return res.status(200).json({
    success: true,
    data: {
      post:populatedPost,
    },
  });
};
