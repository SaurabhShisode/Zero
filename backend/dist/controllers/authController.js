import bcrypt from "bcryptjs";
import { User } from "../models/User.js";
import { signToken } from "../utils/jwt.js";
import { Skills } from "../models/common.js";
const randomSuffix = () => Math.random().toString(36).slice(2, 7);
export const signup = async (req, res) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name)
        return res.status(400).json({ message: "Missing fields" });
    const exists = await User.findOne({ email });
    if (exists)
        return res.status(409).json({ message: "Email already used" });
    const hash = await bcrypt.hash(password, 10);
    const profileSlug = `${email.split("@")[0]}-${randomSuffix()}`;
    const defaultPreferences = Skills.map((skill) => ({
        skill,
        enabled: false,
        difficulty: "Easy",
    }));
    const user = await User.create({
        email,
        passwordHash: hash,
        name,
        profileSlug,
        preferences: defaultPreferences,
    });
    const token = signToken(user.id);
    return res.status(201).json({ token, user });
};
export const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user)
        return res.status(401).json({ message: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
        return res.status(401).json({ message: "Invalid credentials" });
    const token = signToken(user.id);
    return res.json({ token, user });
};
export const me = async (req, res) => {
    const userId = req.userId;
    if (!userId)
        return res.status(401).json({ message: "Unauthorized" });
    const user = await User.findById(userId);
    return res.json({ user });
};
//# sourceMappingURL=authController.js.map