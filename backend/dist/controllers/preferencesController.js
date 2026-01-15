import { User } from "../models/User.js";
export const updatePreferences = async (req, res) => {
    if (!req.userId)
        return res.status(401).json({ message: "Unauthorized" });
    const { preferences, placementMode } = req.body;
    const user = await User.findByIdAndUpdate(req.userId, { preferences, placementMode }, { new: true });
    return res.json({ user });
};
//# sourceMappingURL=preferencesController.js.map