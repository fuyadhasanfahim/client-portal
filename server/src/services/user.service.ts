/* eslint-disable @typescript-eslint/no-explicit-any */
import cloudinary from "../lib/cloudinary.js";
import ConversationModel from "../models/conversation.model.js";
import UserModel from "../models/user.model.js";
import { ISanitizedUser, IUser } from "../types/user.interface.js";
import getSanitizeUserData from "../utils/getSanitizeUserData.js";
import bcrypt from "bcryptjs";

async function getMeFromDB(userID: string) {
    const user = await UserModel.findOne({ userID });

    if (!user) {
        throw new Error(`User with ID ${userID} not found.`);
    }

    const conversation = await ConversationModel.findOne({
        participants: { $elemMatch: { userID: userID } },
    });

    const dataToSanitize = {
        ...user.toObject(),
        conversationID: conversation?._id ? String(conversation._id) : undefined,
    };

    const sanitizedData = await getSanitizeUserData(dataToSanitize);

    return sanitizedData;
}

async function getUserInfoFromDB(userID: string) {
    try {
        const isUserExist = await UserModel.findOne({
            userID,
        });

        if (!isUserExist) return null;

        const userData = await getSanitizeUserData(isUserExist);

        return userData;
    } catch (error) {
        throw new Error(
            error instanceof Error
                ? error.message
                : "Something went wrong! Please try again later."
        );
    }
}

async function updateUserInfoInDB(
    userID: string,
    data: Partial<ISanitizedUser>
) {
    try {
        const updatedUser = await UserModel.findOneAndUpdate(
            { userID },
            { $set: data },
            { new: true }
        );

        return updatedUser;
    } catch (error) {
        throw new Error(
            error instanceof Error
                ? error.message
                : "Something went wrong! Please try again later."
        );
    }
}

export async function updateUserPasswordInDB({
    userID,
    currentPassword,
    newPassword,
}: {
    userID: string;
    currentPassword: string;
    newPassword: string;
}) {
    try {
        const user = await UserModel.findOne({ userID });

        if (!user) {
            throw new Error("User not found.");
        }

        const isPasswordValid = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isPasswordValid) {
            throw new Error("The current password you entered is incorrect.");
        }

        const allOldPasswords = [user.password, ...(user.oldPasswords || [])];

        for (const oldHashed of allOldPasswords) {
            const isSame = await bcrypt.compare(newPassword, oldHashed);
            if (isSame) {
                throw new Error(
                    "New password must be different from previous passwords."
                );
            }
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        user.oldPasswords = [...(user.oldPasswords || []), user.password];
        user.password = hashedNewPassword;

        await user.save();

        return user;
    } catch (error) {
        throw new Error(
            error instanceof Error
                ? error.message
                : "Something went wrong! Please try again later."
        );
    }
}

export async function uploadAvatarInDB(
    userID: string,
    file: Express.Multer.File
) {
    try {
        const user = await UserModel.findOne({ userID });
        if (!user) return null;

        const uploadResult = await new Promise<{ secure_url: string }>(
            (resolve, reject) => {
                cloudinary.uploader
                    .upload_stream(
                        {
                            folder: `client-portal/avatar/${user.userID}`,
                            public_id: "image",
                            overwrite: true,
                        },
                        (error, result) => {
                            if (error || !result) return reject(error);
                            resolve(result);
                        }
                    )
                    .end(file.buffer);
            }
        );

        user.image = uploadResult.secure_url;
        await user.save();

        return user;
    } catch (error) {
        throw new Error(
            error instanceof Error
                ? error.message
                : "Something went wrong! Please try again later."
        );
    }
}

async function getUsersFromDB(role: string) {
    let users: IUser[];
    if (role === "admin") {
        users = await UserModel.find().sort({
            createdAt: -1,
        });
    } else {
        users = [];
    }

    const sanitized = await Promise.all(
        users.map((user) => getSanitizeUserData(user))
    );

    return sanitized;
}

async function getClientsFromDB({
    userID,
    search = "",
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
}: {
    userID: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}) {
    const user = await UserModel.findOne({ userID });

    if (!user) {
        throw new Error("User not found.");
    }

    const query: any = {
        role: "user",
        isTeamMember: false,
    };

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { userID: { $regex: search, $options: "i" } },
        ];
    }

    const sort: any = {
        [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const skip = (page - 1) * limit;

    const [clients, total] = await Promise.all([
        UserModel.find(query).sort(sort).skip(skip).limit(limit),
        UserModel.countDocuments(query),
    ]);

    const sanitizedClients = await Promise.all(
        clients.map((client) => getSanitizeUserData(client))
    );

    return {
        clients: sanitizedClients,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
}

async function getTeamMembersFromDB({
    userID,
    search = "",
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
}: {
    userID: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}) {
    // Ensure user exists
    const user = await UserModel.findOne({ userID });
    if (!user) throw new Error("User not found.");

    const query: any = {
        ownerUserID: userID,
    };

    // Add search filter
    if (search) {
        query.$and = [
            query,
            {
                $or: [
                    { name: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } },
                    { userID: { $regex: search, $options: "i" } },
                ],
            },
        ];
    }

    // Sorting
    const sort: any = {
        [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    const skip = (page - 1) * limit;

    const [teamMembers, total] = await Promise.all([
        UserModel.find(query).sort(sort).skip(skip).limit(limit),
        UserModel.countDocuments(query),
    ]);

    const sanitizedTeamMembers = await Promise.all(
        teamMembers.map((member) => getSanitizeUserData(member))
    );

    return {
        clients: sanitizedTeamMembers,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
}

async function updateTeamMemberInfoInDB({
    id,
    data,
}: {
    id: string;
    data: any;
}) {
    const user = await UserModel.findOne({ id });

    if (!user) throw new Error("User not found.");

    const updateInfo = UserModel.findOneAndUpdate(
        {
            userID: user.userID,
        },
        data,
        { new: true }
    );

    return updateInfo;
}

const UserServices = {
    getMeFromDB,
    getUserInfoFromDB,
    updateUserInfoInDB,
    updateUserPasswordInDB,
    uploadAvatarInDB,
    getUsersFromDB,
    getClientsFromDB,
    getTeamMembersFromDB,
    updateTeamMemberInfoInDB,
};

export default UserServices;
