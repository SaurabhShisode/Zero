import { Document, Types } from "mongoose";
export interface IDiscussionComment extends Document {
    dailyProblem: Types.ObjectId;
    user: Types.ObjectId;
    message: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const DiscussionComment: import("mongoose").Model<IDiscussionComment, {}, {}, {}, Document<unknown, {}, IDiscussionComment, {}, import("mongoose").DefaultSchemaOptions> & IDiscussionComment & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IDiscussionComment>;
//# sourceMappingURL=Discussion.d.ts.map