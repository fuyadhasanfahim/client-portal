export type UserRole = 'user' | 'admin';
export type AuthProvider = 'credentials' | 'google';

export type ITeamPermissions = {
    viewPrices?: boolean;
    createOrders?: boolean;
    exportInvoices?: boolean;
};

export interface IUser {
    userID: string;
    name: string;
    username: string;
    email: string;
    phone: string;
    address?: string;
    company?: string;

    role: UserRole;
    provider: AuthProvider;
    googleId?: string;

    password: string;
    oldPasswords?: string[];

    isExistingUser?: boolean;
    isTeamMember?: boolean;
    services?: {
        _id: string;
        name: string;
        price: number;
    }[];

    ownerUserID?: string;
    teamPermissions?: ITeamPermissions;
    currency?: string;

    isEmailVerified: boolean;
    emailVerificationToken?: string;
    emailVerificationTokenExpiry?: Date;
    forgetPasswordToken?: string;
    forgetPasswordTokenExpiry?: Date;
    isPasswordChanged?: boolean;
    lastPasswordChange?: Date;

    lastSeenAt?: Date;
    isOnline?: boolean;

    lastLogin: Date;
    image?: string;

    isActive: boolean;
    isDeleted: boolean;
    isBlocked: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export interface ISanitizedUser {
    userID: string;
    name: string;
    username: string;
    email: string;
    phone: string;
    address?: string;
    company?: string;
    role: UserRole;
    isEmailVerified: boolean;
    isExistingUser?: boolean;
    isTeamMember?: boolean;
    services?: {
        _id: string;
        name: string;
        price: number;
    }[];
    ownerUserID?: string;
    teamPermissions?: ITeamPermissions;
    currency?: string;
    lastLogin: Date;
    image?: string;
    conversationID?: string;
    provider: string;
    lastSeenAt?: Date;
    isOnline?: boolean;
    createdAt: Date;
    updatedAt: Date;
}
