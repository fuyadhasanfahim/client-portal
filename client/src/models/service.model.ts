import { model, models, Schema } from 'mongoose';
import { IComplexity, IService, IType } from '../types/service.interface';

const complexitySchema = new Schema<IComplexity>({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
});

const typeSchema = new Schema<IType>({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
    },
    complexities: {
        type: [complexitySchema],
    },
});

const serviceSchema = new Schema<IService>({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    price: {
        type: Number,
    },
    complexities: {
        type: [complexitySchema],
    },
    types: {
        type: [typeSchema],
    },
    options: {
        type: Boolean,
        default: false,
    },
    inputs: {
        type: Boolean,
        default: false,
    },
    instruction: {
        type: String,
    },
    disabledOptions: {
        type: [String],
        default: [],
    },
});
const ServiceModel =
    models?.Service || model<IService>('Service', serviceSchema);
export default ServiceModel;
