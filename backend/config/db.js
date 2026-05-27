import mongoose from "mongoose";
import { env, isProduction } from "./env.js";

const connectDB = async () => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongoUri, {
    autoIndex: !isProduction,
    serverSelectionTimeoutMS: 10000
  });

  console.log("MongoDB connected");
};

export default connectDB;
