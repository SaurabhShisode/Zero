import { Document, Types } from "mongoose";
export interface ISolve extends Document {
    user: Types.ObjectId;
    problem: Types.ObjectId;
    date: Date;
    status: "solved" | "wrong" | "skipped";
    placementMode: boolean;
    approachNote?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Solve: import("mongoose").Model<ISolve, {}, {}, {}, Document<unknown, {}, ISolve, {}, import("mongoose").DefaultSchemaOptions> & ISolve & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISolve>;
//# sourceMappingURL=Solve.d.ts.map