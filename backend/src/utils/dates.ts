import { startOfDay } from "date-fns";

export const toDay = (date?: Date | string | number) => startOfDay(date ? new Date(date) : new Date());

