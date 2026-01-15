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
import profileRoutes from "./routes/profile.js";
import problemRoutes from "./routes/problems.js";
import { assignDailyProblems } from "./services/dailyAssignment.js";
const app = express();
app.use(cors({
    origin: env.clientUrl,
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/preferences", preferencesRoutes);
app.use("/api/daily", dailyRoutes);
app.use("/api/solve", solveRoutes);
app.use("/api/discussion", discussionRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/problems", problemRoutes);
app.get("/health", (_req, res) => res.json({ ok: true }));
const start = async () => {
    await connectDb();
    app.listen(env.port, () => {
        // eslint-disable-next-line no-console
        console.log(`API running on :${env.port}`);
    });
    cron.schedule(env.cronSchedule, async () => {
        try {
            await assignDailyProblems();
            // eslint-disable-next-line no-console
            console.log("Daily problems assigned");
        }
        catch (err) {
            // eslint-disable-next-line no-console
            console.error("Cron failed", err);
        }
    });
};
start();
//# sourceMappingURL=server.js.map