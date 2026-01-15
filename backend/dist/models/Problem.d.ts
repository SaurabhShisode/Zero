import { Document } from "mongoose";
import type { Difficulty, Skill } from "./common.js";
export interface IProblem extends Document {
    title: string;
    link: string;
    skill: Skill;
    difficulty: Difficulty;
    companyTags: string[];
    cooldownDays: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Problem: import("mongoose").Model<IProblem, {}, {}, {}, Document<unknown, {}, IProblem, {}, import("mongoose").DefaultSchemaOptions> & IProblem & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProblem>;
//# sourceMappingURL=Problem.d.ts.map