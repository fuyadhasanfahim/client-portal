import { Router } from "express";
import PaymentControllers from "../controllers/payment.controller.js";

const router = Router();

// Get Routes
router.get(
    "/get-payments-amount/:status",
    PaymentControllers.getPaymentsByStatus
);
router.get("/get-payment/:orderID", PaymentControllers.getPaymentByOrderID);
router.get("/get-payments/:userID", PaymentControllers.getPaymentsByUserID);

// Post Routes
router.post("/new-payment", PaymentControllers.newPayment);

export const paymentRoute = router;
