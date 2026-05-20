export interface EmailTemplateProps {
    emailTitle: string;
    userName: string;
    emailMessage: string;
    userEmail: string;

    orderTitle?: string;
    orderMessage?: string;

    infoItems?: Array<{ label: string; value: string }>;

    status?: {
        text: string;
        type: "success" | "warning" | "info";
    };

    primaryButton?: { text: string; url: string };
    secondaryButton?: { text: string; url: string };

    footerMessage?: string;

    supportEmail?: string;
    privacyUrl?: string;

    options?: {
        allowHtmlInEmailMessage?: boolean;
        allowHtmlInFooterMessage?: boolean;
    };
}

// tiny HTML escaper to avoid injection when not allowing raw HTML
const escapeHtml = (s: string) =>
    s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const statusClass = (t: "success" | "warning" | "info") =>
    ({
        success: "status-success",
        warning: "status-warning",
        info: "status-info",
    })[t];

export const renderEmailTemplateNode = (props: EmailTemplateProps): string => {
    const {
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
        supportEmail = "info@webbriks.com",
        privacyUrl = "https://www.webbriks.com/privacy-policy",
        options,
    } = props;

    const currentYear = new Date().getFullYear();
    const allowHtmlMsg = options?.allowHtmlInEmailMessage ?? false;
    const allowHtmlFooter = options?.allowHtmlInFooterMessage ?? false;

    const safeMessage = allowHtmlMsg ? emailMessage : escapeHtml(emailMessage);
    const safeFooter = footerMessage
        ? allowHtmlFooter
            ? footerMessage
            : escapeHtml(footerMessage)
        : "";

    const infoRows = infoItems.length
        ? infoItems
              .map(
                  (it) => `
          <div class="info-row">
            <div class="info-label">${escapeHtml(it.label)}</div>
            <div class="info-value">${escapeHtml(it.value)}</div>
          </div>`
              )
              .join("\n")
        : "";

    const statusBadge = status
        ? `<div style="text-align:center;margin:25px 0;">
        <span class="status-badge ${statusClass(status.type)}">${escapeHtml(status.text)}</span>
      </div>`
        : "";

    const cta =
        primaryButton || secondaryButton
            ? `<div class="button-container">
          ${
              primaryButton
                  ? `<a href="${primaryButton.url}" class="cta-button">${escapeHtml(primaryButton.text)}</a>`
                  : ""
          }
          ${
              secondaryButton
                  ? `<a href="${secondaryButton.url}" class="secondary-button">${escapeHtml(secondaryButton.text)}</a>`
                  : ""
          }
        </div>`
            : "";

    const orderBlock =
        orderTitle && orderMessage
            ? `<div class="highlight-box">
           <h3>${escapeHtml(orderTitle)}</h3>
           <p>${escapeHtml(orderMessage)}</p>
         </div>`
            : "";

    const infoBlock = infoRows
        ? `<div class="info-section">${infoRows}</div>`
        : "";

    const footerBlock = footerMessage
        ? `<div class="divider"></div>
       <div class="message">${safeFooter}</div>`
        : "";

    // keep your original CSS + structure for visual parity
    return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1.0" />
<title>${escapeHtml(emailTitle)}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,sans-serif; line-height:1.6; color:#333; background-color:#f8f9fa; margin:0; padding:20px 0; }
  .email-wrapper { max-width:600px; margin:0 auto; background-color:#fff; border-radius:12px; border:1px solid #e2e8f0; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.08); }
  .header { background:linear-gradient(135deg,#1e3a5f 0%,#2d5a87 50%,#3a7ca8 100%); padding:30px 40px; text-align:center; position:relative; }
  .header::after { content:''; position:absolute; bottom:0; left:0; right:0; height:4px; background:linear-gradient(90deg,#40b5a8 0%,#ff8c42 100%); }
  .logo-section { margin-bottom:20px; }
  .logo-placeholder { display:inline-block; background:rgba(255,255,255,0.1); border-radius:8px; padding:15px 25px; backdrop-filter:blur(10px); border:1px solid rgba(255,255,255,0.2); }
  .logo-image { max-height:40px; width:auto; display:block; margin:0 auto; }
  .header-title { color:#fff; font-size:24px; font-weight:600; margin:0; text-shadow:0 2px 4px rgba(0,0,0,0.1); }
  .content { padding:40px; }
  .greeting { font-size:18px; color:#1e3a5f; margin-bottom:25px; font-weight:500; }
  .message { font-size:16px; color:#4a5568; margin-bottom:30px; line-height:1.7; }
  .highlight-box { background:linear-gradient(135deg,#f7fafc 0%,#edf2f7 100%); border-left:4px solid #40b5a8; padding:20px; margin:25px 0; border-radius:0 8px 8px 0; }
  .highlight-box h3 { color:#1e3a5f; font-size:18px; margin-bottom:10px; font-weight:600; }
  .highlight-box p { color:#4a5568; margin:0; }
  .button-container { text-align:center; margin:35px 0; }
  .cta-button { display:inline-block; background:linear-gradient(135deg,#40b5a8 0%,#2d5a87 100%); color:#fff !important; text-decoration:none; padding:16px 32px; border-radius:50px; font-weight:600; font-size:16px; text-align:center; box-shadow:0 4px 15px rgba(64,181,168,0.3); transition:all .3s ease; border:none; cursor:pointer; }
  .secondary-button { display:inline-block; background:transparent; color:#40b5a8 !important; text-decoration:none; padding:14px 28px; border:2px solid #40b5a8; border-radius:50px; font-weight:600; font-size:16px; text-align:center; margin-left:15px; }
  .info-section { background:#fff; border:1px solid #e2e8f0; border-radius:8px; padding:25px; margin:25px 0; }
  .info-row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #f1f5f9; }
  .info-row:last-child { border-bottom:none; }
  .info-label { font-weight:600; color:#1e3a5f; flex:1; }
  .info-value { color:#4a5568; flex:2; text-align:right; }
  .footer { background:#f8f9fa; padding:30px 40px; text-align:center; border-top:1px solid #e2e8f0; }
  .footer-text { font-size:13px; color:#718096; line-height:1.5; }
  .divider { height:1px; background:linear-gradient(90deg,transparent 0%, #40b5a8 50%, transparent 100%); margin:30px 0; }
  .status-badge { display:inline-block; padding:6px 16px; border-radius:20px; font-size:14px; font-weight:600; text-transform:uppercase; letter-spacing:.5px; }
  .status-success { background:#d4edda; color:#155724; }
  .status-warning { background:#fff3cd; color:#856404; }
  .status-info { background:#d1ecf1; color:#0c5460; }
  @media only screen and (max-width:600px){
    body { padding:10px 0; }
    .email-wrapper { margin:0 10px; border-radius:8px; }
    .header,.content,.footer { padding:25px 20px; }
    .header-title { font-size:20px; }
    .logo-image { max-height:40px; }
    .greeting { font-size:16px; }
    .message { font-size:15px; }
    .cta-button { padding:14px 24px; font-size:15px; display:block; margin:20px 0; }
    .secondary-button { padding:12px 20px; font-size:15px; margin:10px 0 0 0; display:block; }
    .info-row { flex-direction:column; align-items:flex-start; text-align:left; }
    .info-value { text-align:left; margin-top:5px; }
  }
  @media only screen and (max-width:480px){
    .header,.content,.footer { padding:20px 15px; }
    .highlight-box,.info-section { padding:20px 15px; }
  }
</style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div class="logo-section">
        <div class="logo-placeholder">
          <img src="https://res.cloudinary.com/dny7zfbg9/image/upload/v1755925557/uigjdstdcvlsngrtxbrl.png" alt="WebBriks Logo" class="logo-image" />
        </div>
      </div>
      <h1 class="header-title">${escapeHtml(emailTitle)}</h1>
    </div>

    <div class="content">
      <div class="greeting">Hello ${escapeHtml(userName)},</div>
      <div class="message">${safeMessage}</div>

      ${orderBlock}
      ${infoBlock}
      ${statusBadge}
      ${cta}

      ${footerBlock}
    </div>

    <div class="footer">
      <div class="footer-text">
        <p>This email was sent to ${escapeHtml(userEmail)}.</p>
        <p>If you have any questions, feel free to <a href="mailto:${supportEmail}" style="color:#40b5a8">contact our support team</a>.</p>
        <p style="margin-top:15px;"><a href="${privacyUrl}" style="color:#718096">Privacy Policy</a></p>
        <p style="margin-top:10px; font-size:12px;">© ${currentYear} Web Briks LLC. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>`;
};

export type SimpleOrderStatus =
    | "pending"
    | "in-progress"
    | "delivered"
    | "in-revision"
    | "completed"
    | "canceled";

const SUBJECT: Record<SimpleOrderStatus, (id: string) => string> = {
    pending: (id) => `Order #${id} — Pending`,
    "in-progress": (id) => `Order #${id} — In progress`,
    delivered: (id) => `Order #${id} — Delivered`,
    "in-revision": (id) => `Order #${id} — In revision`,
    completed: (id) => `Order #${id} — Completed`,
    canceled: (id) => `Order #${id} — Canceled`,
};

const BADGE_TYPE: Record<SimpleOrderStatus, "success" | "warning" | "info"> = {
    pending: "info",
    "in-progress": "info",
    delivered: "info",
    "in-revision": "warning",
    completed: "success",
    canceled: "warning",
};

export function buildSimpleOrderStatusEmail(opts: {
    orderID: string;
    status: SimpleOrderStatus;
    userName: string;
    userEmail: string;
    viewUrl?: string;
}): { subject: string; html: string } {
    const subject = SUBJECT[opts.status](opts.orderID);

    const html = renderEmailTemplateNode({
        emailTitle: subject,
        userName: opts.userName,
        userEmail: opts.userEmail,
        // one-liner message only
        emailMessage: `Status update for <b>Order #${opts.orderID}</b>.`,
        // highlight section just says the status
        orderTitle: `Order #${opts.orderID}`,
        orderMessage: `Current status: ${label(opts.status)}`,
        status: { text: label(opts.status), type: BADGE_TYPE[opts.status] },
        // optional single CTA
        primaryButton: opts.viewUrl
            ? { text: "View order", url: opts.viewUrl }
            : undefined,
        // no secondary button, no info rows, no extra footer
        options: { allowHtmlInEmailMessage: true },
    });

    return { subject, html };
}

export function buildSimpleQuoteStatusEmail(opts: {
    quoteID: string;
    status: SimpleOrderStatus;
    userName: string;
    userEmail: string;
    viewUrl?: string;
}): { subject: string; html: string } {
    const subject = SUBJECT[opts.status](opts.quoteID);

    const html = renderEmailTemplateNode({
        emailTitle: subject,
        userName: opts.userName,
        userEmail: opts.userEmail,
        emailMessage: `Status update for <b>Quote #${opts.quoteID}</b>.`,
        orderTitle: `Quote #${opts.quoteID}`,
        orderMessage: `Current status: ${label(opts.status)}`,
        status: { text: label(opts.status), type: BADGE_TYPE[opts.status] },
        primaryButton: opts.viewUrl
            ? { text: "View Quote", url: opts.viewUrl }
            : undefined,
        options: { allowHtmlInEmailMessage: true },
    });

    return { subject, html };
}

const label = (s: SimpleOrderStatus) =>
    ({
        pending: "Pending",
        "in-progress": "In progress",
        delivered: "Delivered",
        "in-revision": "In revision",
        completed: "Completed",
        canceled: "Canceled",
    })[s];

export type ApplicantStatus =
    | "applied"
    | "shortlisted"
    | "interview"
    | "hired"
    | "rejected";

const APPLICANT_SUBJECT: Record<ApplicantStatus, () => string> = {
    applied: () => `Application Received`,
    shortlisted: () => `Application Shortlisted`,
    interview: () => `Interview Invitation`,
    hired: () => `Congratulations! You’re Hired`,
    rejected: () => `Application Update`,
};

const APPLICANT_BADGE: Record<ApplicantStatus, "success" | "warning" | "info"> =
    {
        applied: "info",
        shortlisted: "info",
        interview: "warning",
        hired: "success",
        rejected: "warning",
    };

const applicantLabel = (s: ApplicantStatus) =>
    ({
        applied: "Applied",
        shortlisted: "Shortlisted",
        interview: "Interview",
        hired: "Hired",
        rejected: "Rejected",
    })[s];

export function buildApplicantStatusEmail(opts: {
    status: ApplicantStatus;
    userName: string;
    userEmail: string;
    viewUrl?: string;
    date?: string; // e.g. "2025-09-20"
    time?: string; // e.g. "10:30 AM"
}): { subject: string; html: string } {
    const subject = APPLICANT_SUBJECT[opts.status]();

    // Default dynamic message
    let message: string;

    if (opts.status === "applied") {
        message =
            "We have received your application. Our team will review it and get back to you soon.";
    } else if (opts.status === "shortlisted") {
        message =
            "Congratulations! You have been shortlisted. Our team will reach out with the next steps.";
    } else if (opts.status === "interview") {
        // Custom Interview message
        message = `
            Hello ${opts.userName},<br/><br/>
            Greetings from <b>Web Briks LLC</b>. Here are your interview details:<br/><br/>

            <b>Date:</b> ${opts.date ?? "To be scheduled"}<br/>
            <b>Time:</b> ${opts.time ?? "To be scheduled"}<br/>
            <b>Address:</b> Level 14, Sheltech Rubynur, 121 Begum Rokeya Ave, Mirpur - 10, Dhaka.<br/>
            <b>Google Map:</b> <a href="https://maps.app.goo.gl/Bg4fwN1ucemxdVoF9">View Location</a><br/><br/>

            <b>Note:</b> Please bring your hard copy CV.<br/><br/>

            Regards,<br/>
            Human Resource Division
        `;
    } else if (opts.status === "hired") {
        message =
            "We are delighted to inform you that you have been selected for the role. Our HR team will contact you with onboarding details.";
    } else {
        message =
            "We appreciate the time and effort you put into your application. Unfortunately, you were not selected at this time, but we encourage you to apply for future opportunities.";
    }

    const html = renderEmailTemplateNode({
        emailTitle: subject,
        userName: opts.userName,
        userEmail: opts.userEmail,
        emailMessage: message,
        orderTitle:
            opts.status === "interview"
                ? "Interview Invitation"
                : "Application Status",
        orderMessage: `Current status: ${applicantLabel(opts.status)}`,
        status: {
            text: applicantLabel(opts.status),
            type: APPLICANT_BADGE[opts.status],
        },
        primaryButton: opts.viewUrl
            ? { text: "View Application", url: opts.viewUrl }
            : undefined,
        options: { allowHtmlInEmailMessage: true },
    });

    return { subject, html };
}
