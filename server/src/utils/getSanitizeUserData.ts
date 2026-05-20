import { ISanitizedUser, IUser } from "../types/user.interface.js";

export default async function getSanitizeUserData(
    user: IUser
): Promise<ISanitizedUser> {
    const {
        userID,
        name,
        username,
        email,
        phone,
        address,
        company,
        role,
        isEmailVerified,
        lastLogin,
        image,
        updatedAt,
        createdAt,
        provider,
        isExistingUser,
        services,
        ownerUserID,
        teamPermissions,
        currency,
        isTeamMember,
        conversationID,
        lastSeenAt,
        isOnline,
    } = user;

    return {
        userID,
        name,
        username,
        email,
        phone,
        address,
        company,
        role,
        isExistingUser,
        isEmailVerified,
        lastLogin,
        image,
        updatedAt,
        createdAt,
        provider,
        services,
        ownerUserID,
        teamPermissions,
        currency,
        isTeamMember,
        conversationID,
        lastSeenAt,
        isOnline,
    };
}
