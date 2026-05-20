import { Router, Request, Response } from "express";
import z from "zod";
import { sendEmail } from "../lib/nodemailer.js";
import { renderEmailTemplateNode } from "../lib/emailTemplate.js";
import UserModel from "../models/user.model.js";
import AdditionalServiceModel from "../models/additional-service.js";
import { sendNotification } from "../utils/sendNotification.js";
import envConfig from "../config/env.config.js";
import { io } from "../server.js";

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

router.post(
    "/request-additional-service",
    async (req: Request, res: Response) => {
        try {
            const { serviceName, servicePrice, clientEmail } = req.body;

            if (!serviceName || servicePrice <= 0 || !clientEmail) {
                res.status(400).json({
                    success: false,
                    message: "Invalid payload",
                });
                return;
            }

            const client = await UserModel.findOne({ email: clientEmail });

            if (client?.isTeamMember) {
                res.status(400).json({
                    success: false,
                    message: "Team members cannot request additional services.",
                });
                return;
            }

            const existingRequest = await AdditionalServiceModel.findOne({
                clientEmail,
                serviceName,
                status: "pending",
            });

            if (existingRequest) {
                res.status(400).json({
                    success: false,
                    message:
                        "You already have a pending request for this service.",
                });
                return;
            }

            const subject = `New Service Request: ${serviceName}`;
            const html = renderEmailTemplateNode({
                emailTitle: subject,
                userName: client?.name || "there",
                userEmail: clientEmail,
                emailMessage: `
                    You have a new service request from <b>${clientEmail}</b>.  
                    Please review the details below and take the necessary actions to fulfill the request.
                `,
                options: {
                    allowHtmlInEmailMessage: true,
                    allowHtmlInFooterMessage: false,
                },
            });

            await sendEmail({
                to: clientEmail,
                subject,
                html,
            });

            const newRequest = await AdditionalServiceModel.create({
                serviceName,
                servicePrice,
                clientEmail,
                status: "pending",
            });

            await sendNotification({
                isAdmin: true,
                title: `New Service Request: ${serviceName}`,
                message: `You have a new service request from ${clientEmail}.`,
                link: `${envConfig.frontend_url}/clients/details/access/${client?.userID}`,
            });

            io.to(newRequest._id).emit("new_service_request");

            res.status(201).json({
                success: true,
                message: "Service request submitted successfully.",
                data: newRequest,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to process service request.",
                error: (error as Error)?.message,
            });
        }
    }
);

router.get(
    "/additional-services/:clientEmail",
    async (req: Request, res: Response) => {
        try {
            const { clientEmail } = req.params;

            const services = await AdditionalServiceModel.findOne({
                clientEmail,
                status: "pending",
            }).lean();

            res.status(200).json({
                success: true,
                data: services,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch additional services.",
                error: (error as Error)?.message,
            });
        }
    }
);

router.put(
    "/update-additional-services",
    async (req: Request, res: Response) => {
        try {
            const { clientEmail, status } = req.body;

            const services = await AdditionalServiceModel.findOneAndUpdate(
                {
                    clientEmail,
                    status: "pending",
                },
                {
                    status,
                },
                {
                    new: true,
                }
            );

            res.status(200).json({
                success: true,
                data: services,
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch additional services.",
                error: (error as Error)?.message,
            });
        }
    }
);

export const clientRouter = router;
