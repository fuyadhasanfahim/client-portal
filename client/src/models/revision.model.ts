import { IRevision } from '@/types/revision.interface';
import { Schema, model, models } from 'mongoose';

const RevisionMessageSchema = new Schema(
    {
        senderID: {
            type: String,
            required: true,
        },
        senderRole: {
            type: String,
            required: true,
        },
        senderName: {
            type: String,
            required: true,
        },
        senderProfileImage: {
            type: String,
        },
        message: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const RevisionSchema: Schema = new Schema<IRevision>(
    {
        orderID: {
            type: String,
            ref: 'order',
            required: true,
        },
        messages: [RevisionMessageSchema],
        status: {
            type: String,
        },
        isSeenByAdmin: Boolean,
        isSeenByUser: Boolean,
    },
    {
        timestamps: true,
    }
);

const RevisionModel =
    models?.Revision || model<IRevision>('Revision', RevisionSchema);

export default RevisionModel;
