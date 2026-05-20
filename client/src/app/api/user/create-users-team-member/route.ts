import dbConfig from '@/lib/dbConfig';
import UserModel from '@/models/user.model';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
    try {
        const {
            name,
            username,
            email,
            phone,
            company,
            password,
            provider,
            services,
            address,
            ownerUserID,
            permissions,
            currency,
            isTeamMember,
        } = await req.json();

        if (
            !name ||
            !email ||
            !username ||
            !address ||
            !password ||
            !ownerUserID ||
            !permissions
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Some required fields are missing.',
                },
                { status: 400 }
            );
        }

        await dbConfig();

        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'A user with this email already exists.',
                },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await UserModel.create({
            userID: `WBU${nanoid(10).toUpperCase()}`,
            name,
            username,
            email,
            phone,
            company,
            password: hashedPassword,
            provider,
            services,
            address,
            isEmailVerified: false,
            ownerUserID,
            teamPermissions: permissions,
            currency,
            isTeamMember,
        });

        return NextResponse.json(
            { success: true, message: 'User created successfully!' },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                message: 'Something went wrong! Try again later.',
                errorMessage: (error as Error).message,
            },
            { status: 500 }
        );
    }
}
