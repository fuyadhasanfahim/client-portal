import { Router, Request, Response } from "express";
import z from "zod";
import { sendEmail } from "../lib/nodemailer.js";
import { renderEmailTemplateNode } from "../lib/emailTemplate.js";
import UserModel from "../models/user.model.js";

const router = Router();

const InviteBodySchema = z.object({
    email: z.string().email(),
    inviteUrl: z.string().url(),
});

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

        const { email, inviteUrl } = parsed.data;
        const isExistingUser = await UserModel.findOne({
            email,
        }).lean();

        if (isExistingUser) {
            res.status(400).json({
                success: false,
                message: "The email is already used by an user.",
            });
            return;
        }

        const subject = `Invitation for joing the portal`;
        const html = renderEmailTemplateNode({
            emailTitle: subject,
            userName: email.split("@")[0] || "there",
            userEmail: email,
            emailMessage: `
        You’ve been invited to collaborate with <b>Web Briks LLC</b>.  
        As part of our valued clients, we’re excited to give you access to our secure client portal,  
        where you can manage services, view updates, and collaborate with our team seamlessly.
    `,
            orderTitle: "Client Portal Invitation",
            orderMessage: `
        Please click the button below to accept your invitation and get started.  
        Once inside, you’ll have full access to the tools and services we’ve prepared for you.
    `,
            status: { text: "Invitation", type: "info" },
            primaryButton: { text: "Accept Invitation", url: inviteUrl },
            footerMessage:
                "If the button doesn’t work, please copy and paste the link into your browser.",
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
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to send invitation.",
            error: (error as Error)?.message,
        });
    }
});

export const clientRouter = router;
