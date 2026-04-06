export interface InvoiceData {
  invoiceNumber: string;
  orderId: string;
  transactionId?: string;
  studentName: string;
  parentEmail: string;
  parentPhone: string;
  courseName: string;
  amount: number;
  currency: string;
  status: string;
  paymentDate: string;
  customerId: string;
  paymentMethod?: string;
  gstNumber?: string;
}

export const INVOICE_BRAND = {
  name: "Cyborg Robotics Academy Pvt Ltd",
  location: "Pune, Maharashtra",
  email: "info@cyborgrobotics.com",
  phone: "+91 7028511161",
  logoPath: "/assets/Cyborg-logo.png",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safe(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return escapeHtml(String(value));
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function money(amount: number, currency: string): string {
  const formatted = amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return currency && currency !== "INR"
    ? `${escapeHtml(currency)} ${formatted}`
    : `&#8377;${formatted}`;
}

function truncateMiddle(value: string | number | undefined | null, start = 14, end = 10): string {
  const text = safe(value);

  if (text.length <= start + end + 1) {
    return text;
  }

  return `${text.slice(0, start)}...${text.slice(-end)}`;
}

function paidLabel(status: string): string {
  if (status === "SUCCESS" || status === "CHARGED") return "PAID";
  if (status === "PENDING") return "PENDING";
  return "FAILED";
}

function statusColor(status: string): { bg: string; text: string; border: string } {
  const label = paidLabel(status);

  if (label === "PAID") {
    return {
      bg: "rgba(22,163,74,0.12)",
      text: "#15803d",
      border: "rgba(22,163,74,0.24)",
    };
  }

  if (label === "PENDING") {
    return {
      bg: "rgba(217,119,6,0.12)",
      text: "#b45309",
      border: "rgba(217,119,6,0.24)",
    };
  }

  return {
    bg: "rgba(220,38,38,0.1)",
    text: "#b91c1c",
    border: "rgba(220,38,38,0.22)",
  };
}

export function renderInvoiceHtml(data: InvoiceData): string {
  const label = paidLabel(data.status);
  const status = statusColor(data.status);
  const formattedDate = formatDate(data.paymentDate);
  const amount = money(data.amount, data.currency);
  const paidAmount = label === "PAID" ? amount : "&#8377;0.00";
  const taxAmount = "&#8377;0.00";
  const dueDate = formattedDate;
  const paymentMethod = safe(data.paymentMethod || "Secure online payment");

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Invoice ${escapeHtml(data.invoiceNumber)}</title>
<style>
@page {
  size: A4;
  margin: 20px;
}

* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  background: #f5f7fb;
  color: #111827;
  padding: 20px 0;
}

:root {
  --brand: #8b0000;
  --brand-2: #a81b1e;
  --accent: #c73e1d;
  --text: #111827;
  --muted: #6b7280;
  --line: #e5e7eb;
  --bg: #f8fafc;
  --panel: #fff7f7;
  --card: #ffffff;
}

.sheet {
  width: min(860px, calc(100vw - 32px));
  margin: 0 auto;
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 22px;
  box-shadow: 0 22px 70px rgba(15, 23, 42, 0.08);
  overflow: hidden;
}

.shell {
  padding: 28px;
}

.header {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(260px, 0.85fr);
  gap: 24px;
  padding: 24px;
  border-radius: 20px;
  background:
    radial-gradient(circle at top left, rgba(255,255,255,0.22), transparent 34%),
    linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 55%, var(--accent) 100%);
  color: #ffffff;
}

.brand {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.logo-wrap {
  width: 68px;
  height: 68px;
  border-radius: 18px;
  background: rgba(255,255,255,0.96);
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.45);
}

.logo-wrap img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.brand-name {
  font-size: 19px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.01em;
}

.brand-sub {
  margin-top: 8px;
  font-size: 12.5px;
  line-height: 1.7;
  color: rgba(255,255,255,0.84);
}

.invoice-panel {
  justify-self: end;
  width: 100%;
  max-width: 300px;
  border-radius: 18px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.16);
  padding: 18px;
  backdrop-filter: blur(6px);
}

.invoice-kicker {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  color: rgba(255,255,255,0.72);
}

.invoice-id {
  margin-top: 8px;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.2;
  color: #fff7f7;
}

.invoice-meta {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.invoice-meta-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.66);
  margin-bottom: 4px;
}

.invoice-meta-value {
  font-size: 12.5px;
  font-weight: 600;
  color: #ffffff;
}

.section {
  margin-top: 24px;
}

.section-card {
  border: 1px solid var(--line);
  border-radius: 18px;
  background: #ffffff;
  overflow: hidden;
}

.grid-two {
  display: grid;
  grid-template-columns: 1fr 1fr;
}

.panel {
  padding: 22px 24px;
}

.panel + .panel {
  border-left: 1px solid var(--line);
}

.eyebrow {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--brand-2);
  margin-bottom: 10px;
}

.primary-line {
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
}

