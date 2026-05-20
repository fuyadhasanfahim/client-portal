import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

interface EmailOptions {
    from?: string;
    to: string;
    subject: string;
    html: string;
}

export const sendEmail = async ({ to, subject, html, from }: EmailOptions) => {
    await transporter.sendMail({
        from: from ? from : process.env.EMAIL_USER,
        to,
        subject,
        html,
    });
};
