import User from "../DB/models/user.model.js";
import { decodedToken } from "../utils/token/token.js";


const authMiddleware = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next(new Error("Authentication required", { cause: 401 }));
  }

  const [bearer, token] = authorization.split(" ");

  if (bearer !== "Bearer" || !token) {
    return next(new Error("Authentication required", { cause: 401 }));
  }

  try {
    const decoded = decodedToken({ token });

    const user = await User.findById(decoded.id).select("-password").lean();

    if (!user) {
      return next(new Error("User not found", { cause: 401 }));
    }

    if (user.isDeleted) {
      return next(new Error("User Deleted", { cause: 401 }));
    }

    if (user.frozen) {
      return next(new Error("Account is frozen", { cause: 403 }));
    }

    if (!user.isActivated) {
      return next(new Error("Account is not activated", { cause: 403 }));
    }

    if (
      user.passwordChangedAt &&
      Math.floor(user.passwordChangedAt.getTime() / 1000) > decoded.iat
    ) {
      return next(
        new Error("Token expired, please login again!", { cause: 401 }),
      );
    }

    req.user = user;

    return next();
  } catch (error) {
    if (error.cause) {
      return next(error);
    }

    if (error.name === "TokenExpiredError") {
      return next(
        new Error("Token expired, please login again!", { cause: 401 }),
      );
    }

    if (error.name === "JsonWebTokenError") {
      return next(new Error("Invalid token", { cause: 401 }));
    }

    return next(error);
  }
};

export default authMiddleware;
