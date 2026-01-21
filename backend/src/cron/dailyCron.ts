import { connectDb } from "../config/db.js"
import { assignDailyProblems } from "../services/dailyAssignment.js"

async function run() {
  try {
    console.log("Connecting to database...")
    await connectDb()

    console.log("Running daily problem assignment")
    await assignDailyProblems()

    console.log("Daily problems assigned successfully")
    process.exit(0)
  } catch (err) {
    console.error("Daily assignment failed", err)
    process.exit(1)
  }
}

run()
