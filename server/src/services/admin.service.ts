/* eslint-disable @typescript-eslint/no-explicit-any */
import UserModel from "../models/user.model.js";
import { IUser } from "../types/user.interface.js";
import getSanitizeUserData from "../utils/getSanitizeUserData.js";

async function newUserInDB(data: IUser) {
    try {
        const newUser = await UserModel.create(data);

        return newUser;
    } catch (error) {
        throw new Error(
            error instanceof Error
                ? error.message
                : "Something went wrong! Please try again later."
        );
    }
}

async function getUsersFromDB({
    search,
    page,
    limit,
    sortBy = "createdAt",
    sortOrder = "desc",
}: {
    search?: string;
    page: number;
    limit: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
}) {
    try {
        const query: any = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const sort: any = {
            [sortBy]: sortOrder === "asc" ? 1 : -1,
        };

        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            UserModel.find(query).sort(sort).skip(skip).limit(limit),
            UserModel.countDocuments(query),
        ]);

        const sanitizedUsers = await Promise.all(
            users.map((user) => getSanitizeUserData(user))
        );

        return {
            users: sanitizedUsers,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    } catch (error) {
        throw new Error(
            error instanceof Error
                ? error.message
                : "Something went wrong! Please try again later."
        );
    }
}

async function getUserByIDFromDB(userID: string) {
    try {
        const userData = (await UserModel.findOne({
            userID,
        })) as IUser;

        const user = await getSanitizeUserData(userData);

        return user;
    } catch (error) {
        throw new Error(
            error instanceof Error
                ? error.message
                : "Something went wrong! Please try again later."
        );
    }
}

async function deleteUserByIDFromDB(userID: string) {
    try {
        const deletedUser = await UserModel.findOneAndUpdate(
            { userID },
            {
                isActive: false,
                isDeleted: true,
                isBlocked: true,
            }
        );

        return deletedUser;
    } catch (error) {
        throw new Error(
            error instanceof Error
                ? error.message
                : "Something went wrong! Please try again later."
        );
    }
}

const AdminServices = {
    newUserInDB,
    getUsersFromDB,
    getUserByIDFromDB,
    deleteUserByIDFromDB,
};
export default AdminServices;
