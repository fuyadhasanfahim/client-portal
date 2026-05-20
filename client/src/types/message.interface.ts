import { Document } from 'mongoose';

export interface IAttachment {
    url: string;
    name: string;
    key: string;
    size: number;
    contentType?: string;
}

export interface IMessage extends Omit<Document, '_id'> {
    _id: string;
    conversationID: string;
    authorID?: string;
    authorRole?: 'user' | 'admin';
    text?: string;
    kind: 'user' | 'system';
    systemType?: 'join' | 'leave' | 'info';
    sentAt: Date;
    attachment?: IAttachment | null;
    createdAt: Date;
    updatedAt: Date;
}
