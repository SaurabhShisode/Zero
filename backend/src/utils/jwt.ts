import jwt from "jsonwebtoken";
import env from "../config/env.js";

export const signToken = (userId: string) =>
  jwt.sign({ userId }, env.jwtSecret, { expiresIn: "7d" });

