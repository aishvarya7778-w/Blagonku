import User from "../models/User.js";
import {
  clearRefreshCookie,
  hashToken,
  setRefreshCookie,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} from "../utils/tokens.js";
import { env } from "../config/env.js";

const authResponse = async (res, user, status = 200) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save({ validateBeforeSave: false });
  setRefreshCookie(res, refreshToken);
  return res.status(status).json({ user: user.toSafeObject(), accessToken });
};

export const signup = async (req, res, next) => {
  try {
    const existing = await User.exists({ email: req.body.email });
    if (existing) {
      const error = new Error("Email is already registered");
      error.statusCode = 409;
      throw error;
    }

    const { adminSecretKey, ...userInput } = req.body;
    const shouldCreateAdmin = Boolean(env.adminSecretKey && adminSecretKey && adminSecretKey === env.adminSecretKey);

    const user = await User.create({
      ...userInput,
      role: shouldCreateAdmin ? "admin" : "user"
    });
    return authResponse(res, user, 201);
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select("+password +refreshTokenHash");
    const valid = user && (await user.comparePassword(req.body.password));

    if (!valid) {
      const error = new Error("Invalid email or password");
      error.statusCode = 401;
      throw error;
    }

    if (user.isSuspended) {
      const error = new Error("This account has been suspended");
      error.statusCode = 403;
      throw error;
    }

    return authResponse(res, user);
  } catch (error) {
    return next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const token = req.cookies?.[env.refreshCookieName];
    if (!token) {
      const error = new Error("Refresh token missing");
      error.statusCode = 401;
      throw error;
    }

    const payload = verifyRefreshToken(token);
    const user = await User.findById(payload.sub).select("+refreshTokenHash");

    if (!user || user.refreshTokenHash !== hashToken(token) || user.isSuspended) {
      const error = new Error("Invalid refresh token");
      error.statusCode = 401;
      throw error;
    }

    return authResponse(res, user);
  } catch (error) {
    clearRefreshCookie(res);
    error.statusCode = error.statusCode || 401;
    return next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.[env.refreshCookieName];
    if (token) {
      try {
        const payload = verifyRefreshToken(token);
        await User.findByIdAndUpdate(payload.sub, { $unset: { refreshTokenHash: "" } });
      } catch {
        // Invalid tokens are still cleared client-side.
      }
    }
    clearRefreshCookie(res);
    return res.status(200).json({ message: "Logged out" });
  } catch (error) {
    return next(error);
  }
};

export const me = (req, res) => res.status(200).json({ user: req.user });
