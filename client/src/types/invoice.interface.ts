import { IOrder } from './order.interface';

export interface IInvoice {
    invoiceID: string;
    invoiceNo: number;
    client: {
        name: string;
        address: string;
        phone: string;
        company?: string;
    };
    company: {
        name: string;
        address: string;
        phone: string;
    };
    orders: IOrder[];
    date: {
        from: Date;
        to: Date;
        issued: Date;
    };
    taxRate: number;
    subTotal: number;
    total: number;
    createdBy: string;
}
