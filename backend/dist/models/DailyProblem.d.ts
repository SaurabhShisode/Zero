import { Document, Types } from "mongoose";
import type { Skill } from "./common.js";
export interface IDailyProblem extends Document {
    date: Date;
    skill: Skill;
    problem: Types.ObjectId;
    assignedAt: Date;
}
export declare const DailyProblem: import("mongoose").Model<IDailyProblem, {}, {}, {}, Document<unknown, {}, IDailyProblem, {}, import("mongoose").DefaultSchemaOptions> & IDailyProblem & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IDailyProblem>;
//# sourceMappingURL=DailyProblem.d.ts.map