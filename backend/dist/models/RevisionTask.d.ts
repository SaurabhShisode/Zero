import { Document, Types } from "mongoose";
export interface IRevisionTask extends Document {
    user: Types.ObjectId;
    problem: Types.ObjectId;
    scheduledFor: Date;
    status: "pending" | "done";
    createdAt: Date;
    updatedAt: Date;
}
export declare const RevisionTask: import("mongoose").Model<IRevisionTask, {}, {}, {}, Document<unknown, {}, IRevisionTask, {}, import("mongoose").DefaultSchemaOptions> & IRevisionTask & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IRevisionTask>;
//# sourceMappingURL=RevisionTask.d.ts.map