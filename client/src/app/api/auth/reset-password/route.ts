import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConfig from '@/lib/dbConfig';
import UserModel from '@/models/user.model';

export async function POST(req: NextRequest) {
    try {
        await dbConfig();
        const { token, newPassword } = await req.json();

        const user = await UserModel.findOne({
            forgetPasswordToken: token,
            forgetPasswordTokenExpiry: { $gt: Date.now() },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Invalid or expired token' },
                { status: 400 }
            );
        }

        const isReused = await Promise.all(
            user.oldPasswords.map((oldHash: string) =>
                bcrypt.compare(newPassword, oldHash)
            )
        ).then((results) => results.some((match) => match));

        if (isReused) {
            return NextResponse.json(
                { success: false, message: 'Password has been used before' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        user.password = hashedPassword;
        user.isPasswordChanged = true;
        user.lastPasswordChange = new Date();
        user.forgetPasswordToken = '';
        user.forgetPasswordTokenExpiry = null;
        user.oldPasswords = Array.from(
            new Set([...user.oldPasswords, hashedPassword])
        ).slice(-5);
        await user.save();

        return NextResponse.json(
            { success: true, message: 'Password reset successful' },
            { status: 200 }
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
