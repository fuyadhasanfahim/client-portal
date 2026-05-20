export function getOrderCompletionEmail(
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
            .header { background-color: #e8f5e9; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { padding: 20px; background-color: #fff; border-left: 1px solid #ddd; border-right: 1px solid #ddd; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #777; background-color: #f8f9fa; border-radius: 0 0 5px 5px; border: 1px solid #ddd; }
            .button { display: inline-block; padding: 10px 20px; background-color: #4a6baf; color: white; text-decoration: none; border-radius: 4px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h2>Order Successfully Completed!</h2>
        </div>
        
        <div class="content">
            <p>Dear ${customerName},</p>
            
            <p>Thank you for confirming the completion of <strong>Order #${orderID}</strong>.</p>
            
            <p>We appreciate your business and hope you're satisfied with the final results.</p>
            
            <p>If you need any further assistance or have future projects, don't hesitate to reach out.</p>
            
            <p>We'd love to hear your feedback about your experience working with us.</p>
            
            <p>Best regards,<br>Customer Support Team</p>
        </div>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        </div>
    </body>
    </html>
    `;
}
