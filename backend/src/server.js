import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import jobRoutes from "./routes/jobs.js";
import resumeRoutes from "./routes/resume.js";
import recommendationRoutes from "./routes/recommendations.js";

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
}));

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "JobMatch AI backend" });
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/recommendations", recommendationRoutes);

app.use((error, _req, res, _next) => {
  res.status(400).json({ message: error.message || "Request failed." });
});

const port = process.env.PORT || 5000;

try {
  await mongoose.connect(process.env.MONGODB_URI);
  app.listen(port, () => {
    console.log(`JobMatch AI backend running on port ${port}`);
  });
} catch (error) {
  console.error("MongoDB connection failed:", error.message);
  process.exit(1);
}
