import { Router } from "express";
import { getHeatmap, publicProfile } from "../controllers/profileController.js";
import { requireAuth } from "../middleware/auth.js";
const router = Router();
router.get("/heatmap", requireAuth, getHeatmap);
router.get("/public/:slug", publicProfile);
export default router;
//# sourceMappingURL=profile.js.map