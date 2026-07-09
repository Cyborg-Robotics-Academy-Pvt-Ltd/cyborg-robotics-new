import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { INVOICE_BRAND, InvoiceData, renderInvoiceHtml } from "@/lib/invoice-template";

export type { InvoiceData } from "@/lib/invoice-template";
export { renderInvoiceHtml } from "@/lib/invoice-template";

const PAGE = {
  width: 595.28,
  margin: 34,
};

const COLORS = {
  brand: "#8B0000",
  brandDark: "#6D0E10",
  accent: "#C73E1D",
  text: "#111827",
  muted: "#6B7280",
  line: "#E5E7EB",
  bg: "#F9FAFB",
  panel: "#FFF7F7",
  white: "#FFFFFF",

  success: "#16A34A",
  successSoft: "#DCFCE7",

  pending: "#D97706",
  pendingSoft: "#FEF3C7",

  danger: "#DC2626",
  dangerSoft: "#FEE2E2",
};

const LOGO_PATH = path.join(process.cwd(), "public", "assets", "Cyborg-logo.png");

function formatMoney(amount: number, currency: string): string {
  const formatted = amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return currency && currency !== "INR" ? `${currency} ${formatted}` : ` Rs. ${formatted}`;
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

function paymentLabel(status: string): "PAID" | "PENDING" | "FAILED" {
  if (status === "SUCCESS" || status === "CHARGED") {
    return "PAID";
  }

  if (status === "PENDING") {
    return "PENDING";
  }

  return "FAILED";
}

function paymentColors(status: string) {
  const label = paymentLabel(status);

  if (label === "PAID") {
    return { text: COLORS.success, bg: COLORS.successSoft };
  }

  if (label === "PENDING") {
    return { text: COLORS.pending, bg: COLORS.pendingSoft };
  }

  return { text: COLORS.danger, bg: COLORS.dangerSoft };
}

function safeText(value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === "") {
    return "-";
  }

  return String(value);
}

function truncateMiddle(value: string, start = 15, end = 8): string {
  if (value.length <= start + end + 1) {
    return value;
  }

  return `${value.slice(0, start)}...${value.slice(-end)}`;
}

function drawRoundedPanel(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  stroke: string = fill
) {
  doc.roundedRect(x, y, width, height, 16).fillAndStroke(fill, stroke);
}

function drawHeader(doc: PDFKit.PDFDocument, data: InvoiceData, contentWidth: number): number {
  const x = PAGE.margin;
  const y = PAGE.margin;

  // Logo
  if (fs.existsSync(LOGO_PATH)) {
    doc.image(LOGO_PATH, x, y, { width: 50 });
  }

  // Company Info
  doc
    .font("Times-Bold")
    .fontSize(14)
    .fillColor(COLORS.text)
    .text(INVOICE_BRAND.name, x + 60, y);

  doc
    .font("Times-Roman")
    .fontSize(10)
    .fillColor(COLORS.muted)
    .text(
      `${INVOICE_BRAND.location}\n${INVOICE_BRAND.email}\n${INVOICE_BRAND.phone}`,
      x + 60,
      y + 18
    );

  // Right side
  const rightX = x + contentWidth - 200;

  doc
    .font("Times-Bold")
    .fontSize(20)
    .fillColor(COLORS.text)
    .text("INVOICE", rightX, y);

  doc
    .font("Times-Roman")
    .fontSize(10)
    .fillColor(COLORS.muted)
    .text(`Invoice: #${data.invoiceNumber}`, rightX, y + 28)
    .text(`Date: ${formatDate(data.paymentDate)}`, rightX, y + 44)
    .text(`Status: ${paymentLabel(data.status)}`, rightX, y + 60);

  return y + 90;
}

