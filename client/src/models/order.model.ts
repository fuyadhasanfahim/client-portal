import { Schema, model } from 'mongoose';
import {
    IOrderUser,
    IOrder,
    IOrderDetails,
    IOrderServiceComplexity,
    IOrderServiceSelection,
    IOrderServiceType,
} from '../types/order.interface';
import { models } from 'mongoose';

const OrderUserSchema = new Schema<IOrderUser>(
    {
        userID: { type: String, required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        image: { type: String },
        company: { type: String },
        address: { type: String },
    },
    { timestamps: true }
);

const OrderServiceComplexitySchema = new Schema<IOrderServiceComplexity>(
    {
        name: { type: String, required: true },
        price: { type: Number, required: true },
    },
    { timestamps: true }
);

const OrderServiceTypeSchema = new Schema<IOrderServiceType>(
    {
        name: { type: String, required: true },
        price: { type: Number },
        complexity: { type: OrderServiceComplexitySchema },
    },
    { timestamps: true }
);

const OrderServiceSelectionSchema = new Schema<IOrderServiceSelection>(
    {
        name: { type: String, required: true },
        price: { type: Number },
        colorCodes: [{ type: String }],
        options: [{ type: String }],
        types: [OrderServiceTypeSchema],
        complexity: { type: OrderServiceComplexitySchema },
    },
    { timestamps: true }
);

const OrderDetailsSchema = new Schema<IOrderDetails>(
    {
        deliveryDate: { type: Date },
        downloadLink: { type: String },
        images: { type: Number },
        returnFileFormat: [{ type: String }],
        backgroundOption: [{ type: String }],
        backgroundColor: [{ type: String }],
        imageResizing: { type: Boolean },
        width: { type: Number },
        height: { type: Number },
        instructions: { type: String },
    },
    { timestamps: true }
);

export const OrderSchema = new Schema<IOrder>(
    {
        orderID: { type: String, required: true, unique: true },
        user: { type: OrderUserSchema, required: true },
        services: { type: [OrderServiceSelectionSchema], required: true },
        details: { type: OrderDetailsSchema },
        status: {
            type: String,
            enum: [
                'pending',
                'in-progress',
                'delivered',
                'in-revision',
                'completed',
                'canceled',
            ],
            default: 'pending',
        },
        paymentID: { type: String },
        paymentStatus: {
            type: String,
            enum: [
                'pending',
                'pay-later',
                'paid',
                'payment-failed',
                'refunded',
            ],
            default: 'pending',
        },
        refundID: {
            type: String,
        },
        orderStage: {
            type: String,
            enum: [
                'draft',
                'services-selected',
                'details-provided',
                'payment-completed',
            ],
            default: 'draft',
        },
    },
    {
        timestamps: true,
    }
);

const OrderModel = models?.Order || model('Order', OrderSchema);
export default OrderModel;
