import { authOptions } from '@/lib/auth';
import UserModel from '@/models/user.model';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        const user = await UserModel.findOne({
            userID: session?.user.id,
        });

        if (!user) {
            NextResponse.json(
                {
                    success: false,
                    message: 'Something went wrong! Logging out...',
                },
                {
                    status: 404,
                }
            );
            redirect('/sign-in');
        }

        return NextResponse.json(
            {
                success: true,
                user,
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
