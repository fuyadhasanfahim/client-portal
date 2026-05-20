import { Request, Response, Router } from "express";
import OrderControllers from "../controllers/order.controller.js";
import UserModel from "../models/user.model.js";
import { OrderModel } from "../models/order.model.js";

const router = Router();

router.get("/get-orders", OrderControllers.getOrders);
router.get("/get-draft-orders", OrderControllers.getDraftOrders);
router.get("/get-orders/:orderID", OrderControllers.getOrderByID);
router.get("/get-orders-by-status/:status", OrderControllers.getOrdersByStatus);
router.get("/get-orders-by-user", OrderControllers.getOrdersByUserID);
router.get("/get-revisions/:orderID", OrderControllers.getRevision);

router.post("/new-order/:orderStage", OrderControllers.newOrder);

router.put("/update-order/:orderID", OrderControllers.updateOrder);
router.put("/deliver-order", OrderControllers.deliverOrder);
router.put("/review-order", OrderControllers.reviewOrder);
router.put("/complete-order", OrderControllers.completeOrder);
router.put("/revision-message", OrderControllers.sendRevisionMessage);

router.get("/get-orders-by-user-id", async (req: Request, res: Response) => {
    try {
        const { userID } = req.query;

        if (!userID || typeof userID !== "string" || !userID.trim()) {
            res.status(400).json({
                success: false,
                message: 'Query parameter "userID" is required.',
            });
            return;
        }

        const user = await UserModel.findOne({ userID }).lean();
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found with this id.",
            });
            return;
        }

        const orders = await OrderModel.find({
            "user.userID": user.userID,
        })
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while processing your request",
            error:
                error instanceof Error
                    ? error.message
                    : "Internal server error",
        });
    }
});
export const orderRoute = router;
