import dbConfig from '@/lib/dbConfig';
import UserModel from '@/models/user.model';
import SignupSchema from '@/validations/sign-up.schema';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        await dbConfig();

        const body = await req.json();
        if (!body) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'No data provided.',
                },
                { status: 400 }
            );
        }

        const parsedData = SignupSchema.parse(body);
        const {
            name,
            email,
            phone,
            company,
            address,
            password,
            provider,
            username,
        } = parsedData;

        const userData = await UserModel.findOne({ email });

        const existingUsername = await UserModel.findOne({ username });
        if (existingUsername) {
            return NextResponse.json(
                { success: false, message: 'Username already taken.' },
                { status: 400 }
            );
        }

        if (userData) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'User already exists.',
                },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = await UserModel.create({
            userID: `WBU${nanoid(10).toUpperCase()}`,
            name,
            email,
            phone,
            company,
            address,
            provider,
            username,
            password: hashedPassword,
        });

        if (!newUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Failed to create user.',
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'User created successfully.',
            },
            { status: 201 }
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
