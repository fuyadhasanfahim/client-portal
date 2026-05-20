import { Request, Response } from "express";
import AdminServices from "../services/admin.service.js";

async function newUser(req: Request, res: Response) {
    try {
        const data = req.body;

        if (!data) {
            res.status(400).json({
                success: false,
                message: "No data found to create an user.",
            });
            return;
        }

        await AdminServices.newUserInDB(data);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to send invoice email.",
            error: (error as Error).message,
        });
    }
}

async function getUsers(req: Request, res: Response) {
    try {
        const {
            search = "",
            page = 1,
            limit = 10,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);

        const result = await AdminServices.getUsersFromDB({
            search: search as string,
            page: pageNum,
            limit: limitNum,
            sortBy: sortBy as string,
            sortOrder: sortOrder as "asc" | "desc",
        });

        res.status(200).json({
            success: true,
            message: "Users fetched successfully.",
            data: result,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to send invoice email.",
            error: (error as Error).message,
        });
    }
}

async function getUserByID(req: Request, res: Response) {
    try {
        const { userID } = req.params as any;

        if (!userID) {
            res.status(400).json({
                success: false,
                message: "User id not found.",
            });
            return;
        }

        const user = await AdminServices.getUserByIDFromDB(userID);

        res.status(200).json({
            success: true,
            message: "User fetched successfully.",
            data: user,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to send invoice email.",
            error: (error as Error).message,
        });
    }
}

async function deleteUserByID(req: Request, res: Response) {
    try {
        const { userID } = req.params as any;

        if (!userID) {
            res.status(400).json({
                success: false,
                message: "User id not found.",
            });
            return;
        }

        await AdminServices.deleteUserByIDFromDB(userID);

        res.status(200).json({
            success: true,
            message: "User deleted successfully.",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to send invoice email.",
            error: (error as Error).message,
        });
    }
}

const AdminControllers = { newUser, getUsers, getUserByID, deleteUserByID };
export default AdminControllers;
