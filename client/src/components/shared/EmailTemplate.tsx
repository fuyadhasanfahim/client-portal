/* eslint-disable @next/next/no-head-element, @next/next/no-img-element */
import React from 'react';

export interface EmailTemplateProps {
    emailTitle: string;
    userName: string;
    emailMessage: string;
    userEmail: string;

    // Optional sections
    orderTitle?: string;
    orderMessage?: string;

    // Info section
    infoItems?: Array<{ label: string; value: string }>;

    // Status
    status?: {
        text: string;
        type: 'success' | 'warning' | 'info';
    };

    // Buttons
    primaryButton?: { text: string; url: string };
    secondaryButton?: { text: string; url: string };

    // Footer
    footerMessage?: string;

    supportEmail?: string;
    privacyUrl?: string;
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({
    emailTitle,
    userName,
    emailMessage,
    userEmail,
    orderTitle,
    orderMessage,
    infoItems = [],
    status,
    primaryButton,
    secondaryButton,
    footerMessage,
    supportEmail = 'info@webbriks.com',
    privacyUrl = 'https://www.webbriks.com/privacy-policy',
}) => {
    const currentYear = new Date().getFullYear();

    const statusClasses = {
        success: 'status-success',
        warning: 'status-warning',
        info: 'status-info',
    };

    return (
        <html lang="en">
            <head>
                <meta charSet="UTF-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0"
                />
                <title>{emailTitle}</title>
                <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8f9fa;
            margin: 0;
            padding: 20px 0;
          }
          
          .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          }
          
          .header {
            background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 50%, #3a7ca8 100%);
            padding: 30px 40px;
            text-align: center;
            position: relative;
          }
          
