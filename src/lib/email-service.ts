import nodemailer from "nodemailer";
import { renderInvoiceHtml, type InvoiceData } from "@/lib/invoice-template";

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
    const smtpUser = process.env.BREVO_SMTP_USER;
    const smtpPass = process.env.BREVO_SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      console.error("Missing BREVO_SMTP_USER or BREVO_SMTP_PASS environment variables");
      return false;
    }

    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const mailOptions: any = {
      from: '"Cyborg Robotics Academy" <noreply@cyborgrobotics.com>',
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
  const html = renderInvoiceHtml(invoiceData);
  const text = `Payment confirmation for ${invoiceData.studentName}

Invoice: ${invoiceData.invoiceNumber}
Order ID: ${invoiceData.orderId}
Course: ${invoiceData.courseName}
Amount Paid: ${invoiceData.amount.toLocaleString("en-IN")}
Status: ${invoiceData.status}

Your invoice is attached with this email.
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
