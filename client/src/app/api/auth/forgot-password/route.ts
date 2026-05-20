import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/utils/generateToken';
import { sendEmail } from '@/lib/nodemailer';
import dbConfig from '@/lib/dbConfig';
import UserModel from '@/models/user.model';
import { createPasswordResetEmail } from '@/lib/renderEmail';

export async function POST(req: NextRequest) {
    try {
        await dbConfig();
        const { email } = await req.json();
        const user = await UserModel.findOne({ email });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User not found',
                },
                { status: 400 }
            );
        }

        if (user.provider === 'google') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Please login with Google',
                },
                { status: 400 }
            );
        }

        const token = generateToken();
        user.forgetPasswordToken = token;
        user.forgetPasswordTokenExpiry = new Date().getTime() + 1000 * 60 * 30;
        await user.save();

        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
        const emailHtml = await createPasswordResetEmail(
            user.name || 'User',
            email,
            resetUrl
        );
        await sendEmail({
            to: email,
            subject: 'Reset Password',
            html: emailHtml,
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Password reset email sent',
            },
            {
                status: 200,
            }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong! Try again later.',
                errorMessage: (error as Error).message,
            },
            {
                status: 500,
            }
        );
    }
}