function drawTwoColumnSection(
  doc: PDFKit.PDFDocument,
  top: number,
  contentWidth: number,
  data: InvoiceData
): number {
  const x = PAGE.margin;
  const width = contentWidth;
  const colWidth = width / 2;
  const statusPalette = paymentColors(data.status);
  const leftX = x + 20;
  const rightX = x + colWidth + 20;
  const innerWidth = colWidth - 40;
  const lineGap = 4;

  const measureText = (
    text: string,
    font: string,
    size: number,
    availableWidth: number
  ) => {
    doc.font(font).fontSize(size);
    return doc.heightOfString(text, {
      width: availableWidth,
      lineGap,
    });
  };

  const billLines = [
    safeText(data.parentEmail),
    safeText(data.parentPhone),
    data.gstNumber ? `GSTIN: ${safeText(data.gstNumber)}` : "",
  ].filter(Boolean);

  const contextLines = [
    { label: "Customer ID", value: safeText(data.customerId) },
    { label: "Transaction ID", value: safeText(data.transactionId) },
    {
      label: "Payment Method",
      value: safeText(data.paymentMethod || "Secure online payment"),
    },
  ];

  let leftHeight =
    18 +
    measureText("BILL TO", "Times-Bold", 9, innerWidth) +
    8 +
    measureText(data.studentName, "Times-Bold", 13, innerWidth) +
    8;

  billLines.forEach((line) => {
    leftHeight += measureText(line, "Times-Roman", 10.5, innerWidth) + 4;
  });

  let rightHeight =
    18 +
    measureText("TRANSACTION CONTEXT", "Times-Bold", 9, innerWidth) +
    8 +
    measureText("Course Registration Payment", "Times-Bold", 13, innerWidth) +
    10;

  contextLines.forEach((item) => {
    rightHeight += measureText(item.label, "Times-Bold", 8.2, innerWidth) + 2;
    rightHeight += measureText(item.value, "Times-Roman", 10.5, innerWidth) + 8;
  });

  const badgeHeight = 18;
  const height = Math.max(132, leftHeight + 22, rightHeight + badgeHeight + 28);

  drawRoundedPanel(doc, x, top, width, height, COLORS.white, COLORS.line);
  doc
    .moveTo(x + colWidth, top + 16)
    .lineTo(x + colWidth, top + height - 16)
    .lineWidth(1)
    .strokeColor(COLORS.line)
    .stroke();

  doc
    .fillColor(COLORS.accent)
    .font("Times-Bold")
    .fontSize(9)
    .text("BILL TO", leftX, top + 18, { width: innerWidth });

  doc
    .fillColor(COLORS.text)
    .font("Times-Bold")
    .fontSize(13)
    .text(data.studentName, leftX, top + 34, { width: innerWidth, lineGap });

  let billY = doc.y + 8;
  billLines.forEach((line) => {
    doc
      .fillColor(COLORS.muted)
      .font("Times-Roman")
      .fontSize(10.5)
      .text(line, leftX, billY, { width: innerWidth, lineGap });

    billY = doc.y + 4;
  });

  doc
    .fillColor(COLORS.accent)
    .font("Times-Bold")
    .fontSize(9)
    .text("TRANSACTION CONTEXT", rightX, top + 18, { width: innerWidth });

  doc
    .fillColor(COLORS.text)
    .font("Times-Bold")
    .fontSize(13)
    .text("Course Registration Payment", rightX, top + 34, {
      width: innerWidth,
      lineGap,
    });

  let contextY = doc.y + 10;
  contextLines.forEach((item) => {
    doc
      .fillColor(COLORS.muted)
      .font("Times-Bold")
      .fontSize(8.2)
      .text(item.label.toUpperCase(), rightX, contextY, {
        width: innerWidth,
      });

    contextY = doc.y + 2;

    doc
      .fillColor(COLORS.text)
      .font("Times-Roman")
      .fontSize(10.5)
      .text(item.value, rightX, contextY, {
        width: innerWidth,
        lineGap,
      });

    contextY = doc.y + 8;
  });

  const badgeY = Math.min(top + height - 30, contextY + 2);
  drawRoundedPanel(
    doc,
    rightX,
    badgeY,
    76,
    18,
    statusPalette.bg,
    statusPalette.bg
  );

  doc
    .fillColor(statusPalette.text)
    .font("Times-Bold")
    .fontSize(8.5)
    .text(paymentLabel(data.status), rightX, badgeY + 5, {
      width: 76,
      align: "center",
    });

  return top + height + 18;
}

