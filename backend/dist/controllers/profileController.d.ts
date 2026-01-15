import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
export declare const getHeatmap: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const publicProfile: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=profileController.d.ts.map