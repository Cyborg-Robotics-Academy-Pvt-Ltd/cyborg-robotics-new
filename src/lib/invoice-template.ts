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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safe(value: string | number | undefined | null): string {
  if (!value) return "-";
  return escapeHtml(String(value));
}

function money(amount: number, currency: string): string {
  const formatted = amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return currency && currency !== "INR"
    ? `${currency} ${formatted}`
    : `&#8377; ${formatted}`;
}

function paidLabel(status: string): string {
  if (status === "SUCCESS" || status === "CHARGED") return "PAID";
  if (status === "PENDING") return "PENDING";
  return "FAILED";
}

function statusColor(status: string): { bg: string; text: string } {
  const s = paidLabel(status);
  if (s === "PAID")    return { bg: "rgba(22,163,74,0.1)",  text: "#16A34A" };
  if (s === "PENDING") return { bg: "rgba(217,119,6,0.1)",  text: "#D97706" };
  return                      { bg: "rgba(220,38,38,0.1)",  text: "#DC2626" };
}

export function renderInvoiceHtml(data: InvoiceData): string {
  const paid = data.status === "SUCCESS" || data.status === "CHARGED";
  const label = paidLabel(data.status);
  const color = statusColor(data.status);
  const formattedDate = new Date(data.paymentDate).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Invoice ${escapeHtml(data.invoiceNumber)}</title>

<style>
@page {
  size: A4;
  margin: 24px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --brand:   #8b0000;
  --brand-2: #a81b1e;
  --accent:  #c73e1d;
  --text:    #111827;
  --muted:   #6b7280;
  --line:    #e5e7eb;
  --bg:      #f8fafc;
  --card:    #ffffff;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  background: var(--bg);
  color: var(--text);
}

/* ── SHEET ── */
.sheet {
  width: 794px;
  margin: 0 auto;
  background: var(--card);
  border-radius: 12px;
  border: 0.5px solid var(--line);
  overflow: hidden;
}

@media print {
  body { background: #fff; }
  .sheet {
    width: 100%;
    margin: 0;
    border: none;
    border-radius: 0;
  }
}

/* ── HEADER ── */
.inv-header {
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 55%, var(--accent) 100%);
  color: #fff;
  padding: 20px 28px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.brand-name {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.brand-sub {
  font-size: 12px;
  color: rgba(255,255,255,0.45);
  margin-top: 4px;
}

.inv-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: rgba(255,255,255,0.55);
  text-align: right;
}

.inv-num {
  font-size: 22px;
  font-weight: 600;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  margin-top: 3px;
  text-align: right;
}

.inv-order {
  font-size: 12px;
  color: rgba(255,255,255,0.45);
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  margin-top: 3px;
  text-align: right;
}

/* ── BODY ── */
.inv-body {
  padding: 20px 28px 24px;
}

/* ── META ROW ── */
.meta-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  background: var(--bg);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 20px;
}

.meta-cell {
  padding: 10px 14px;
  border-right: 0.5px solid var(--line);
}

.meta-cell:last-child {
  border-right: none;
}

.meta-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--muted);
  margin-bottom: 5px;
}

.meta-val {
  font-size: 13px;
  font-weight: 500;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
  color: var(--text);
}

/* ── BILL FROM / TO ── */
.bill-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 20px;
}

.bill-title {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--muted);
  margin-bottom: 10px;
}

.bill-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 5px;
}

.bill-line {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 3px;
}

/* ── DIVIDER ── */
.divider {
  height: 0.5px;
  background: var(--line);
  margin-bottom: 20px;
}

/* ── ITEMS TABLE ── */
.tbl-head {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr;
  padding: 10px 12px;
  border-radius: 6px;
  background: var(--brand);
  margin-bottom: 4px;
}

