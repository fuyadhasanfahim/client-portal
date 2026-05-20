import { model, Schema } from "mongoose";

const additionalServiceSchema = new Schema({
    serviceName: { type: String, required: true },
    servicePrice: { type: Number, required: true },
    clientEmail: { type: String, required: true },
    requestedAt: { type: Date, default: new Date() },
    status: {
        type: String,
        enum: ["pending", "approved", "declined"],
        default: "pending",
    },
});

const AdditionalServiceModel = model(
    "AdditionalService",
    additionalServiceSchema
);
export default AdditionalServiceModel;
