import { Document, model, Schema } from "mongoose";
import { IUser } from "../types/user.interface.js";

const userSchema = new Schema<IUser & Document>(
    {
        userID: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        phone: { type: String },
        address: String,
        company: String,

        role: { type: String, enum: ["user", "admin"], default: "user" },
        provider: {
            type: String,
            enum: ["credentials", "google", "both"],
            required: true,
        },
        googleId: String,

        password: {
            type: String,
            required: function (this: any): boolean {
                return !this.googleId;
            },
        },
        oldPasswords: [String],

        isExistingUser: { type: Boolean, default: false },
        isTeamMember: { type: Boolean, default: false },

        ownerUserID: { type: String, index: true, default: null },
        teamPermissions: {
            viewPrices: { type: Boolean, default: false },
            createOrders: { type: Boolean, default: false },
            exportInvoices: { type: Boolean, default: false },
        },
        currency: String,

        lastSeenAt: { type: Date, default: new Date() },
        isOnline: { type: Boolean, default: false },

        isEmailVerified: { type: Boolean, default: false },
        emailVerificationToken: String,
        emailVerificationTokenExpiry: Date,
        forgetPasswordToken: String,
        forgetPasswordTokenExpiry: Date,
        isPasswordChanged: { type: Boolean, default: false },
        lastPasswordChange: Date,

        lastLogin: Date,
        image: String,

        isActive: { type: Boolean, default: true },
        isDeleted: { type: Boolean, default: false },
        isBlocked: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    }
);

const UserModel = model<IUser & Document>("User", userSchema);
export default UserModel;