          .header::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #40b5a8 0%, #ff8c42 100%);
          }
          
          .logo-section {
            margin-bottom: 20px;
          }
          
          .logo-placeholder {
            display: inline-block;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 15px 25px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          
          .logo-image {
            max-height: 40px;
            width: auto;
            display: block;
            margin: 0 auto;
          }
          
          .header-title {
            color: #ffffff;
            font-size: 24px;
            font-weight: 600;
            margin: 0;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .content {
            padding: 40px;
          }
          
          .greeting {
            font-size: 18px;
            color: #1e3a5f;
            margin-bottom: 25px;
            font-weight: 500;
          }
          
          .message {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 30px;
            line-height: 1.7;
          }
          
          .highlight-box {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            border-left: 4px solid #40b5a8;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
          }
          
          .highlight-box h3 {
            color: #1e3a5f;
            font-size: 18px;
            margin-bottom: 10px;
            font-weight: 600;
          }
          
          .highlight-box p {
            color: #4a5568;
            margin: 0;
          }
          
          .button-container {
            text-align: center;
            margin: 35px 0;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #40b5a8 0%, #2d5a87 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(64, 181, 168, 0.3);
            transition: all 0.3s ease;
            border: none;
            cursor: pointer;
          }
          
          .secondary-button {
            display: inline-block;
            background: transparent;
            color: #40b5a8 !important;
            text-decoration: none;
            padding: 14px 28px;
            border: 2px solid #40b5a8;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin-left: 15px;
          }
          
          .info-section {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #f1f5f9;
          }
          
          .info-row:last-child {
            border-bottom: none;
          }
          
          .info-label {
            font-weight: 600;
            color: #1e3a5f;
            flex: 1;
          }
          
          .info-value {
            color: #4a5568;
            flex: 2;
            text-align: right;
          }
          
          .footer {
            background: #f8f9fa;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          
          .footer-text {
            font-size: 13px;
            color: #718096;
            line-height: 1.5;
          }
          
          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent 0%, #40b5a8 50%, transparent 100%);
            margin: 30px 0;
          }
          
          .status-badge {
            display: inline-block;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .status-success {
            background: #d4edda;
            color: #155724;
          }
          
          .status-warning {
            background: #fff3cd;
            color: #856404;
          }
          
          .status-info {
            background: #d1ecf1;
            color: #0c5460;
          }
          
          @media only screen and (max-width: 600px) {
            body {
              padding: 10px 0;
            }
            
            .email-wrapper {
              margin: 0 10px;
              border-radius: 8px;
            }
            
            .header,
            .content,
            .footer {
              padding: 25px 20px;
            }
            
            .header-title {
              font-size: 20px;
            }
            
            .logo-image {
              max-height: 35px;
            }
            
            .greeting {
              font-size: 16px;
            }
            
            .message {
              font-size: 15px;
            }
            
            .cta-button {
              padding: 14px 24px;
              font-size: 15px;
              display: block;
              margin: 20px 0;
            }
            
            .secondary-button {
              padding: 12px 20px;
              font-size: 15px;
              margin: 10px 0 0 0;
              display: block;
            }
            
            .info-row {
              flex-direction: column;
              align-items: flex-start;
              text-align: left;
            }
            
            .info-value {
              text-align: left;
              margin-top: 5px;
            }
          }
          
          @media only screen and (max-width: 480px) {
            .header,
            .content,
            .footer {
              padding: 20px 15px;
            }
            
            .highlight-box,
            .info-section {
              padding: 20px 15px;
            }
          }
        `}</style>
            </head>
            <body>
                <div className="email-wrapper">
                    {/* Header */}
                    <div className="header">
                        <div className="logo-section">
                            <div className="logo-placeholder">
                                <img
                                    src="https://res.cloudinary.com/dny7zfbg9/image/upload/v1755925557/uigjdstdcvlsngrtxbrl.png"
                                    alt="WebBriks Logo"
                                    className="logo-image"
                                />
                            </div>
                        </div>
                        <h1 className="header-title">{emailTitle}</h1>
                    </div>

                    {/* Content */}
                    <div className="content">
                        <div className="greeting">Hello {userName},</div>

                        <div
                            className="message"
                            dangerouslySetInnerHTML={{ __html: emailMessage }}
                        />

                        {/* Order/Status Updates */}
                        {orderTitle && orderMessage && (
                            <div className="highlight-box">
                                <h3>{orderTitle}</h3>
                                <p>{orderMessage}</p>
                            </div>
                        )}

                        {/* Information Display */}
                        {infoItems.length > 0 && (
                            <div className="info-section">
                                {infoItems.map((item, index) => (
                                    <div key={index} className="info-row">
                                        <div className="info-label">
                                            {item.label}
                                        </div>
                                        <div className="info-value">
                                            {item.value}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Status Badge */}
                        {status && (
                            <div
                                style={{
                                    textAlign: 'center',
                                    margin: '25px 0',
                                }}
                            >
                                <span
                                    className={`status-badge ${
                                        statusClasses[status.type]
                                    }`}
                                >
                                    {status.text}
                                </span>
                            </div>
                        )}

                        {/* Call to Action Buttons */}
                        {(primaryButton || secondaryButton) && (
                            <div className="button-container">
                                {primaryButton && (
                                    <a
                                        href={primaryButton.url}
                                        className="cta-button"
                                    >
                                        {primaryButton.text}
                                    </a>
                                )}
                                {secondaryButton && (
                                    <a
                                        href={secondaryButton.url}
                                        className="secondary-button"
                                    >
                                        {secondaryButton.text}
                                    </a>
                                )}
                            </div>
                        )}

                        {footerMessage && (
                            <>
                                <div className="divider"></div>
                                <div
                                    className="message"
                                    dangerouslySetInnerHTML={{
                                        __html: footerMessage,
                                    }}
                                />
                            </>
                        )}
                    </div>

                    <div className="footer">
                        <div className="footer-text">
                            <p>This email was sent to {userEmail}.</p>
                            <p>
                                If you have any questions, feel free to{' '}
                                <a
                                    href={`mailto:${supportEmail}`}
                                    style={{ color: '#40b5a8' }}
                                >
                                    contact our support team
                                </a>
                                .
                            </p>
                            <p style={{ marginTop: '15px' }}>
                                <a
                                    href={privacyUrl}
                                    style={{ color: '#718096' }}
                                >
                                    Privacy Policy
                                </a>
                            </p>
                            <p style={{ marginTop: '10px', fontSize: '12px' }}>
                                © {currentYear} Web Briks LLC. All rights
                                reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    );
};
