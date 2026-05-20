import { Router } from "express";
import { orderRoute } from "./order.route.js";
import { userRoute } from "./user.route.js";
import { invoiceRoute } from "./invoice.route.js";
import { serviceRoute } from "./service.route.js";
import { paymentRoute } from "./payment.route.js";
import { adminRoute } from "./admin.route.js";
import { stripeRoute } from "./stripe.route.js";
import { paypalRoute } from "./paypal.route.js";
import { quoteRoute } from "./quote.route.js";
import { notificationRoute } from "./notification.route.js";
import { MessageRoute } from "./message.routes.js";
import { ConversationRoutes } from "./conversation.routes.js";
import { SupportRouter } from "./support.route.js";
import { teamMemberRoute } from "./team-member.route.js";
import { clientRouter } from "./client.route.js";
import { UploadRoutes } from "./upload.routes.js";

const router = Router();

const moduleRoutes = [
    {
        path: "/users",
        route: userRoute,
    },
    {
        path: "/admin",
        route: adminRoute,
    },
    {
        path: "/orders",
        route: orderRoute,
    },
    {
        path: "/quotes",
        route: quoteRoute,
    },
    {
        path: "/invoice",
        route: invoiceRoute,
    },
    {
        path: "/services",
        route: serviceRoute,
    },
    {
        path: "/payments",
        route: paymentRoute,
    },
    {
        path: "/stripe",
        route: stripeRoute,
    },
    {
        path: "/paypal",
        route: paypalRoute,
    },
    {
        path: "/notifications",
        route: notificationRoute,
    },
    {
        path: "/messages",
        route: MessageRoute,
    },
    {
        path: "/conversations",
        route: ConversationRoutes,
    },
    {
        path: "/Supports",
        route: SupportRouter,
    },
    {
        path: "/team-member",
        route: teamMemberRoute,
    },
    {
        path: "/client",
        route: clientRouter,
    },
    {
        path: "/uploads",
        route: UploadRoutes,
    },
];

moduleRoutes.forEach(({ path, route }) => {
    router.use(path, route);
});

export default router;
