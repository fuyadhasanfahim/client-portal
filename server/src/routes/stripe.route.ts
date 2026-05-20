import { Router } from "express";
import StripeControllers from "../controllers/stripe.controller.js";

const router = Router();

router.post("/new-order-checkout", StripeControllers.newOrderCheckout);

export const stripeRoute = router;
