import { Schema, model, models } from 'mongoose';
import { IMessage } from '../types/message.interface';

const messageSchema = new Schema<IMessage>(
    {
        conversationID: { type: String, required: true, index: true },
        authorID: { type: String, required: true, index: true },
        authorRole: { type: String, required: true },
        text: String,
        sentAt: { type: Date, default: Date.now },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const MessageModel =
    models?.Message || model<IMessage>('Message', messageSchema);
export default MessageModel;
