import { model, models, Schema } from 'mongoose';
import { IConversation, IParticipant } from '../types/conversation.interface';

const ParticipantSchema = new Schema<IParticipant>({
    userID: { type: String, required: true, index: true },
    name: String,
    email: String,
    image: String,
    isOnline: { type: Boolean, default: false },
    lastSeenAt: Date,
    role: { type: String, enum: ['admin', 'user'], required: true },
    unreadCount: {
        type: Number,
        default: 0,
    },
    lastReadMessageID: {
        type: Schema.Types.ObjectId,
        ref: 'Message',
    },
});

const ConversationSchema = new Schema<IConversation>(
    {
        participants: { type: [ParticipantSchema], required: true },
        lastMessageAt: { type: Date, default: Date.now, index: true },
        lastMessageText: String,
        lastMessageAuthorID: String,
        activeAdminID: { type: String, default: null, index: true },
        activeClientID: { type: String, default: null, index: true },
        lock: { type: Boolean, default: false },
    },
    { timestamps: true }
);

ConversationSchema.index({ lastMessageAt: -1 });

const ConversationModel =
    models?.Conversation ||
    model<IConversation>('Conversation', ConversationSchema);
export default ConversationModel;
