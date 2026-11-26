import morgan from "morgan";
import connectDB from "./DB/connection.js";
import adminRouter from "./modules/admin/admin.controller.js";
import authRouter from "./modules/auth/auth.controller.js";
import commentRouter from "./modules/comment/comment.controller.js";
import postRouter from "./modules/post/post.controller.js";
import userRouter from "./modules/user/user.controller.js";
import path from "node:path";
import cors from "cors";

const boottstrap = async (app, express) => {
  // ==================== Database Connection ====================
  await connectDB();

  // ==================== CORS ====================
  /*
  const whitelist = ["http://127.0.0.1:5500", "http://127.0.0.1:5000"];
  app.use((req, res, next) => {
    const origin = req.header("origin");
      // Allow requests without Origin (Postman, server-to-server)
    if (!whitelist.includes(origin)) {
      return next(new Error("Blocked By CORS!"));
    }
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Headers", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Access-Control-Private-Network", true);

    // local >> private network
    // deploy >> public network

    // Front-end "localhost" >> private network
    // Back-end deploy >> public network
    return next();
  });
*/

  // ==================== CORS ====================

  // const whitelist = [
  //   "http://127.0.0.1:5500",
  //   "http://127.0.0.1:5000",
  //   "https://social-platform-tawny-kappa.vercel.app"
  // ];

  app.use(cors()); //{
  //   origin: (origin, callback) => {
  //     // Allow requests without Origin (Postman, server-to-server)
  //     if (!origin || whitelist.includes(origin)) {
  //       return callback(null, true);
  //     }

  //     return callback(new Error("Blocked By CORS!"));
  //   },

  //   methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  //   allowedHeaders: ["Content-Type", "Authorization"],

  //   optionsSuccessStatus: 204,
  // }),

  // ==================== Logger ====================
  app.use(morgan("combined"));

  //   // ==================== Body Parsers ====================
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ==================== Static Files ====================
  app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

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
