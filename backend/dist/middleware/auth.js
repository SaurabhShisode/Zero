import jwt from "jsonwebtoken";
import env from "../config/env.js";
export const requireAuth = (req, res, next) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token)
        return res.status(401).json({ message: "Unauthorized" });
    try {
        const decoded = jwt.verify(token, env.jwtSecret);
        req.userId = decoded.userId;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};
//# sourceMappingURL=auth.js.map