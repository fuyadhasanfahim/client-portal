import { Router, Request, Response } from "express";
import { z } from "zod";
import UserModel from "../models/user.model.js";
import { sendEmail } from "../lib/nodemailer.js";
import { renderEmailTemplateNode } from "../lib/emailTemplate.js";

const router = Router();

const PermissionsSchema = z
    .object({
        viewPrices: z.boolean().optional(),
        createOrders: z.boolean().optional(),
        exportInvoices: z.boolean().optional(),
        viewAllServices: z.boolean().optional(),
    })
    .partial();

const ServiceSchema = z.object({
    name: z.string().min(1),
    price: z.number().optional(),
});

const InviteBodySchema = z.object({
    email: z.string().email(),
    inviteUrl: z.string().url(),
    ownerUserID: z.string().min(1),
    permissions: PermissionsSchema.default({}),
    services: z.union([z.literal("all"), z.array(ServiceSchema)]),
});

function summarizePermissions(p: z.infer<typeof PermissionsSchema>): string[] {
    const out: string[] = [];
    if (p.viewPrices) out.push("View pricing");
    if (p.createOrders) out.push("Create orders");
    if (p.exportInvoices) out.push("Export invoices");
    if (p.viewAllServices) out.push("View all services");
    return out;
}

function servicesSummary(
    services: "all" | { name: string; price?: number }[]
): string {
    if (services === "all") return "All services";
    if (!services.length) return "None specified";
    return services
        .map((s) => (s.price != null ? `${s.name} — ${s.price}` : s.name))
        .join(", ");
}

router.post("/send-invite", async (req: Request, res: Response) => {
    try {
        const parsed = InviteBodySchema.safeParse(req.body);
        if (!parsed.success) {
            res.status(400).json({
                success: false,
                message: "Invalid payload",
                issues: parsed.error.flatten(),
            });
            return;
        }

        const { email, inviteUrl, ownerUserID, permissions, services } =
            parsed.data;

        const owner = await UserModel.findOne({ userID: ownerUserID }).lean();
        if (!owner) {
            res.status(404).json({
                success: false,
                message: "Owner not found.",
            });
            return;
        }

        const appName = process.env.APP_NAME || "Web Briks";
        const supportEmail = process.env.SUPPORT_EMAIL || "info@webbriks.com";
        const privacyUrl =
            process.env.PRIVACY_URL ||
            "https://www.webbriks.com/privacy-policy";

        const permissionsList = summarizePermissions(permissions);

        const subject = `You're invited to join ${owner.name}'s team on ${appName}`;
        const html = renderEmailTemplateNode({
            emailTitle: subject,
            userName: email.split("@")[0] || "there",
            userEmail: email,
            emailMessage: `<b>${owner.name}</b> invited you to join their team on <b>${appName}</b>.`,
            orderTitle: "Team invitation",
            orderMessage: "Please review the access and service scope below.",
            infoItems: [
                {
                    label: "Access",
                    value:
                        permissionsList.length > 0
                            ? permissionsList.join(", ")
                            : "No specific access (can be updated later)",
                },
                {
                    label: "Service scope",
                    value: servicesSummary(services),
                },
            ],
            status: { text: "Invitation", type: "info" },
            primaryButton: { text: "Accept invitation", url: inviteUrl },
            footerMessage:
                "If the button doesn't work, copy & paste the link into your browser.",
            supportEmail,
            privacyUrl,
            options: {
                allowHtmlInEmailMessage: true,
                allowHtmlInFooterMessage: false,
            },
        });

        await sendEmail({
            to: email,
            subject,
            html,
        });

        res.status(200).json({
            success: true,
            message: "Invitation email sent.",
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to send invitation.",
            error: (err as Error)?.message,
        });
    }
});

export const teamMemberRoute = router;
