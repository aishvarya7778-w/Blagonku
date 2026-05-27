import "./config/env.js";
import app from "./app.js";
import connectDB from "./config/db.js";
import { env } from "./config/env.js";

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(env.port, () => {
      console.log(`Blagonku API running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

process.on("unhandledRejection", (error) => {
  console.error("Unhandled rejection:", error);
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});