function drawTable(doc: PDFKit.PDFDocument, top: number, contentWidth: number, data: InvoiceData): number {
  const x = PAGE.margin;
  const width = contentWidth;

  const cols = [0.5, 0.1, 0.2, 0.2];
  const headers = ["Description", "Qty", "Price", "Total"];

  let cursorX = x;

  // Header
  headers.forEach((h, i) => {
    const colW = width * cols[i];

    doc
      .font("Times-Bold")
      .fontSize(10)
      .fillColor(COLORS.text)
      .text(h, cursorX, top, {
        width: colW,
        align: i === 0 ? "left" : "right",
      });

    cursorX += colW;
  });

  // Line
  doc.moveTo(x, top + 18).lineTo(x + width, top + 18).stroke(COLORS.line);

  // Row
  cursorX = x;
  const rowY = top + 28;

  const values = [
    data.courseName,
    "1",
    formatMoney(data.amount, data.currency),
    formatMoney(data.amount, data.currency),
  ];

  values.forEach((val, i) => {
    const colW = width * cols[i];

    doc
      .font("Times-Roman")
      .fontSize(10)
      .fillColor(COLORS.text)
      .text(val, cursorX, rowY, {
        width: colW,
        align: i === 0 ? "left" : "right",
      });

    cursorX += colW;
  });

  return rowY + 30;
}

function drawSummary(doc: PDFKit.PDFDocument, top: number, contentWidth: number, data: InvoiceData): number {
  const x = PAGE.margin;
  const rightX = x + contentWidth - 200;

  const amount = formatMoney(data.amount, data.currency);

  const lines = [
    ["Total", amount],
  ];

  let y = top;

  lines.forEach(([label, value], i) => {
    doc
      .font(i === 2 ? "Times-Bold" : "Times-Roman")
      .fontSize(11)
      .fillColor(COLORS.text)
      .text(label, rightX, y);

    doc.text(value, rightX, y, {
      width: 200,
      align: "right",
    });

    y += 20;
  });

  return y + 20;
}

function drawPaymentDetails(
  doc: PDFKit.PDFDocument,
  top: number,
  contentWidth: number,
  data: InvoiceData
): number {
  const x = PAGE.margin;
  const gap = 12;
  const cardWidth = (contentWidth - gap) / 2;
  const cardHeight = 60;

  doc
    .fillColor(COLORS.accent)
    .font("Times-Bold")
    .fontSize(9)
    .text("PAYMENT DETAILS", x, top, { width: contentWidth });

  const details = [
    {
      label: "Transaction Reference",
      value: truncateMiddle(safeText(data.transactionId)),
    },
    {
      label: "Order ID",
      value: truncateMiddle(safeText(data.orderId)),
    },
    {
      label: "Customer ID",
      value: truncateMiddle(safeText(data.customerId)),
    },
    {
      label: "Support",
      value: INVOICE_BRAND.email,
      extra: INVOICE_BRAND.phone,
    },
  ];

  details.forEach((detail, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const cardX = x + col * (cardWidth + gap);
    const cardY = top + 14 + row * (cardHeight + 10);

    drawRoundedPanel(doc, cardX, cardY, cardWidth, cardHeight, COLORS.bg, COLORS.line);

    doc
      .fillColor(COLORS.muted)
      .font("Times-Roman")
      .fontSize(8.5)
      .text(`${detail.label}:`, cardX + 12, cardY + 12, {
        width: cardWidth - 24,
        lineBreak: false,
      });

    doc
      .fillColor(COLORS.text)
      .font("Times-Bold")
      .fontSize(9.5)
      .text(detail.value, cardX + 12, cardY + 26, {
        width: cardWidth - 24,
        lineBreak: false,
        ellipsis: true,
      });

    if ("extra" in detail && detail.extra) {
      doc
        .fillColor(COLORS.muted)
        .font("Times-Roman")
        .fontSize(8.8)
        .text(detail.extra, cardX + 12, cardY + 40, {
          width: cardWidth - 24,
          lineBreak: false,
          ellipsis: true,
        });
    }
  });

  return top + 14 + cardHeight * 2 + 10 + 18;
}

