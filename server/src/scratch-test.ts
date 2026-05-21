import { connect } from "mongoose";
import UserModel from "./models/user.model.js";
import envConfig from "./config/env.config.js";

async function run() {
    try {
        console.log("Connecting to:", envConfig.database_url);
        await connect(envConfig.database_url as string);
        console.log("Connected successfully!");

        const user = await UserModel.findOne({ userID: "WBU_I8LLFKAWG" });
        if (!user) {
            console.log("User not found!");
        } else {
            console.log("User details:", {
                userID: user.userID,
                email: user.email,
                name: user.name,
                provider: user.provider,
                googleId: user.googleId,
                hasPassword: !!user.password,
                passwordLength: user.password ? user.password.length : 0,
                role: user.role
            });
        }
        process.exit(0);
    } catch (err) {
        console.error("Error occurred:", err);
        process.exit(1);
    }
}

run();
