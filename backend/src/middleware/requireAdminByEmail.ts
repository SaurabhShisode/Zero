import type { Request, Response, NextFunction } from "express"
import { User } from "../models/User.js"

export async function requireAdminByEmail(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = (req as any).userId

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" })
    }

    const adminEmail = process.env.ADMIN_EMAIL

    if (!adminEmail) {
      return res.status(500).json({
        message: "Admin email not configured"
      })
    }

    const user = await User.findById(userId).select("email")

    if (!user) {
      return res.status(401).json({ message: "User not found" })
    }

    if (user.email !== adminEmail) {
      return res.status(403).json({
        message: "Admin access required"
      })
    }

    next()
  } catch (err) {
    console.error("Admin check error:", err)
    return res.status(500).json({
      message: "Admin verification failed"
    })
  }
}
