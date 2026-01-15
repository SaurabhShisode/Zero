import mongoose from "mongoose";
import env from "./env.js";
export const connectDb = async () => {
    if (mongoose.connection.readyState === 1)
        return;
    await mongoose.connect(env.mongoUri);
    // Minimal logging; rely on process manager for full logs.
    // eslint-disable-next-line no-console
    console.log("Mongo connected");
};
//# sourceMappingURL=db.js.map