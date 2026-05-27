import "../config/env.js";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import { env } from "../config/env.js";

await connectDB();

const email = env.adminEmail;
const password = env.adminPassword;

if (!email || !password) {
  console.error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  process.exit(1);
}

const existing = await User.findOne({ email });
if (existing) {
  existing.role = "admin";
  existing.password = password;
  await existing.save({ validateBeforeSave: false });
  console.log(`Updated admin: ${email}`);
} else {
  await User.create({
    username: "Blagonku Admin",
    email,
    password,
    role: "admin"
  });
  console.log(`Created admin: ${email}`);
}

process.exit(0);
