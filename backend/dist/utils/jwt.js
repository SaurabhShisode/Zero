import jwt from "jsonwebtoken";
import env from "../config/env.js";
export const signToken = (userId) => jwt.sign({ userId }, env.jwtSecret, { expiresIn: "7d" });
//# sourceMappingURL=jwt.js.map