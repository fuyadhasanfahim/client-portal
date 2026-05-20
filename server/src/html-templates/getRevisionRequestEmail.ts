import envConfig from "../config/env.config.js";

export function getAdminRevisionEmail(
    orderID: string,
    customerName: string,
    customerEmail: string,
    instructions: string
): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #fff8e1; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; border-bottom: 3px solid #ffc107; }
            .content { padding: 20px; background-color: #fff; border-left: 1px solid #ddd; border-right: 1px solid #ddd; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #777; background-color: #f8f9fa; border-radius: 0 0 5px 5px; border: 1px solid #ddd; }
            .alert-box { background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin: 15px 0; }
            .instructions { background-color: #f5f5f5; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .customer-info { background-color: #e3f2fd; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .button { display: inline-block; padding: 10px 20px; background-color: #2196f3; color: white; text-decoration: none; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h2 style="color: #ff6f00;">Revision Request Received</h2>
            <p style="font-weight: bold; color: #d84315;">Order #${orderID}</p>
        </div>
        
        <div class="content">
            <div class="alert-box">
                <h3 style="margin-top: 0; color: #e65100;">Action Required</h3>
                <p>Please review the revision request and take appropriate action.</p>
            </div>
            
            <div class="customer-info">
                <h3 style="margin-top: 0;">Customer Details</h3>
                <p><strong>Name:</strong> ${customerName}</p>
                <p><strong>Email:</strong> <a href="mailto:${customerEmail}">${customerEmail}</a></p>
                <p><strong>Order ID:</strong> ${orderID}</p>
            </div>
            
            <div class="instructions">
                <h3 style="margin-top: 0;">Revision Instructions</h3>
                <p>${instructions.replace(/\n/g, "<br>")}</p>
            </div>
            
            <p style="text-align: center; margin-top: 25px;">
                <a href="${envConfig.frontend_url}/orders/details/${orderID}" class="button">
                    View Order in Dashboard
                </a>
            </p>
            
            <p>Please complete the revision within the agreed timeframe.</p>
        </div>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Web Briks LLC. All rights reserved.</p>
        </div>
    </body>
    </html>
    `;
}

export function getCustomerRevisionEmail(
    orderID: string,
    customerName: string
): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { padding: 20px; background-color: #fff; border-left: 1px solid #ddd; border-right: 1px solid #ddd; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #777; background-color: #f8f9fa; border-radius: 0 0 5px 5px; border: 1px solid #ddd; }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>Revision Request Submitted</h2>
        </div>
        
        <div class="content">
            <p>Dear ${customerName},</p>
            
            <p>We've received your revision request for <strong>Order #${orderID}</strong>.</p>
            
            <p>Our team will review your request and get back to you soon with the updated work.</p>
            
            <p>If you have any additional questions, please reply to this email.</p>
            
            <p>Best regards,<br>Customer Support Team</p>
        </div>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Web Briks LLC. All rights reserved.</p>
        </div>
    </body>
    </html>
    `;
}
