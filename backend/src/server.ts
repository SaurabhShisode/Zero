import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import cron from "node-cron";
import env from "./config/env.js";
import { connectDb } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import preferencesRoutes from "./routes/preferences.js";
import dailyRoutes from "./routes/daily.js";
import solveRoutes from "./routes/solve.js";
import discussionRoutes from "./routes/discussion.js";
import bugRoutes from "./routes/bugRoutes.js"
import profileRoutes from "./routes/profile.js";
import problemRoutes from "./routes/problems.js";
import communityRoutes from "./routes/community.js"
import revisionRoutes from "./routes/revision.js";


const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174", "https://zero-phyy.onrender.com"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/preferences", preferencesRoutes);
app.use("/api/daily", dailyRoutes);
app.use("/api/solve", solveRoutes);
app.use("/api/discussion", discussionRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/revision", revisionRoutes);
app.use("/api/community", communityRoutes)
app.use("/api/bugs", bugRoutes)

app.get("/health", (_req, res) => res.json({ ok: true }));

const start = async () => {
  try {
    await connectDb();
    console.log("DB connected successfully");
  } catch (err) {

    console.error("DB connection failed", err);
  }

  app.listen(env.port, () => {
 
    console.log(`API running on :${env.port}`);
  });

  
};

start();


