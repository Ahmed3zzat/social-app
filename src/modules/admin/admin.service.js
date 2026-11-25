import Post from "../../DB/models/post.model.js";
import User from "../../DB/models/user.model.js";

export const getAll = async (req, res, next) => {
  const [users, posts] = await Promise.all([
    User.find(),
    Post.find(),
  ]);

  if (posts.length === 0) {
    return next(new Error("Post not found", { cause: 404 }));
  }

  if (users.length === 0) {
    return next(new Error("User not found", { cause: 404 }));
  }

  return res.status(200).json({
    success: true,
    data: {
      users,
      posts,
    },
  });
};

export const changeRole = async (req, res, next) => {
  const { role } = req.body;
  const targetUser = req.targetUser;

  targetUser.role = role;
  await targetUser.save();

  return res.status(200).json({
    success: true,
    message: "Role changed successfully",
    data: { user: targetUser },
  });
};