import crypto from "crypto";
import jwt from "jsonwebtoken";
import { env, isProduction } from "../config/env.js";

export const signAccessToken = (user) =>
  jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn
  });

export const signRefreshToken = (user) =>
  jwt.sign(
    { sub: user._id.toString(), tokenVersion: crypto.randomUUID() },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpiresIn }
  );

export const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

export const setRefreshCookie = (res, token) => {
  res.cookie(env.refreshCookieName, token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

export const clearRefreshCookie = (res) => {
  res.clearCookie(env.refreshCookieName, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax"
  });
};

export const verifyAccessToken = (token) => jwt.verify(token, env.jwtAccessSecret);

export const verifyRefreshToken = (token) => jwt.verify(token, env.jwtRefreshSecret);
