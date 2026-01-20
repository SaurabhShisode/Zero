import cron from "node-cron";
import { assignDailyProblems } from "../services/dailyAssignment.js";

export const startDailyCron = () => {
  cron.schedule(
    "0 0 * * *",
    async () => {
      try {
        console.log("Running daily problem assignment");
        await assignDailyProblems();
        console.log("Daily problems assigned successfully");
      } catch (err) {
        console.error("Daily assignment failed", err);
      }
    },
    {
      timezone: "Asia/Kolkata"
    }
  );
};
