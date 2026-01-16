import dotenv from "dotenv";

dotenv.config();

const env = {
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  mongoUri: process.env.MONGO_URI ?? "mongodb://localhost:27017/daily-prep",
  jwtSecret: process.env.JWT_SECRET ?? "change-me",
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  cronSchedule: process.env.CRON_SCHEDULE ?? "0 3 * * *",
  defaultCooldownDays: process.env.DEFAULT_COOLDOWN_DAYS
    ? Number(process.env.DEFAULT_COOLDOWN_DAYS)
    : 14,

    firebaseProjectId: process.env.FIREBASE_PROJECT_ID as string,
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY as string
};

export default env;

