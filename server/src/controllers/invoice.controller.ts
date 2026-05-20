import { Request, Response } from "express";
import InvoiceServices from "../services/invoice.service.js";
import { sendEmail } from "../lib/nodemailer.js";
import envConfig from "../config/env.config.js";
import { getInvoiceEmailTemplate } from "../html-templates/getInvoiceEmailTemplate.js";

async function sendInvoice(req: Request, res: Response) {
    try {
        const { orderID } = req.body;

        if (!orderID) {
            res.status(400).json({
                success: false,
                message: "Order ID is required",
            });
            return;
        }

        const { pdfBuffer, order } =
            await InvoiceServices.sendInvoiceEmail(orderID);

        await sendEmail({
            to: order.user.email,
            from: envConfig.email_user!,
            subject: `Invoice for Order #${orderID}`,
            html: getInvoiceEmailTemplate(order),
            attachments: [
                {
                    filename: `Invoice_${orderID}.pdf`,
                    content: pdfBuffer,
                    contentType: "application/pdf",
                },
            ],
        });

        res.status(200).json({
            success: true,
            message: "Invoice sent successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to send invoice",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
}

const InvoiceControllers = { sendInvoice };

export default InvoiceControllers;
