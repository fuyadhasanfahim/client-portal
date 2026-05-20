import { Schema, model, models } from 'mongoose';
import {
    IQuote,
    IQuoteDetails,
    IQuoteUser,
} from '../types/quote.interface';

const QuoteUserSchema = new Schema<IQuoteUser>(
    {
        userID: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        image: {
            type: String,
        },
        company: {
            type: String,
            required: false,
        },
        address: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

const QuoteDetailsSchema = new Schema<IQuoteDetails>(
    {
        deliveryDate: {
            type: Date,
            required: false,
        },
        downloadLink: {
            type: String,
            required: false,
        },
        deliveryLink: {
            type: String,
            required: false,
        },
        images: {
            type: Number,
            required: false,
        },
        returnFileFormat: {
            type: [String],
            required: false,
        },
        backgroundOption: {
            type: [String],
            required: false,
        },
        backgroundColor: {
            type: [String],
            required: false,
        },
        imageResizing: {
            type: Boolean,
            required: false,
        },
        width: {
            type: Number,
            required: false,
        },
        height: {
            type: Number,
            required: false,
        },
        instructions: {
            type: String,
            required: false,
        },
    },
    {
        timestamps: true,
    }
);

const QuoteSchema = new Schema<IQuote>(
    {
        quoteID: {
            type: String,
            required: true,
        },
        user: {
            type: QuoteUserSchema,
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        details: {
            type: QuoteDetailsSchema,
            required: false,
        },
        isRevision: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
            enum: [
                'pending',
                'in_progress',
                'in_review',
                'completed',
                'delivered',
                'cancelled',
            ],
            required: true,
        },
        quoteStage: {
            type: String,
            enum: ['draft', 'details-provided'],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const QuoteModel = models?.Quote || model<IQuote>('Quote', QuoteSchema);
export default QuoteModel;
