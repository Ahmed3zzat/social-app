import morgan from "morgan";
import connectDB from "./DB/connection.js";
import adminRouter from "./modules/admin/admin.controller.js";
import authRouter from "./modules/auth/auth.controller.js";
import commentRouter from "./modules/comment/comment.controller.js";
import postRouter from "./modules/post/post.controller.js";
import userRouter from "./modules/user/user.controller.js";
import path from "node:path";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

// ==================== General Rate Limiter ====================
// Limit 100 requests per 15 minutes

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,

  message: {
    success: false,
    message: "Too many requests, please try again later",
  },

  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
});

// ==================== Authentication Rate Limiter ====================
// Limit 5 requests per 1 minute

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,

  message: {
    success: false,
    message: "Too many authentication attempts, please try again later",
  },

  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
});

const boottstrap = async (app, express) => {
  // ==================== Database Connection ====================
  await connectDB();

  // ==================== Trust Proxy ====================
  // Important when deploying behind a proxy like Vercel
  app.set("trust proxy", 1);

  // ==================== CORS ====================
  app.use(cors());

  // ==================== Logger ====================
  app.use(morgan("combined"));

  // ==================== General Rate Limiter ====================
  app.use(apiLimiter);

  // ==================== Helemt Middleware ====================
  app.use(helmet());

  // ==================== Authentication Rate Limiter ====================
  app.use("/auth", authLimiter);

  // ==================== Body Parsers ====================
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ==================== Static Files ====================
  app.use(
    "/uploads",
    express.static(path.resolve(process.cwd(), "uploads"))
  );

  // ==================== Routes ====================
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/post", postRouter);
  app.use("/comment", commentRouter);
  app.use("/admin", adminRouter);

  // ==================== Not Found ====================
  app.all("/{*splat}", (req, res, next) => {
    next(new Error("Route not found", { cause: 404 }));
  });

  // ==================== Error Handling ====================
  app.use((err, req, res, next) => {
    console.log(err);

    const statusCode = err.cause || 500;

    return res.status(statusCode).json({
      success: false,
      error: err.message,
      stack: err.stack,
    });
  });
};

export default boottstrap;
