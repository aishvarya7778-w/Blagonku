import User from "../models/User.js";
import { verifyAccessToken } from "../utils/tokens.js";

export const authMiddleware = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      const error = new Error("Authentication required");
      error.statusCode = 401;
      throw error;
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select("-password -refreshTokenHash");

    if (!user || user.isSuspended) {
      const error = new Error("Account is unavailable");
      error.statusCode = 401;
      throw error;
    }

    req.user = user;
    next();
  } catch (error) {
    error.statusCode = error.statusCode || 401;
    next(error);
  }
};

export const adminMiddleware = (req, _res, next) => {
  if (req.user?.role !== "admin") {
    const error = new Error("Admin access required");
    error.statusCode = 403;
    return next(error);
  }
  return next();
};
