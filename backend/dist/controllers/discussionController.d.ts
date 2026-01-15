import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
export declare const listComments: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const addComment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=discussionController.d.ts.map