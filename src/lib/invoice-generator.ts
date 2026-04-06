import PDFDocument from "pdfkit";
import { InvoiceData, renderInvoiceHtml } from "@/lib/invoice-template";

export type { InvoiceData } from "@/lib/invoice-template";
export { renderInvoiceHtml } from "@/lib/invoice-template";

const PAGE = {
  width: 595.28,
  height: 841.89,
  margin: 36,
};

const COLORS = {
  brand: "#8B0000",
  brandSoft: "#FDECEC",
  accent: "#C73E1D",
  text: "#111827",
  muted: "#6B7280",
  line: "#E5E7EB",
  bg: "#F8FAFC",
  success: "#16A34A",
  successSoft: "#DCFCE7",
  pending: "#D97706",
  pendingSoft: "#FEF3C7",
  danger: "#DC2626",
  dangerSoft: "#FEE2E2",
};

function formatMoney(amount: number, currency: string): string {
  const formatted = amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return currency && currency !== "INR" ? `${currency} ${formatted}` : `Rs. ${formatted}`;
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

function drawMetaCard(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string,
  color?: string
) {
  doc
    .roundedRect(x, y, width, 54, 8)
    .fillAndStroke(COLORS.bg, COLORS.line);

  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(9)
    .text(label.toUpperCase(), x + 12, y + 10, { width: width - 24 });

  doc
    .fillColor(color || COLORS.text)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(value, x + 12, y + 26, { width: width - 24 });
}

function drawLabeledLines(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  title: string,
  lines: string[]
) {
  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(9)
    .text(title.toUpperCase(), x, y, { width });

  let cursorY = y + 16;

  lines.forEach((line, index) => {
    doc
      .fillColor(index === 0 ? COLORS.text : COLORS.muted)
      .font(index === 0 ? "Helvetica-Bold" : "Helvetica")
      .fontSize(index === 0 ? 12 : 10.5)
      .text(line, x, cursorY, { width });

    cursorY += index === 0 ? 17 : 14;
  });
}

function drawTable(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  width: number,
  courseName: string,
  rate: string
) {
  const columns = {
    item: width * 0.46,
    qty: width * 0.14,
    rate: width * 0.2,
    amount: width * 0.2,
  };

  doc
    .roundedRect(x, y, width, 30, 6)
    .fill(COLORS.brand);

  doc
    .fillColor("#FFFFFF")
    .font("Helvetica-Bold")
    .fontSize(9);

  doc.text("ITEM", x + 12, y + 10, { width: columns.item - 24 });
  doc.text("QTY", x + columns.item, y + 10, {
    width: columns.qty - 12,
    align: "right",
  });
  doc.text("RATE", x + columns.item + columns.qty, y + 10, {
    width: columns.rate - 12,
    align: "right",
  });
  doc.text("AMOUNT", x + columns.item + columns.qty + columns.rate, y + 10, {
    width: columns.amount - 12,
    align: "right",
  });

  const rowY = y + 36;

  doc
    .roundedRect(x, rowY, width, 44, 6)
    .fillAndStroke("#FFFFFF", COLORS.line);

  doc
    .fillColor(COLORS.text)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(courseName, x + 12, rowY + 14, { width: columns.item - 24 });

  doc
    .fillColor(COLORS.muted)
    .font("Helvetica")
    .fontSize(10.5);

  doc.text("1", x + columns.item, rowY + 14, {
    width: columns.qty - 12,
    align: "right",
  });
  doc.text(rate, x + columns.item + columns.qty, rowY + 14, {
    width: columns.rate - 12,
    align: "right",
  });
  doc.text(rate, x + columns.item + columns.qty + columns.rate, rowY + 14, {
    width: columns.amount - 12,
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
        Author: "Cyborg Robotics Academy Pvt Ltd",
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
    const headerHeight = 92;
    const headerY = PAGE.margin;
    const bodyStartY = headerY + headerHeight + 18;
    const label = paymentLabel(data.status);
    const statusPalette = paymentColors(data.status);
    const amountText = formatMoney(data.amount, data.currency);

    doc
      .roundedRect(PAGE.margin, headerY, contentWidth, headerHeight, 12)
      .fill(COLORS.brand);

    doc
      .fillColor("#FFFFFF")
      .font("Helvetica-Bold")
      .fontSize(16)
      .text("CYBORG ROBOTICS ACADEMY PVT LTD", PAGE.margin + 18, headerY + 18, {
        width: contentWidth * 0.58,
      });

    doc
      .fillColor("#FEE2E2")
      .font("Helvetica")
      .fontSize(10.5)
      .text(
        "Pune, Maharashtra | info@cyborgrobotics.com | +91 7028511161",
        PAGE.margin + 18,
        headerY + 42,
        { width: contentWidth * 0.58 }
      );

    doc
      .fillColor("#FECACA")
      .font("Helvetica")
      .fontSize(9)
      .text("INVOICE", PAGE.margin + contentWidth - 180, headerY + 18, {
        width: 160,
        align: "right",
      });

    doc
      .fillColor("#FFFFFF")
      .font("Courier-Bold")
      .fontSize(18)
      .text(data.invoiceNumber, PAGE.margin + contentWidth - 180, headerY + 34, {
        width: 160,
        align: "right",
      });

    doc
      .fillColor("#FEE2E2")
      .font("Courier")
      .fontSize(10)
      .text(`Order: ${data.orderId}`, PAGE.margin + contentWidth - 180, headerY + 58, {
        width: 160,
        align: "right",
      });

    const metaY = bodyStartY;
    const metaGap = 10;
    const metaWidth = (contentWidth - metaGap * 3) / 4;

    drawMetaCard(doc, PAGE.margin, metaY, metaWidth, "Payment Date", formatDate(data.paymentDate));
    drawMetaCard(
      doc,
      PAGE.margin + metaWidth + metaGap,
      metaY,
      metaWidth,
      "Transaction ID",
      safeText(data.transactionId)
    );
    drawMetaCard(
      doc,
      PAGE.margin + (metaWidth + metaGap) * 2,
      metaY,
      metaWidth,
      "Customer ID",
      safeText(data.customerId)
    );
    drawMetaCard(
      doc,
      PAGE.margin + (metaWidth + metaGap) * 3,
      metaY,
      metaWidth,
      "Status",
      label,
      statusPalette.text
    );

    const billingY = metaY + 78;
    const columnGap = 26;
    const columnWidth = (contentWidth - columnGap) / 2;

    drawLabeledLines(doc, PAGE.margin, billingY, columnWidth, "From", [
      "Cyborg Robotics Academy Pvt Ltd",
      "Pune, Maharashtra",
      "+91 7028511161",
      "info@cyborgrobotics.com",
    ]);

    const recipientLines = [
      safeText(data.studentName),
      safeText(data.parentEmail),
      safeText(data.parentPhone),
      ...(data.gstNumber ? [`GST: ${safeText(data.gstNumber)}`] : []),
    ];

    drawLabeledLines(
      doc,
      PAGE.margin + columnWidth + columnGap,
      billingY,
      columnWidth,
      "To",
      recipientLines
    );

    const dividerY = billingY + 78;
    doc
      .moveTo(PAGE.margin, dividerY)
      .lineTo(PAGE.margin + contentWidth, dividerY)
      .lineWidth(1)
      .strokeColor(COLORS.line)
      .stroke();

    const tableY = dividerY + 18;
    drawTable(doc, PAGE.margin, tableY, contentWidth, safeText(data.courseName), amountText);

    const totalsWidth = 220;
    const totalsHeight = 104;
    const totalsY = tableY + 100;
    const totalsX = PAGE.margin + contentWidth - totalsWidth;

    doc
      .roundedRect(totalsX, totalsY, totalsWidth, totalsHeight, 10)
      .fill(COLORS.brand);

    const totalLines = [
      ["Subtotal", amountText],
      ["Tax", "Rs. 0.00"],
      ["Paid", label === "PAID" ? amountText : "Rs. 0.00"],
    ];

    let totalLineY = totalsY + 16;
    totalLines.forEach(([lineLabel, lineValue]) => {
      doc
        .fillColor("#FEE2E2")
        .font("Helvetica")
        .fontSize(10)
        .text(lineLabel, totalsX + 14, totalLineY, { width: 70 });

      doc.text(lineValue, totalsX + 88, totalLineY, {
        width: totalsWidth - 102,
        align: "right",
      });

      totalLineY += 20;
    });

    doc
      .moveTo(totalsX + 14, totalsY + 74)
      .lineTo(totalsX + totalsWidth - 14, totalsY + 74)
      .lineWidth(1)
      .strokeColor("#7F1D1D")
      .stroke();

    doc
      .fillColor("#FFFFFF")
      .font("Helvetica-Bold")
      .fontSize(12)
      .text("Total", totalsX + 14, totalsY + 82, { width: 70 });

    doc.text(amountText, totalsX + 88, totalsY + 82, {
      width: totalsWidth - 102,
      align: "right",
    });

    const footerY = totalsY + totalsHeight + 26;
    const badgeWidth = label === "PENDING" ? 78 : 64;

    doc
      .roundedRect(PAGE.margin, footerY, badgeWidth, 24, 12)
      .fill(statusPalette.bg);

    doc
      .fillColor(statusPalette.text)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(label, PAGE.margin, footerY + 7, {
        width: badgeWidth,
        align: "center",
      });

    doc
      .fillColor(COLORS.muted)
      .font("Helvetica")
      .fontSize(9.5)
      .text(
        "System-generated invoice | No signature required",
        PAGE.margin + 92,
        footerY + 7,
        { width: contentWidth - 92, align: "right" }
      );

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