.detail-line {
  display: block;
  font-size: 13px;
  line-height: 1.65;
  color: var(--muted);
  overflow-wrap: anywhere;
  word-break: break-word;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 7px 12px;
  border-radius: 999px;
  border: 1px solid ${status.border};
  background: ${status.bg};
  color: ${status.text};
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.context-list {
  display: grid;
  gap: 10px;
}

.context-item {
  display: grid;
  gap: 2px;
}

.context-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted);
}

.context-value {
  font-size: 12.5px;
  line-height: 1.5;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.table-card {
  border: 1px solid var(--line);
  border-radius: 18px;
  overflow: hidden;
  background: #ffffff;
}

.table-head,
.table-row {
  display: grid;
  grid-template-columns: minmax(0, 3.8fr) 0.7fr 1.2fr 1fr 1.2fr;
  gap: 0;
}

.table-head {
  background: linear-gradient(135deg, rgba(139,0,0,0.96), rgba(167,27,30,0.96));
}

.table-head div {
  padding: 12px 16px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.11em;
  color: #fff;
}

.table-row {
  border-top: 1px solid var(--line);
  min-height: 58px;
}

.table-row div {
  padding: 14px 16px;
  font-size: 12.5px;
  color: var(--muted);
}

.table-row .desc {
  color: var(--text);
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.num,
.table-head .num {
  text-align: right;
}

.summary-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 20px;
  align-items: start;
}

.support-card {
  border: 1px solid var(--line);
  border-radius: 18px;
  background:
    linear-gradient(180deg, rgba(248,250,252,0.95), rgba(255,255,255,1));
  padding: 22px 24px;
}

.support-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

.support-copy {
  margin-top: 8px;
  font-size: 13px;
  line-height: 1.7;
  color: var(--muted);
}

.summary-card {
  justify-self: end;
  width: 100%;
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(139,0,0,0.98), rgba(99,12,13,0.98));
  color: #fff;
  padding: 20px 22px;
  box-shadow: 0 18px 40px rgba(139, 0, 0, 0.16);
}

.summary-title {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: rgba(255,255,255,0.68);
  margin-bottom: 12px;
}

.summary-line,
.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-line {
  padding: 9px 0;
  font-size: 13px;
  color: rgba(255,255,255,0.84);
  border-bottom: 1px solid rgba(255,255,255,0.14);
}

.summary-total {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid rgba(255,255,255,0.28);
  font-size: 19px;
  font-weight: 700;
}

.payment-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.payment-card {
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 16px 18px;
  background: var(--bg);
}

.payment-label {
  font-size: 11px;
  letter-spacing: 0.02em;
  color: var(--muted);
  margin-bottom: 7px;
  white-space: nowrap;
}

.payment-value {
  font-size: 12.5px;
  font-weight: 700;
  line-height: 1.45;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.notes {
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 20px 22px;
  background: var(--panel);
}

.notes-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--brand-2);
  margin-bottom: 8px;
}

.notes-copy {
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--muted);
}

