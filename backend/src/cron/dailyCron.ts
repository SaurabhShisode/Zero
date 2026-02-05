import { connectDb } from "../config/db.js"
import { assignDailyProblems } from "../services/dailyAssignment.js"
import { User } from "../models/User.js"
import { subDays, startOfDay } from "date-fns"
import { toZonedTime } from "date-fns-tz"

async function resetInactiveStreaks() {
  const now = new Date()
  const istNow = toZonedTime(now, "Asia/Kolkata")
  const yesterday = startOfDay(subDays(istNow, 1))

  const result = await User.updateMany(
    {
      "streak.current": { $gt: 0 },
      $or: [
        { "streak.lastActivityDate": { $lt: yesterday } },
        { "streak.lastActivityDate": null }
      ]
    },
    { $set: { "streak.current": 0 } }
  )

  console.log(`Reset ${result.modifiedCount} inactive streaks`)
}

async function run() {
  try {
    console.log("Connecting to database...")
    await connectDb()

    console.log("Resetting inactive streaks...")
    await resetInactiveStreaks()

    console.log("Running daily problem assignment")
    await assignDailyProblems()

    console.log("Daily cron completed successfully")
    process.exit(0)
  } catch (err) {
    console.error("Daily cron failed", err)
    process.exit(1)
  }
}

run()
