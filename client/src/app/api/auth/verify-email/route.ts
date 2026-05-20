import dbConfig from '@/lib/dbConfig';
import UserModel from '@/models/user.model';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const token = url.searchParams.get('token');

        if (!token) {
            return NextResponse.json(
                { message: 'Token is required' },
                { status: 400 }
            );
        }

        await dbConfig();

        const user = await UserModel.findOne({
            emailVerificationToken: token,
            emailVerificationTokenExpiry: { $gt: new Date().getTime() },
        });

        if (!user) {
            return NextResponse.json(
                { message: 'Invalid or expired token' },
                { status: 400 }
            );
        }

        if (user.isEmailVerified) {
            return NextResponse.json(
                { message: 'Email is already verified' },
                { status: 200 }
            );
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = '';
        user.emailVerificationTokenExpiry = null;
        await user.save();

        return NextResponse.json(
            { message: 'Email verified successfully' },
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
