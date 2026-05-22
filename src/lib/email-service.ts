import nodemailer from "nodemailer";
import { type InvoiceData } from "@/lib/invoice-template";
import { getWhatsappCommunityInfo } from "@/lib/whatsapp-community";

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachment?: Buffer;
  filename?: string;
}

export async function sendInvoiceEmail(options: EmailOptions): Promise<boolean> {
  try {
    const smtpUser = process.env.EMAIL_USER;
    const smtpPass = process.env.EMAIL_PASS?.replace(/\s/g, "");

    if (!smtpUser || !smtpPass) {
      console.error("Missing EMAIL_USER or EMAIL_PASS environment variables");
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions: any = {
      from: `"Cyborg Robotics Academy" <${smtpUser}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    if (options.attachment) {
      mailOptions.attachments = [
        {
          filename: options.filename || "invoice.pdf",
          content: options.attachment,
          contentType: "application/pdf",
        },
      ];
    }

    await transporter.sendMail(mailOptions);
    console.log(`Invoice email sent to ${options.to}`);
    return true;
  } catch (error) {
    console.error("Error sending invoice email:", error);
    return false;
  }
}

export async function sendPaymentConfirmation(
  invoiceData: InvoiceData,
  invoicePdf?: Buffer
): Promise<boolean> {
  const subject = `Payment Confirmation - ${invoiceData.courseName}`;
  const whatsappInfo = getWhatsappCommunityInfo(invoiceData.courseName);
  const invoiceNote = invoicePdf
    ? "Your invoice is attached with this email."
    : "Your invoice is available from your registration success page.";
  const amountLabel = invoiceData.amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const whatsappHtml = whatsappInfo
    ? `
          <div style="margin: 20px 0 0; padding: 16px; border: 1px solid #bbf7d0; border-radius: 12px; background: #f0fdf4;">
            <p style="margin: 0 0 10px; font-size: 15px; font-weight: 700; color: #14532d;">
              Join ${whatsappInfo.title}
            </p>
            <p style="margin: 0 0 14px; color: #374151; font-size: 14px;">
              Stay connected for updates, resources, and support.
            </p>
            <a href="${whatsappInfo.link}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; font-weight: 700; padding: 10px 16px; border-radius: 999px;">
              Join WhatsApp Community
            </a>
            <p style="margin: 10px 0 0; color: #4b5563; font-size: 12px; word-break: break-all;">
              ${whatsappInfo.link}
            </p>
          </div>
        `
    : "";
  const whatsappText = whatsappInfo
    ? `
Join WhatsApp Community:
${whatsappInfo.title}
${whatsappInfo.link}
`
    : "";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111827; line-height: 1.6;">
      <div style="border: 1px solid #f1d5d5; border-radius: 14px; overflow: hidden; background: #ffffff;">
        <div style="background: #8D0F11; color: #ffffff; padding: 22px 24px;">
          <h1 style="margin: 0; font-size: 24px;">Payment Confirmation</h1>
          <p style="margin: 6px 0 0; font-size: 14px;">Cyborg Robotics Academy Pvt Ltd</p>
        </div>

        <div style="padding: 24px;">
          <p style="margin: 0 0 14px;">Dear ${invoiceData.studentName},</p>
          <p style="margin: 0 0 18px;">
            Thank you. We have successfully received your payment for
            <strong>${invoiceData.courseName}</strong>.
          </p>

          <table style="width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 14px;">
            <tr>
              <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #f3f4f6;">Order ID</td>
              <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #f3f4f6;"><strong>${invoiceData.orderId}</strong></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #f3f4f6;">Invoice Number</td>
              <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #f3f4f6;"><strong>${invoiceData.invoiceNumber}</strong></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280; border-bottom: 1px solid #f3f4f6;">Amount Paid</td>
              <td style="padding: 10px 0; text-align: right; border-bottom: 1px solid #f3f4f6;"><strong>₹${amountLabel}</strong></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #6b7280;">Status</td>
              <td style="padding: 10px 0; text-align: right;"><strong style="color: #15803d;">PAID</strong></td>
            </tr>
          </table>

          <p style="margin: 18px 0 0;">${invoiceNote}</p>
          ${whatsappHtml}
          <p style="margin: 16px 0 0; color: #6b7280; font-size: 13px;">
            For support, reply to this email or contact info@cyborgrobotics.com.
          </p>
        </div>
      </div>
    </div>
  `;
  const text = `Payment confirmation for ${invoiceData.studentName}

Invoice: ${invoiceData.invoiceNumber}
Order ID: ${invoiceData.orderId}
Course: ${invoiceData.courseName}
Amount Paid: ${invoiceData.amount.toLocaleString("en-IN")}
Status: ${invoiceData.status}

${invoiceNote}
${whatsappText}
`;

  return await sendInvoiceEmail({
    to: invoiceData.parentEmail,
    subject,
    html,
    text,
    attachment: invoicePdf,
    filename: `invoice-${invoiceData.orderId}.pdf`,
  });
}
