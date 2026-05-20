export function deliveryEmail(orderID: string, downloadLink: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Delivered</title>
        <style>
            body {
                font-family: 'Inter', sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background-color: rgb(255 155 7);
                color: white;
                padding: 20px;
                text-align: center;
                border-radius: 5px 5px 0 0;
            }
            .content {
                padding: 20px;
                background-color: #f9f9f9;
                border-left: 1px solid #ddd;
                border-right: 1px solid #ddd;
            }
            .footer {
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #777;
                background-color: #eee;
                border-radius: 0 0 5px 5px;
                border-left: 1px solid #ddd;
                border-right: 1px solid #ddd;
                border-bottom: 1px solid #ddd;
            }
            .button {
                display: inline-block;
                padding: 10px 20px;
                background-color: rgb(255 155 7);
                color: white;
                text-decoration: none;
                border-radius: 4px;
                margin: 15px 0;
            }
            .order-details {
                background-color: white;
                padding: 15px;
                border: 1px solid #eee;
                border-radius: 4px;
                margin: 15px 0;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Your Order Has Been Delivered!</h1>
        </div>
        
        <div class="content">
            <p>Dear Valued Customer,</p>
            
            <p>We're pleased to inform you that your order <strong>#${orderID}</strong> has been successfully delivered by our team.</p>
            
            <div class="order-details">
                <h3>Order Details</h3>
                <p><strong>Order ID:</strong> ${orderID}</p>
                <p><strong>Delivery Date:</strong> ${new Date().toLocaleDateString()}</p>
            </div>
            
            <p>You can now download your files using the link below:</p>
            
            <p style="text-align: center;">
                <a href="${downloadLink}" class="button">Download Your Files</a>
            </p>
            
            <p>If you have any questions or need further assistance, please don't hesitate to contact our support team.</p>
            
            <p>Thank you for choosing us!</p>
        </div>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Web Briks LLC. All rights reserved.</p>
            <p>
                <a href="https://webbriks.com/privacy-policy">Privacy Policy</a> | 
                <a href="https://webbriks.com/terms-and-conditions">Terms of Service</a>
            </p>
        </div>
    </body>
    </html>
    `;
}
