export type IRevisionStatus = 'open' | 'in-review' | 'closed';
export type IRevisionSenderRole = 'user' | 'admin' | 'system';

export interface IRevisionMessage {
    senderID: string;
    senderRole: IRevisionSenderRole;
    senderName: string;
    senderProfileImage?: string;
    message: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IRevision {
    _id: string;
    orderID?: string;
    quoteID?: string;
    messages: IRevisionMessage[];
    status: IRevisionStatus;
    isSeenByAdmin: boolean;
    isSeenByUser: boolean;
    lastSeenAtAdmin: Date | null;
    lastSeenAtUser: Date | null;
    lastMessageAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}
