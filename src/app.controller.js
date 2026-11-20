import connectDB from "./DB/connection.js";
import authRouter from "./modules/auth/auth.controller.js";
import commentRouter from "./modules/comment/comment.controller.js";
import postRouter from "./modules/post/post.controller.js";
import userRouter from "./modules/user/user.controller.js";
import path from "node:path";

const boottstrap = async (app, express) => {
  // Connect to the database
  await connectDB();

  // Middleware
  app.use(express.json());

  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/post", postRouter);
  app.use("/comment", commentRouter);

  // Routes
  app.all("/{*splat}", (req, res, next) => {
    next(new Error("Route not found", { cause: 404 }));
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.log(err);
    const statusCode = err.cause || 500;
    return res
      .status(statusCode)
      .json({ success: false, error: err.message, stack: err.stack });
  });
};

export default boottstrap;
