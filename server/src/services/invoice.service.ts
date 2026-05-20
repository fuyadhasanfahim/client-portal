import { OrderModel } from "../models/order.model.js";
import { generateInvoicePDF } from "../utils/generateInvoicePDF.js";

async function sendInvoiceEmail(orderID: string) {
    const order = await OrderModel.findOne({ orderID }).lean();
    if (!order) {
        throw new Error("Order not found");
    }

    const pdfBuffer = await generateInvoicePDF(order);

    return { pdfBuffer, order };
}

const InvoiceServices = { sendInvoiceEmail };

export default InvoiceServices;
