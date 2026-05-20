import envConfig from "../config/env.config.js";
import { IOrder } from "../types/order.interface.js";

export function getInvoiceEmailTemplate(order: IOrder) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #777; }
            .button { display: inline-block; padding: 10px 20px; background-color: #4a6baf; color: white; text-decoration: none; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>Invoice for Your Order</h2>
        </div>
        
        <div class="content">
            <p>Dear Valued Customer,</p>
            
            <p>Please find attached the invoice for your recent order <strong>#${order.orderID}</strong>.</p>
            
            <p><strong>Order Total:</strong> $${order.total?.toFixed(2)}</p>
            
            <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
            
            <p style="text-align: center; margin-top: 25px;">
                <a href="${envConfig.frontend_url!}/orders/details/${order.orderID}" class="button">
                    View Order Details
                </a>
            </p>
        </div>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Web Briks LLC. All rights reserved.</p>
        </div>
    </body>
    </html>
    `;
}
