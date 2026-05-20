import nodemailer from "nodemailer";
import envConfig from "../config/env.config.js";

interface Attachment {
    filename: string;
    content: Buffer | string;
    contentType?: string;
    encoding?: string;
}

interface EmailOptions {
    from?: string;
    to: string;
    subject: string;
    html: string;
    attachments?: Attachment[];
}

const { email_user, email_password } = envConfig;

export const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: email_user!,
        pass: email_password!,
    },
});

export const sendEmail = async ({
    to,
    subject,
    html,
    from,
    attachments,
}: EmailOptions) => {
    await transporter.sendMail({
        from: from ? from : email_user,
        to,
        subject,
        html,
        attachments: attachments || [],
    });
};
