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

export interface IQuote {
    _id?: string;
    quoteID: string;
    user: IQuoteUser;
    title: string;
    details?: IQuoteDetails;
    isRevision?: boolean;
    status:
        | 'pending'
        | 'in_progress'
        | 'in_review'
        | 'completed'
        | 'delivered'
        | 'cancelled';
    quoteStage: 'draft' | 'details-provided';
    createdAt: Date;
    updatedAt: Date;
}
