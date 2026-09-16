import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const BRAND_RED = "#a81b1e";
const BRAND_RED_DARK = "#7f1114";

/* -------------------------------------------------------------------------- */
/* SHARED HELPERS                                                             */
/* -------------------------------------------------------------------------- */

function formatDate(trialDate: string) {
  return new Date(trialDate).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function infoRow(label: string, value: string) {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f1f1f1;color:#8a8a8a;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.03em;width:40%;">
        ${label}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f1f1f1;color:#1a1a1a;font-size:15px;font-weight:600;">
        ${value}
      </td>
    </tr>`;
}

function emailShell(bodyHtml: string) {
  return `
  <!DOCTYPE html>
  <html>
    <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
              ${bodyHtml}
              <tr>
                <td style="padding:24px 32px;background:#fafafa;text-align:center;">
                  <p style="margin:0;font-size:12px;color:#a3a3a3;">
                    Cyborg Robotics Academy Pvt. Ltd. · Pune, Maharashtra
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

/* -------------------------------------------------------------------------- */
/* BOOKING CONFIRMATION EMAILS                                                */
/* -------------------------------------------------------------------------- */

interface TrialBookingEmailData {
  studentName: string;
  age: number;
  contactNumber: string;
  email: string;
  location: string;
  trialMode: "online" | "offline";
  locationName: string;
  trialDate: string;
  trialTime: string;
}

function parentEmailHtml(data: TrialBookingEmailData) {
  const { studentName, age, contactNumber, trialMode, locationName, trialDate, trialTime } = data;

  const modeChip =
    trialMode === "offline"
      ? `<span style="display:inline-block;background:#e8f7ee;color:#15803d;font-size:12px;font-weight:700;padding:4px 12px;border-radius:999px;">📍 OFFLINE</span>`
      : `<span style="display:inline-block;background:#e8f1fd;color:#1d4ed8;font-size:12px;font-weight:700;padding:4px 12px;border-radius:999px;">💻 ONLINE</span>`;

  return emailShell(`
    <tr>
      <td style="background:linear-gradient(135deg,${BRAND_RED_DARK},${BRAND_RED});padding:36px 32px;text-align:center;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.08em;color:rgba(255,255,255,0.75);text-transform:uppercase;">
          Cyborg Robotics Academy
        </p>
        <h1 style="margin:0;font-size:24px;font-weight:800;color:#ffffff;">
          🎉 Trial Class Confirmed
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 20px;font-size:15px;color:#444;line-height:1.6;">
          Hi there, thanks for registering <strong>${studentName}</strong> (age ${age}) for a free trial class. Here are the details:
        </p>

        <div style="margin-bottom:20px;">${modeChip}</div>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${infoRow("Center", locationName)}
          ${infoRow("Date", formatDate(trialDate))}
          ${infoRow("Time", `${trialTime} IST`)}
        </table>

        <div style="margin-top:24px;padding:16px 18px;background:#fff7f0;border-left:3px solid ${BRAND_RED};border-radius:8px;">
          <p style="margin:0;font-size:13px;color:#7a3b1e;line-height:1.5;">
            Our team will call you on <strong>${contactNumber}</strong> shortly before the session to confirm.
          </p>
        </div>
      </td>
    </tr>
  `);
}

function adminEmailHtml(data: TrialBookingEmailData) {
  const { studentName, age, contactNumber, email, location, trialMode, locationName, trialDate, trialTime } = data;

  return emailShell(`
    <tr>
      <td style="padding:24px 32px;background:${BRAND_RED_DARK};">
        <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.08em;color:rgba(255,255,255,0.7);text-transform:uppercase;">
          New Booking
        </p>
        <h1 style="margin:4px 0 0;font-size:20px;font-weight:800;color:#ffffff;">
          ${studentName} · ${trialMode.toUpperCase()}
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding:28px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${infoRow("Student", `${studentName} (Age ${age})`)}
          ${infoRow("Contact", contactNumber)}
          ${infoRow("Email", email)}
          ${infoRow("Location entered", location)}
          ${infoRow("Assigned center", locationName)}
          ${infoRow("Date / Time", `${formatDate(trialDate)}, ${trialTime}`)}
        </table>
      </td>
    </tr>
  `);
}

export async function sendTrialBookingEmails(data: TrialBookingEmailData) {
  const parentMail = transporter.sendMail({
    from: `"Cyborg Robotics Academy" <${process.env.EMAIL_USER}>`,
    to: data.email,
    subject: "Your Free Trial is Confirmed – Cyborg Robotics Academy",
    html: parentEmailHtml(data),
  });

  const adminMail = transporter.sendMail({
    from: `"Cyborg Robotics Website" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: `New Trial Booking – ${data.studentName} (${data.trialMode})`,
    html: adminEmailHtml(data),
  });

  const results = await Promise.allSettled([parentMail, adminMail]);
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`Trial email ${i === 0 ? "parent" : "admin"} failed:`, r.reason);
    }
  });
}

/* -------------------------------------------------------------------------- */
/* SAME-DAY REMINDER EMAIL                                                    */
/* -------------------------------------------------------------------------- */

interface TrialReminderEmailData {
  studentName: string;
  age: number;
  contactNumber: string;
  email: string;
  trialMode: "online" | "offline";
  locationName: string;
  trialDate: string;
  trialTime: string;
}

function reminderEmailHtml(data: TrialReminderEmailData) {
  const { studentName, trialMode, locationName, trialDate, trialTime } = data;

  const modeLine =
    trialMode === "offline"
      ? `at our center in <strong>${locationName}</strong>`
      : `<strong>online</strong> — we'll share the link/call shortly before`;

  return emailShell(`
    <tr>
      <td style="background:linear-gradient(135deg,${BRAND_RED_DARK},${BRAND_RED});padding:36px 32px;text-align:center;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:0.08em;color:rgba(255,255,255,0.75);text-transform:uppercase;">
          Cyborg Robotics Academy
        </p>
        <h1 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;">
          ⏰ Trial Class Today!
        </h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 20px;font-size:15px;color:#444;line-height:1.6;">
          Quick reminder — <strong>${studentName}</strong>'s free trial class is scheduled for today, ${modeLine}.
        </p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          ${infoRow("Date", formatDate(trialDate))}
          ${infoRow("Time", `${trialTime} IST`)}
        </table>
        <div style="margin-top:24px;padding:16px 18px;background:#fff7f0;border-left:3px solid ${BRAND_RED};border-radius:8px;">
          <p style="margin:0;font-size:13px;color:#7a3b1e;line-height:1.5;">
            See you soon! Reply to this email if you need to reschedule.
          </p>
        </div>
      </td>
    </tr>
  `);
}

export async function sendTrialReminderEmail(data: TrialReminderEmailData) {
  await transporter.sendMail({
    from: `"Cyborg Robotics Academy" <${process.env.EMAIL_USER}>`,
    to: data.email,
    subject: `Reminder: ${data.studentName}'s Free Trial is Today at ${data.trialTime}`,
    html: reminderEmailHtml(data),
  });
}

export async function sendTrialRescheduleEmails(data: TrialBookingEmailData) {
  const details = `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${infoRow("Center", data.locationName)}
      ${infoRow("New date", formatDate(data.trialDate))}
      ${infoRow("New time", `${data.trialTime} IST`)}
    </table>`;

  const parentMail = transporter.sendMail({
    from: `"Cyborg Robotics Academy" <${process.env.EMAIL_USER}>`,
    to: data.email,
    subject: "Your Free Trial Has Been Rescheduled – Cyborg Robotics Academy",
    html: emailShell(`
      <tr><td style="background:${BRAND_RED};padding:32px;text-align:center;"><h1 style="margin:0;color:#fff;font-size:24px;">Trial Class Rescheduled</h1></td></tr>
      <tr><td style="padding:32px;"><p style="margin:0 0 20px;font-size:15px;color:#444;line-height:1.6;">Hi, <strong>${data.studentName}</strong>'s free trial class has been rescheduled. Please note the new details below.</p>${details}</td></tr>
    `),
  });

  const adminMail = transporter.sendMail({
    from: `"Cyborg Robotics Website" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
    subject: `Trial Rescheduled – ${data.studentName}`,
    html: emailShell(`
      <tr><td style="background:${BRAND_RED_DARK};padding:28px;color:#fff;"><h1 style="margin:0;font-size:20px;">Trial Rescheduled</h1></td></tr>
      <tr><td style="padding:28px;">${infoRow("Student", data.studentName)}${infoRow("Contact", data.contactNumber)}${details}</td></tr>
    `),
  });

  await Promise.allSettled([parentMail, adminMail]);
}
