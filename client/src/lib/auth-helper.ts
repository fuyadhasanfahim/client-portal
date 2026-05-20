import ConversationModel from '@/models/conversation.model';
import UserModel from '@/models/user.model';
import dbConfig from './dbConfig';

export async function ensureSupportConversation(userID: string) {
    await dbConfig();

    const userDoc = await UserModel.findOne({ userID });
    if (!userDoc) return;

    const userParticipant = {
        userID: userDoc.userID,
        name: userDoc.name ?? userDoc.username ?? 'User',
        email: userDoc.email,
        image: userDoc.image ?? undefined,
        role: 'user',
        isOnline: false,
        lastSeenAt: undefined,
        unreadCount: 0,
        lastReadMessageID: null,
    };

    await ConversationModel.findOneAndUpdate(
        { 'participants.userID': userID },
        {
            $setOnInsert: {
                participants: [userParticipant],
                activeClientID: userDoc.userID,
                activeAdminID: null,
                lock: false,
                lastMessageAt: new Date(),
                lastMessageText: '',
                lastMessageAuthorID: null,
            },
        },
        { upsert: true, new: true }
    );
}