function drawNotes(doc: PDFKit.PDFDocument, top: number, contentWidth: number): number {
  const x = PAGE.margin;

  drawRoundedPanel(doc, x, top, contentWidth, 84, COLORS.panel, COLORS.line);

  doc
    .fillColor(COLORS.accent)
    .font("Times-Bold")
    .fontSize(9)
    .text("NOTES / TERMS", x + 18, top + 16, { width: contentWidth - 36 });

  doc
    .fillColor(COLORS.muted)
    .font("Times-Roman")
    .fontSize(9.5)
    .text(
      "This is a computer-generated invoice issued against a payment captured through the academy's payment gateway. Please retain it for admission, support, and refund-related communication.",
      x + 18,
      top + 32,
      {
        width: contentWidth - 36,
        lineGap: 2,
      }
    );

  return top + 100;
}

function drawFooter(doc: PDFKit.PDFDocument, top: number, contentWidth: number, data: InvoiceData) {
  const x = PAGE.margin;
  const badge = paymentLabel(data.status);
  const palette = paymentColors(data.status);

  doc
    .moveTo(x, top)
    .lineTo(x + contentWidth, top)
    .lineWidth(1)
    .strokeColor(COLORS.line)
    .stroke();

  drawRoundedPanel(doc, x, top + 12, badge === "PENDING" ? 74 : 64, 18, palette.bg, palette.bg);

  doc
    .fillColor(palette.text)
    .font("Times-Bold")
    .fontSize(8.5)
    .text(badge, x, top + 17, {
      width: badge === "PENDING" ? 74 : 64,
      align: "center",
    });

  doc
    .fillColor(COLORS.muted)
    .font("Times-Roman")
    .fontSize(9)
    .text(
      "Computer-generated invoice. No physical signature or seal is required.",
      x + 84,
      top + 17,
      {
        width: 270,
      }
    );

  doc
    .fillColor(COLORS.text)
    .font("Times-Bold")
    .fontSize(9)
    .text(INVOICE_BRAND.name, x + contentWidth - 180, top + 17, {
      width: 180,
      align: "right",
    });
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  if (!data.invoiceNumber || data.amount === undefined || Number.isNaN(data.amount)) {
    throw new Error("Invalid invoice data");
  }

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: PAGE.margin,
      compress: true,
      info: {
        Title: `Invoice ${data.invoiceNumber}`,
        Author: INVOICE_BRAND.name,
        Subject: `Payment invoice for ${data.courseName}`,
      },
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const contentWidth = PAGE.width - PAGE.margin * 2;

    let cursorY = drawHeader(doc, data, contentWidth);
    cursorY = drawTwoColumnSection(doc, cursorY, contentWidth, data);
    cursorY = drawTable(doc, cursorY, contentWidth, data);
    cursorY = drawSummary(doc, cursorY, contentWidth, data);
    cursorY = drawPaymentDetails(doc, cursorY, contentWidth, data);
    cursorY = drawNotes(doc, cursorY, contentWidth);
    drawFooter(doc, cursorY, contentWidth, data);

    doc.end();
  });
}

export function generateInvoiceNumber(): string {
  const now = new Date();

  const datePart = now
    .toISOString()
    .slice(2, 10)
    .replace(/-/g, "");

  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `INV-CRA-${datePart}-${random}`;
}