.footer {
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid var(--line);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.footer-note {
  font-size: 12px;
  color: var(--muted);
}

.footer-signoff {
  font-size: 12px;
  font-weight: 700;
  color: var(--text);
}

@media print {
  body {
    background: #ffffff;
    padding: 0;
  }

  .sheet {
    width: 100%;
    border: none;
    border-radius: 0;
    box-shadow: none;
  }
}

@media (max-width: 820px) {
  .header,
  .grid-two,
  .summary-grid,
  .payment-grid {
    grid-template-columns: 1fr;
  }

  .invoice-panel,
  .summary-card {
    justify-self: stretch;
    max-width: none;
  }

  .panel + .panel {
    border-left: none;
    border-top: 1px solid var(--line);
  }

  .table-head,
  .table-row {
    grid-template-columns: minmax(0, 2.4fr) 0.7fr 1fr 0.9fr 1.1fr;
  }

  .footer {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
</head>
<body>
  <div class="sheet">
    <div class="shell">
      <section class="header">
        <div class="brand">
          <div class="logo-wrap">
            <img src="${INVOICE_BRAND.logoPath}" alt="Cyborg Robotics Academy logo" />
          </div>
          <div>
            <div class="brand-name">${escapeHtml(INVOICE_BRAND.name)}</div>
            <div class="brand-sub">
              ${escapeHtml(INVOICE_BRAND.location)}<br />
              ${escapeHtml(INVOICE_BRAND.email)}<br />
              ${escapeHtml(INVOICE_BRAND.phone)}
            </div>
          </div>
        </div>

        <div class="invoice-panel">
          <div class="invoice-kicker">Invoice</div>
          <div class="invoice-id">${escapeHtml(data.invoiceNumber)}</div>
          <div class="invoice-meta">
            <div>
              <div class="invoice-meta-label">Invoice Date</div>
              <div class="invoice-meta-value">${formattedDate}</div>
            </div>
            <div>
              <div class="invoice-meta-label">Due Date</div>
              <div class="invoice-meta-value">${dueDate}</div>
            </div>
            <div>
              <div class="invoice-meta-label">Order ID</div>
              <div class="invoice-meta-value">${escapeHtml(data.orderId)}</div>
            </div>
            <div>
              <div class="invoice-meta-label">Status</div>
              <div class="invoice-meta-value">${label}</div>
            </div>
          </div>
        </div>
      </section>

      <section class="section section-card grid-two">
        <div class="panel">
          <div class="eyebrow">Bill To</div>
          <div class="primary-line">${escapeHtml(data.studentName)}</div>
          <div class="detail-line">${escapeHtml(data.parentEmail)}</div>
          <div class="detail-line">${escapeHtml(data.parentPhone)}</div>
          ${data.gstNumber ? `<div class="detail-line">GSTIN: ${escapeHtml(data.gstNumber)}</div>` : ""}
        </div>

        <div class="panel">
          <div class="eyebrow">Transaction Context</div>
          <div class="primary-line">Course Registration Payment</div>
          <div class="context-list">
            <div class="context-item">
              <div class="context-label">Customer ID</div>
              <div class="context-value" title="${safe(data.customerId)}">${truncateMiddle(data.customerId)}</div>
            </div>
            <div class="context-item">
              <div class="context-label">Transaction ID</div>
              <div class="context-value" title="${safe(data.transactionId)}">${truncateMiddle(data.transactionId)}</div>
            </div>
            <div class="context-item">
              <div class="context-label">Payment Method</div>
              <div class="context-value" title="${paymentMethod}">${truncateMiddle(paymentMethod, 18, 0)}</div>
            </div>
          </div>
          <div class="chip-row">
            <span class="chip">${label}</span>
          </div>
        </div>
      </section>

      <section class="section table-card">
        <div class="table-head">
          <div>Item / Description</div>
          <div class="num">Qty</div>
          <div class="num">Unit Price</div>
          <div class="num">Tax</div>
          <div class="num">Total</div>
        </div>
        <div class="table-row">
          <div class="desc">${escapeHtml(data.courseName)}</div>
          <div class="num">1</div>
          <div class="num">${amount}</div>
          <div class="num">${taxAmount}</div>
          <div class="num">${amount}</div>
        </div>
      </section>

      <section class="section summary-grid">
        <div class="support-card">
          <div class="eyebrow">Invoice Summary</div>
          <div class="support-title">Payment received for course registration</div>
          <div class="support-copy">
            This invoice confirms the amount collected for the registered course. For any correction or support request, contact ${escapeHtml(INVOICE_BRAND.email)} with invoice number ${escapeHtml(data.invoiceNumber)}.
          </div>
        </div>

        <div class="summary-card">
          <div class="summary-title">Amount Summary</div>
          <div class="summary-line">
            <span>Subtotal</span>
            <span>${amount}</span>
          </div>
          <div class="summary-line">
            <span>Tax</span>
            <span>${taxAmount}</span>
          </div>
          <div class="summary-line">
            <span>Discount</span>
            <span>&#8377; 0.00</span>
          </div>
          <div class="summary-line">
            <span>Paid</span>
            <span>${paidAmount}</span>
          </div>
          <div class="summary-total">
            <span>Grand Total</span>
            <span>${amount}</span>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="eyebrow">Payment Details</div>
        <div class="payment-grid">
          <div class="payment-card">
            <div class="payment-label">Transaction Reference</div>
            <div class="payment-value" title="${safe(data.transactionId)}">${truncateMiddle(data.transactionId, 15, 8)}</div>
          </div>
          <div class="payment-card">
            <div class="payment-label">Order ID</div>
            <div class="payment-value" title="${escapeHtml(data.orderId)}">${truncateMiddle(data.orderId, 15, 8)}</div>
          </div>
          <div class="payment-card">
            <div class="payment-label">Customer ID</div>
            <div class="payment-value" title="${safe(data.customerId)}">${truncateMiddle(data.customerId, 15, 8)}</div>
          </div>
          <div class="payment-card">
            <div class="payment-label">Support</div>
            <div class="payment-value" title="${escapeHtml(INVOICE_BRAND.email)}">${escapeHtml(INVOICE_BRAND.email)}</div>
            <div class="detail-line">${escapeHtml(INVOICE_BRAND.phone)}</div>
          </div>
        </div>
      </section>

      <section class="section notes">
        <div class="notes-title">Notes / Terms</div>
        <div class="notes-copy">
          This is a computer-generated invoice issued against a successful payment captured through the academy's payment gateway. Tax and discount values are shown as recorded in the current registration flow. Please retain this invoice for admission, support, and refund-related communication.
        </div>
      </section>

      <footer class="footer">
        <div class="footer-note">Computer-generated invoice. No physical signature or seal is required.</div>
        <div class="footer-signoff">${escapeHtml(INVOICE_BRAND.name)}</div>
      </footer>
    </div>
  </div>
</body>
</html>`;
}
