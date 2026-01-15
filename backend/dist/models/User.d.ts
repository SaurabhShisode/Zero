import { Document } from "mongoose";
import type { SkillPreference } from "./common.js";
export interface IUser extends Document {
    email: string;
    passwordHash: string;
    name: string;
    preferences: SkillPreference[];
    placementMode: boolean;
    profileSlug: string;
    streak: {
        current: number;
        max: number;
        freezeAvailable: number;
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: import("mongoose").Model<IUser, {}, {}, {}, Document<unknown, {}, IUser, {}, import("mongoose").DefaultSchemaOptions> & IUser & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
//# sourceMappingURL=User.d.ts.map