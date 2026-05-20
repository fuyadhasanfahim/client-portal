import { Document } from 'mongoose';

export interface IQuoteUser {
    userID: string;
    name: string;
    email: string;
    image: string;
    company?: string;
    address?: string;
}

export interface IQuoteServiceComplexity {
    _id: string;
    name: string;
}

export interface IQuoteServiceType {
    _id: string;
    name: string;
    complexity?: IQuoteServiceComplexity;
}

export interface IQuoteServiceSelection {
    _id: string;
    name: string;
    colorCodes?: string[];
    options?: string[];
    types?: IQuoteServiceType[];
    complexity?: IQuoteServiceComplexity;
    disabledOptions?: string[];
}

export interface IQuoteDetails {
    deliveryDate?: Date;
    downloadLink?: string;
    deliveryLink?: string;
    images?: number;
    returnFileFormat?: string[];
    backgroundOption?: string[];
    backgroundColor?: string[];
    imageResizing?: boolean;
    width?: number;
    height?: number;
    instructions?: string;
}

export interface IQuote extends Document {
    quoteID: string;
    user: IQuoteUser;
    services: IQuoteServiceSelection[];
    details?: IQuoteDetails;
    isRevision?: boolean;
    status:
        | 'pending'
        | 'in-progress'
        | 'delivered'
        | 'in-revision'
        | 'completed'
        | 'canceled';
    quoteStage: 'draft' | 'services-selected' | 'details-provided';
    createdAt: Date;
    updatedAt: Date;
}
