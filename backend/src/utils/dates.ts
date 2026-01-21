import { startOfDay } from "date-fns"
import { toZonedTime } from "date-fns-tz"

export const toDay = (date?: Date | string | number) => {
  const base = date ? new Date(date) : new Date()
  const istNow = toZonedTime(base, "Asia/Kolkata")
  return startOfDay(istNow)
}
