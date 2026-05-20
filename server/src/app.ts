import express, { Application, raw, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import router from "./routes/index.js";
import { verifyAuth } from "./middleware/verifyAuth.js";
import cookieParser from "cookie-parser";
import envConfig from "./config/env.config.js";
import StripeControllers from "./controllers/stripe.controller.js";

const { frontend_url } = envConfig;

const app: Application = express();

app.post(
    "/api/stripe/payment-webhook",
    raw({ type: "application/json" }),
    StripeControllers.paymentWebhook
);

const corsOptions = {
    origin: frontend_url!,
    credentials: true,
    optionsSuccessStatus: 200,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api", verifyAuth, router);

app.get("/", (_req: Request, res: Response) => {
    res.send("Server is running successfully!");
});

export default app;
