import { Request, Response } from "express";
import UserServices from "../services/user.service.js";

async function getMe(req: Request, res: Response) {
    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userID = (req as any).user?.id as string;

        if (!userID) {
            res.status(401).json({ message: "Unauthorized: Missing user ID" });
            return;
        }

        const user = await UserServices.getMeFromDB(userID);

        res.status(200).json({
            success: true,
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request",
            error:
                error instanceof Error
                    ? error.message
                    : "Something went wrong! Please try again later.",
        });
    }
}

async function getUserInfo(req: Request, res: Response) {
    try {
        const userID = req.params.userID as string;

        if (!userID) {
            res.status(400).json({
                success: false,
                message: "Something went wrong. Please try again later.",
            });
            return;
        }

        const userData = await UserServices.getUserInfoFromDB(userID);

        res.status(200).json({
            success: true,
            data: userData,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request",
            error:
                error instanceof Error
                    ? error.message
                    : "Something went wrong! Please try again later.",
        });
    }
}

async function updateUserInfo(req: Request, res: Response) {
    try {
        const userID = req.params.userID as string;
        const data = req.body;

        if (!userID || !data) {
            res.status(400).json({
                success: false,
                message:
                    "Invalid input. Please provide userID and data to update.",
            });
            return;
        }

        const updatedUser = await UserServices.updateUserInfoInDB(userID, data);

        if (!updatedUser) {
            res.status(404).json({
                success: false,
                message: "User not found.",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Information updated successfully.",
            data: updatedUser,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request",
            error:
                error instanceof Error
                    ? error.message
                    : "Something went wrong! Please try again later.",
        });
    }
}

async function updateUserPassword(req: Request, res: Response) {
    try {
        const userID = req.params.userID as string;
        const { newPassword, currentPassword } = req.body;

        if (!userID || !newPassword) {
            res.status(400).json({
                success: false,
                message:
                    "Invalid input. Please provide userID and newPassword to update.",
            });
            return;
        }

        const updatedUser = await UserServices.updateUserPasswordInDB({
            userID,
            currentPassword,
            newPassword,
        });

        if (!updatedUser) {
            res.status(404).json({
                success: false,
                message: "User not found.",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Password updated successfully.",
        });
    } catch (error) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "Something went wrong! Please try again later.";

        let statusCode = 500;
        let message = "An error occurred while processing your request";

        if (errorMessage === "User not found.") {
            statusCode = 404;
            message = errorMessage;
        } else if (
            errorMessage === "Current password is required." ||
            errorMessage === "The current password you entered is incorrect." ||
            errorMessage === "New password must be different from previous passwords."
        ) {
            statusCode = 400;
            message = errorMessage;
        }

        res.status(statusCode).json({
            success: false,
            message,
            error: errorMessage,
        });
    }
}

async function uploadAvatar(req: Request, res: Response) {
    try {
        const userID = req.params.userID as string;
        const file = req.file;

        if (!userID || !file) {
            res.status(400).json({
                success: false,
                message: "Please provide userID and avatar image file.",
            });
            return;
        }

        const updatedUser = await UserServices.uploadAvatarInDB(userID, file);

        if (!updatedUser) {
            res.status(404).json({
                success: false,
                message: "User not found.",
            });
        }

        res.status(200).json({
            success: true,
            message: "Avatar uploaded successfully.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request",
            error:
                error instanceof Error
                    ? error.message
                    : "Something went wrong! Please try again later.",
        });
    }
}

async function getUsers(req: Request, res: Response) {
    try {
        const { role } = req.query as {
            role: string;
        };

        if (!role) {
            res.status(400).json({
                success: false,
                message: "Role is required.",
            });
            return;
        }

        const users = await UserServices.getUsersFromDB(role);

        res.status(200).json({
            success: true,
            users,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request",
            error:
                error instanceof Error
                    ? error.message
                    : "Something went wrong! Please try again later.",
        });
    }
}

async function getClients(req: Request, res: Response) {
    try {
        const {
            search = "",
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            sortOrder = "desc",
            userID,
        } = req.query;

        if (!userID) {
            res.status(400).json({
                success: false,
                message: "User ID is required.",
            });
            return;
        }

        const clients = await UserServices.getClientsFromDB({
            userID: userID as string,
            search: search as string,
            page: parseFloat(page as string),
            limit: parseFloat(limit as string),
            sortBy: sortBy as string,
            sortOrder: sortOrder as "asc" | "desc",
        });

        res.status(200).json({
            success: true,
            data: clients,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request",
            error:
                error instanceof Error
                    ? error.message
                    : "Something went wrong! Please try again later.",
        });
    }
}

async function getTeamMembers(req: Request, res: Response) {
    try {
        const {
            search = "",
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            sortOrder = "desc",
            userID,
        } = req.query;

        if (!userID) {
            res.status(400).json({
                success: false,
                message: "User ID is required.",
            });
            return;
        }

        const teamMembers = await UserServices.getTeamMembersFromDB({
            userID: userID as string,
            search: search as string,
            page: parseFloat(page as string),
            limit: parseFloat(limit as string),
            sortBy: sortBy as string,
            sortOrder: sortOrder as "asc" | "desc",
        });

        res.status(200).json({
            success: true,
            data: teamMembers,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request",
            error:
                error instanceof Error
                    ? error.message
                    : "Something went wrong! Please try again later.",
        });
    }
}

async function updateTeamMemberInfo(req: Request, res: Response) {
    try {
        const id = req.params.id as string;
        const data = req.body;

        if (!id) {
            res.status(400).json({
                success: false,
                message: "User ID is required.",
            });
            return;
        }

        await UserServices.updateTeamMemberInfoInDB({
            id,
            data,
        });

        res.status(200).json({
            success: true,
            message: "Update successfully.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request",
            error:
                error instanceof Error
                    ? error.message
                    : "Something went wrong! Please try again later.",
        });
    }
}

const UserControllers = {
    getMe,
    getUserInfo,
    updateUserInfo,
    updateUserPassword,
    uploadAvatar,
    getUsers,
    getClients,
    getTeamMembers,
    updateTeamMemberInfo,
};

export default UserControllers;
