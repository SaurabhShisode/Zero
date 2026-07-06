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
import notificationRoutes from "./routes/notifications.js";
import bookmarkRoutes from "./routes/bookmarks.js";
import analyticsRoutes from "./routes/analytics.js";
import filterRoutes from "./routes/filters.js";
import studyGroupRoutes from "./routes/studyGroups.js";
import { sendEveningReminders } from "./services/eveningReminder.js";


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
app.use("/api/notifications", notificationRoutes)
app.use("/api/bookmarks", bookmarkRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/filters", filterRoutes)
app.use("/api/study-groups", studyGroupRoutes)

app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/", (req, res) => {
  res.send("Zero Backend API is running")
})

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

  cron.schedule("30 12 * * *", () => {
    console.log("Running evening reminder cron (6 PM IST)")
    sendEveningReminders()
  })
};

start();


