import { startOfDay } from "date-fns"
import { toZonedTime } from "date-fns-tz"

export const toDay = () => {
  const istNow = toZonedTime(new Date(), "Asia/Kolkata")
  return startOfDay(istNow)
}
