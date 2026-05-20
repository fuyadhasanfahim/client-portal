import { Document } from 'mongoose';

export interface IOrderUser {
    userID: string;
    name: string;
    email: string;
    image: string;
    company?: string;
    address?: string;
}

export interface IOrderServiceComplexity {
    _id: string;
    name: string;
    price: number;
}

export interface IOrderServiceType {
    _id: string;
    name: string;
    price?: number;
    complexity?: IOrderServiceComplexity;
}

export interface IOrderServiceSelection {
    _id: string;
    name: string;
    price?: number;
    colorCodes?: string[];
    options?: string[];
    types?: IOrderServiceType[];
    complexity?: IOrderServiceComplexity;
    disabledOptions?: string[];
}

export interface IOrderDetails {
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

export interface IOrder extends Document {
    orderID: string;
    user: IOrderUser;
    services: IOrderServiceSelection[];
    details?: IOrderDetails;
    isRevision?: boolean;
    status:
        | 'pending'
        | 'in-progress'
        | 'delivered'
        | 'in-revision'
        | 'completed'
        | 'canceled';
    paymentID?: string;
    paymentStatus:
        | 'pending'
        | 'pay-later'
        | 'paid'
        | 'payment-failed'
        | 'refunded';
    refundID?: string;
    orderStage:
        | 'draft'
        | 'services-selected'
        | 'details-provided'
        | 'payment-completed';
    total?: number;
    createdAt: Date;
    updatedAt: Date;
}
