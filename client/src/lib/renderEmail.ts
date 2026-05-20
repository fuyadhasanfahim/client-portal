import 'server-only';

import React from 'react';
import {
    EmailTemplate,
    type EmailTemplateProps,
} from '@/components/shared/EmailTemplate';

export async function renderEmailTemplate(
    props: EmailTemplateProps
): Promise<string> {
    const ReactDomServer = await import('react-dom/server');
    const html = ReactDomServer.renderToStaticMarkup(
        React.createElement(EmailTemplate, props)
    );
    return '<!DOCTYPE html>' + html;
}

export async function createPasswordResetEmail(
    userName: string,
    userEmail: string,
    resetUrl: string
): Promise<string> {
    return renderEmailTemplate({
        emailTitle: 'Password Reset Request',
        userName,
        userEmail,
        emailMessage:
            'We received a request to reset your password. To complete the process, please click the button below:',
        primaryButton: { text: 'Reset Password', url: resetUrl },
        footerMessage:
            "If you didn't request a password reset, you can safely ignore this email. This link will expire in 30 minutes.",
    });
}

export async function createEmailVerificationEmail(
    userName: string,
    userEmail: string,
    verificationUrl: string
): Promise<string> {
    return renderEmailTemplate({
        emailTitle: 'Verify Your Email Address',
        userName,
        userEmail,
        emailMessage:
            'Thank you for signing up! To complete your registration and verify your email address, please click the button below:',
        primaryButton: { text: 'Verify Email', url: verificationUrl },
        footerMessage: 'This verification link will expire in 1 hour.',
        status: { text: 'Action Required', type: 'info' },
    });
}
