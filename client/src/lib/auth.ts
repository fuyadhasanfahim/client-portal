import GoogleProvider from 'next-auth/providers/google';
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import dbConfig from './dbConfig';
import bcrypt from 'bcryptjs';
import UserModel from '@/models/user.model';
import { nanoid } from 'nanoid';


const isProduction = process.env.NODE_ENV === 'production';

export const authOptions: NextAuthOptions = {
    cookies: {
        sessionToken: {
            name: isProduction
                ? '__Secure-next-auth.session-token'
                : 'next-auth.session-token',
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: isProduction,
                domain: process.env.COOKIE_DOMAIN || undefined,
            },
        },
    },
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: {
                    label: 'Email',
                    type: 'email',
                    placeholder: 'Enter your email',
                },
                password: {
                    label: 'Password',
                    type: 'password',
                    placeholder: 'Enter your password',
                },
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error(
                        'Invalid credentials! Please enter a valid email or password.',
                    );
                }

                try {
                    await dbConfig();

                    const user = await UserModel.findOne({
                        email: credentials.email,
                    });

                    if (!user) {
                        throw new Error(
                            'Invalid credentials! Please enter a valid email or password.',
                        );
                    } else if (user.provider !== 'credentials') {
                        throw new Error(
                            'Invalid credentials! Please use Google to sign in.',
                        );
                    }

                    const isValid = await bcrypt.compare(
                        credentials.password,
                        user.password,
                    );
                    if (!isValid) {
                        throw new Error('Invalid password.');
                    }

                    return {
                        id: user.userID,
                        role: user.role!,
                    };
                } catch (error) {
                    throw new Error(
                        (error as Error).message ||
                            'An error occurred while authenticating.',
                    );
                }
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user && account) {
                const isRememberMe =
                    account?.type === 'credentials' &&
                    account?.providerAccountId === 'rememberMe';

                const expiresIn = isRememberMe
                    ? 365 * 24 * 60 * 60
                    : 24 * 60 * 60;

                await dbConfig();
                await UserModel.findOneAndUpdate(
                    { userID: user.id },
                    {
                        lastLogin: new Date(),
                    },
                );

                const now = Math.floor(new Date().getTime() / 1000);

                token.exp = now + expiresIn;
            }

            if (user) {
                const db = await UserModel.findOne({ userID: user.id });

                token.id = user.id;
                token.role = db.role;
            }

            if (account) {
                token.accessToken = account.access_token || token.accessToken;
                token.idToken = account.id_token || token.idToken;
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }

            session.accessToken = token.accessToken as string;
            return session;
        },

        async signIn({ account, user }) {
            await dbConfig();

            if (account?.provider === 'google') {
                const existingUser = await UserModel.findOne({
                    email: user?.email,
                });

                if (existingUser?.provider === 'credentials') {
                    throw new Error(
                        'Invalid credentials! Please use credentials to sign in.',
                    );
                } else if (!existingUser) {
                    const newUser = await UserModel.create({
                        userID: `WBU${nanoid(10).toUpperCase()}`,
                        name: user?.name,
                        email: user?.email,
                        username: user?.email?.split('@')[0],
                        password: '',
                        provider: 'google',
                        googleId: user?.id?.toString(),
                        isEmailVerified: true,
                        image: user?.image,
                        role: 'user',
                    });

                    user.id = newUser.userID;

                    return true;
                }

                user.id = existingUser.userID;

                return true;
            }

            // Credentials sign-in success

            return true;
        },
    },
    pages: {
        signIn: '/sign-in',
        error: '/sign-in',
    },
    session: {
        strategy: 'jwt',
        maxAge: 365 * 24 * 60 * 60,
    },
    secret: process.env.AUTH_SECRET!,
};
