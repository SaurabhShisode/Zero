import { User } from "../models/User.js"
import { DailyProblem } from "../models/DailyProblem.js"
import { Solve } from "../models/Solve.js"
import { toDay } from "../utils/dates.js"
import { createNotification } from "../controllers/notificationController.js"

export async function sendEveningReminders() {
  try {
    const today = toDay()
    const users = await User.find().select("_id preferences")

    for (const user of users) {
      const enabledSkills = user.preferences
        .filter((p: any) => p.enabled)
        .map((p: any) => p.skill)

      if (enabledSkills.length === 0) continue

      const dailyProblems = await DailyProblem.find({
        date: today,
        skill: { $in: enabledSkills },
      }).select("problem")

      if (dailyProblems.length === 0) continue

      const problemIds = dailyProblems.map((dp) => dp.problem)

      const solvedCount = await Solve.countDocuments({
        user: user._id,
        date: today,
        problem: { $in: problemIds },
        status: "solved",
      })

      const remaining = dailyProblems.length - solvedCount

      if (remaining > 0) {
        await createNotification(
          user._id,
          "reminder",
          `${remaining} daily problem${remaining > 1 ? "s" : ""} remaining`,
          "Don't forget to finish your daily practice!"
        )
      }
    }

    console.log("Evening reminders sent successfully")
  } catch (err) {
    console.error("Failed to send evening reminders", err)
  }
}
