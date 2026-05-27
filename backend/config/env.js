import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const required = ["MONGODB_URI"];

const get = (key, fallback = "") => process.env[key] || fallback;

const legacyJwtSecret = get("JWT_SECRET");
const jwtAccessSecret = get("JWT_ACCESS_SECRET", legacyJwtSecret);
const jwtRefreshSecret = get("JWT_REFRESH_SECRET", get("JWT_REFRESH_TOKEN_SECRET", legacyJwtSecret));

if (!jwtAccessSecret) required.push("JWT_ACCESS_SECRET or JWT_SECRET");
if (!jwtRefreshSecret) required.push("JWT_REFRESH_SECRET or JWT_SECRET");

const missing = required.filter((key) => {
  if (key.includes(" or ")) {
    return key.split(" or ").every((candidate) => !process.env[candidate]);
  }
  return !process.env[key];
});

if (missing.length > 0) {
  throw new Error(`Missing required environment variable(s): ${missing.join(", ")}`);
}

if (legacyJwtSecret && (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET)) {
  console.warn(
    "JWT_SECRET is being used as a fallback. For production, set separate JWT_ACCESS_SECRET and JWT_REFRESH_SECRET values."
  );
}

export const env = {
  nodeEnv: get("NODE_ENV", "development"),
  port: Number(get("PORT", "5000")),
  clientUrl: get("CLIENT_URL", "http://localhost:5173"),
  mongoUri: get("MONGODB_URI"),
  jwtAccessSecret,
  jwtRefreshSecret,
  jwtAccessExpiresIn: get("JWT_ACCESS_EXPIRES_IN", "15m"),
  jwtRefreshExpiresIn: get("JWT_REFRESH_EXPIRES_IN", "7d"),
  refreshCookieName: get("REFRESH_COOKIE_NAME", "refreshToken"),
  cloudinaryCloudName: get("CLOUDINARY_CLOUD_NAME"),
  cloudinaryApiKey: get("CLOUDINARY_API_KEY"),
  cloudinaryApiSecret: get("CLOUDINARY_API_SECRET"),
  adminEmail: get("ADMIN_EMAIL"),
  adminPassword: get("ADMIN_PASSWORD"),
  adminSecretKey: get("ADMIN_SECRET_KEY")
};

export const isProduction = env.nodeEnv === "production";