.tbl-head span {
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tbl-row {
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr;
  padding: 14px 12px;
  border-bottom: 0.5px solid var(--line);
  align-items: center;
}

.tbl-row:last-child {
  border-bottom: none;
}

.tbl-item {
  font-size: 14px;
  font-weight: 500;
  color: var(--text);
}

.tbl-cell {
  font-size: 13px;
  color: var(--muted);
  text-align: right;
}

.tbl-head span:not(:first-child) {
  text-align: right;
}

/* ── TOTALS ── */
.totals-wrap {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 20px;
}

.totals-box {
  width: 280px;
  background: var(--brand);
  border-radius: 10px;
  padding: 14px 16px;
}

.t-line {
  display: flex;
  justify-content: space-between;
  padding: 7px 0;
  font-size: 13px;
  color: rgba(255,255,255,0.75);
  border-bottom: 0.5px solid rgba(255,255,255,0.15);
}

.t-line:last-child {
  border-bottom: none;
}

.t-total {
  display: flex;
  justify-content: space-between;
  padding: 12px 0 0;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  border-top: 0.5px solid rgba(255,255,255,0.25);
  margin-top: 4px;
}

/* ── FOOTER ── */
.inv-footer {
  margin-top: 8px;
  padding-top: 18px;
  border-top: 0.5px solid var(--line);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.paid-badge {
  display: inline-block;
  background: ${color.bg};
  color: ${color.text};
  font-size: 12px;
  font-weight: 600;
  padding: 5px 14px;
  border-radius: 100px;
  letter-spacing: 0.4px;
}

.footer-note {
  font-size: 11px;
  color: var(--muted);
}
</style>
</head>

<body>
<div class="sheet">

  <!-- HEADER -->
  <div class="inv-header">
    <div>
      <div class="brand-name">CYBORG ROBOTICS ACADEMY PVT LTD</div>
      <div class="brand-sub">Pune, Maharashtra &nbsp;&middot;&nbsp; info@cyborgrobotics.com &nbsp;&middot;&nbsp; +91 7028511161</div>
    </div>
    <div>
      <div class="inv-label">Invoice</div>
      <div class="inv-num">${escapeHtml(data.invoiceNumber)}</div>
      <div class="inv-order">Order: ${escapeHtml(data.orderId)}</div>
    </div>
  </div>

  <!-- BODY -->
  <div class="inv-body">

    <!-- META -->
    <div class="meta-row">
      <div class="meta-cell">
        <div class="meta-label">Payment Date</div>
        <div class="meta-val">${formattedDate}</div>
      </div>
      <div class="meta-cell">
        <div class="meta-label">Transaction ID</div>
        <div class="meta-val">${safe(data.transactionId)}</div>
      </div>
      <div class="meta-cell">
        <div class="meta-label">Customer ID</div>
        <div class="meta-val">${safe(data.customerId)}</div>
      </div>
      <div class="meta-cell">
        <div class="meta-label">Status</div>
        <div class="meta-val" style="color:${color.text}">${label}</div>
      </div>
    </div>

    <!-- BILL FROM / TO -->
    <div class="bill-row">
      <div>
        <div class="bill-title">From</div>
        <div class="bill-name">Cyborg Robotics Academy Pvt Ltd</div>
        <div class="bill-line">Pune, Maharashtra</div>
        <div class="bill-line">+91 7028511161</div>
        <div class="bill-line">info@cyborgrobotics.com</div>
      </div>
      <div>
        <div class="bill-title">To</div>
        <div class="bill-name">${escapeHtml(data.studentName)}</div>
        <div class="bill-line">${escapeHtml(data.parentEmail)}</div>
        <div class="bill-line">${escapeHtml(data.parentPhone)}</div>
        ${data.gstNumber ? `<div class="bill-line">GST: ${escapeHtml(data.gstNumber)}</div>` : ""}
      </div>
    </div>

    <div class="divider"></div>

    <!-- ITEMS TABLE -->
    <div style="margin-bottom:20px">
      <div class="tbl-head">
        <span>Item</span>
        <span>Qty</span>
        <span>Rate</span>
        <span>Amount</span>
      </div>
      <div class="tbl-row">
        <div class="tbl-item">${escapeHtml(data.courseName)}</div>
        <div class="tbl-cell">1</div>
        <div class="tbl-cell">${money(data.amount, data.currency)}</div>
        <div class="tbl-cell">${money(data.amount, data.currency)}</div>
      </div>
    </div>

    <!-- TOTALS -->
    <div class="totals-wrap">
      <div class="totals-box">
        <div class="t-line">
          <span>Subtotal</span>
          <span>${money(data.amount, data.currency)}</span>
        </div>
        <div class="t-line">
          <span>Tax</span>
          <span>&#8377; 0.00</span>
        </div>
        <div class="t-line">
          <span>Paid</span>
          <span>${paid ? money(data.amount, data.currency) : "&#8377; 0.00"}</span>
        </div>
        <div class="t-total">
          <span>Total</span>
          <span>${money(data.amount, data.currency)}</span>
        </div>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="inv-footer">
      <span class="paid-badge">${label === "PAID" ? "&#10003; " : ""}${label}</span>
      <span class="footer-note">System-generated invoice &middot; No signature required</span>
    </div>

  </div>
</div>
</body>
</html>`;
}
