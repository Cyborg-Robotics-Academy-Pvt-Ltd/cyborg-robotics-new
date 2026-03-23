import nodemailer from "nodemailer";

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  attachment?: Buffer;
  filename?: string;
}

/**
 * Send email with optional PDF attachment using Brevo SMTP
 */
export async function sendInvoiceEmail(options: EmailOptions): Promise<boolean> {
  try {
    const smtpUser = process.env.BREVO_SMTP_USER;
    const smtpPass = process.env.BREVO_SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      console.error("Missing BREVO_SMTP_USER or BREVO_SMTP_PASS environment variables");
      return false;
    }

    // Create transporter using Brevo SMTP
    const transporter = nodemailer.createTransport({
      host: "smtp-relay.brevo.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtpUser, // Your Brevo SMTP login
        pass: smtpPass, // Your Brevo SMTP password
      },
    });

    // Prepare email options
    const mailOptions: any = {
      from: '"Cyborg Robotics Academy" <noreply@cyborgrobotics.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    // Add attachment if provided
    if (options.attachment) {
      mailOptions.attachments = [
        {
          filename: options.filename || "invoice.pdf",
          content: options.attachment,
          contentType: "application/pdf",
        },
      ];
    }

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Invoice email sent to ${options.to}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending invoice email:", error);
    return false;
  }
}

/**
 * Send payment confirmation email with invoice
 */
export async function sendPaymentConfirmation(
  studentEmail: string,
  studentName: string,
  courseName: string,
  amount: number,
  orderId: string,
  invoicePdf?: Buffer
): Promise<boolean> {
  const subject = `Payment Confirmation - ${courseName}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1e40af; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .footer { background: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px; margin-top: 15px; }
          .details { background: white; padding: 20px; margin: 20px 0; border-radius: 6px; border-left: 4px solid #1e40af; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>CYBORG ROBOTICS ACADEMY</h1>
            <p>Innovation in Education</p>
          </div>
          
          <div class="content">
            <h2>Dear ${studentName},</h2>
            
            <p>Your payment has been successfully processed!</p>
            
            <div class="details">
              <h3>Payment Details:</h3>
              <p><strong>Course:</strong> ${courseName}</p>
              <p><strong>Amount Paid:</strong> ₹${amount.toLocaleString("en-IN")}</p>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Status:</strong> ✅ Confirmed</p>
            </div>
            
            <p>Your invoice is attached with this email for your records. You can also download it anytime from your dashboard.</p>
            
            <p style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/payment/status?orderId=${orderId}" class="button">View Payment Status</a>
            </p>
            
            <p>Thank you for choosing Cyborg Robotics Academy! We're excited to have you on board.</p>
            
            <p>Best regards,<br/>
            <strong>The Cyborg Robotics Team</strong></p>
          </div>
          
          <div class="footer">
            <p>Cyborg Robotics Academy Pvt Ltd | CIN: U80100PN2024PTC123456</p>
            <p>Kalyani Nagar & Viman Nagar, Pune, Maharashtra | 📞 +91 7028511161</p>
            <p>📧 info@cyborgrobotics.com | 🌐 www.cyborgrobotics.com</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Dear ${studentName},

Your payment has been successfully processed!

Payment Details:
- Course: ${courseName}
- Amount Paid: ₹${amount.toLocaleString("en-IN")}
- Order ID: ${orderId}
- Status: Confirmed ✓

Your invoice is attached with this email.

Thank you for choosing Cyborg Robotics Academy!

Best regards,
The Cyborg Robotics Team
  `;

  return await sendInvoiceEmail({
    to: studentEmail,
    subject,
    html,
    text,
    attachment: invoicePdf,
    filename: `invoice-${orderId}.pdf`,
  });
}
