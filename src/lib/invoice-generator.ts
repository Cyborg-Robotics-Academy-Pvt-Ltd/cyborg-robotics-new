import path from "path";

// Singleton PDFKit loader
let PDFDocConstructor: any;

async function loadPDFKit() {
  if (PDFDocConstructor) return PDFDocConstructor;
  const pdfkit = await import("pdfkit");
  PDFDocConstructor = pdfkit.default || pdfkit;
  return PDFDocConstructor;
}

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

export async function generateInvoicePDF(
  data: InvoiceData
): Promise<Buffer> {
  const PDFDoc = await loadPDFKit();

  if (!data.invoiceNumber || !data.amount) {
    throw new Error("Invalid invoice data");
  }

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDoc({ size: "A4", margin: 0 });

      const buffers: Buffer[] = [];
      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      // Layout
      const margin = 50;
      const pageWidth = doc.page.width;
      const pageHeight = doc.page.height;
      const contentWidth = pageWidth - margin * 2;

      // Brand Colors
      const primary = "#8B0000";
      const text = "#1a1a1a";
      const light = "#666";

      // Currency
 const formatCurrency = (val: number) =>
  `Rs. ${val.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
      // Safe logo loading
      try {
        const logoPath = path.join(
          process.cwd(),
          "public/assets/Cyborg-logo.png"
        );
        doc.image(logoPath, margin, margin, { width: 50 });
      } catch {
        doc.circle(margin + 25, margin + 25, 25).fill(primary);
      }

      // Company Name
      doc
        .fillColor(primary)
        .font("Helvetica-Bold")
        .fontSize(16)
        .text("CYBORG ROBOTICS", margin + 60, margin + 8);

      doc
        .fontSize(11)
        .fillColor(light)
        .text("ACADEMY PVT LTD", margin + 60, margin + 25);

      // Invoice Banner
      const bannerW = 160;
      const bannerX = pageWidth - margin - bannerW;

      doc.rect(bannerX, margin, bannerW, 40).fill(primary);
      

      doc
        .fillColor("#fff")
        .font("Helvetica-Bold")
        .fontSize(18)
        .text("INVOICE", bannerX, margin + 10, {
          width: bannerW,
          align: "center",
        });

      // Header Details
      let y = margin + 70;

      doc.fontSize(10).fillColor(text).font("Helvetica-Bold");
      doc.text("Invoice:", margin, y, { continued: true });
      doc.font("Helvetica").text(data.invoiceNumber);

      doc.font("Helvetica-Bold").text("Date:", margin, y + 15, {
        continued: true,
      });
      doc
        .font("Helvetica")
        .text(new Date(data.paymentDate).toLocaleDateString("en-GB"));

      // Status Badge
      const statusColor =
        data.status === "SUCCESS"
          ? "#16a34a"
          : data.status === "PENDING"
          ? "#f59e0b"
          : "#dc2626";

      doc.fillColor(statusColor).text(
        data.status,
        pageWidth - margin - 80,
        y
      );

      // Divider
      y += 40;
      doc.moveTo(margin, y).lineTo(pageWidth - margin, y).stroke(primary);

      // Addresses
      y += 20;

      const half = contentWidth / 2;

      // From
      doc.fillColor(primary).font("Helvetica-Bold").text("Bill From:", margin, y);

      doc
        .fillColor(text)
        .font("Helvetica")
        .text("Cyborg Robotics Academy Pvt Ltd", margin, y + 15)
        .text("Pune, Maharashtra", margin, y + 30)
        .text("+91 7028511161", margin, y + 45);

      // To
      const toX = margin + half;

      doc.fillColor(primary).font("Helvetica-Bold").text("Bill To:", toX, y);

      doc
        .fillColor(text)
        .font("Helvetica")
        .text(data.studentName, toX, y + 15)
        .text(data.parentEmail, toX, y + 30)
        .text(data.parentPhone, toX, y + 45);

      // Table
      y += 90;

      const colWidths = {
        item: contentWidth * 0.4,
        qty: contentWidth * 0.15,
        rate: contentWidth * 0.2,
        amount: contentWidth * 0.25,
      };

      let x = margin;

      // Header
      doc.rect(margin, y, contentWidth, 25).fill(primary);

      doc.fillColor("#fff").font("Helvetica-Bold");

      doc.text("Item", x + 5, y + 7);
      x += colWidths.item;

      doc.text("Qty", x, y + 7, { width: colWidths.qty, align: "center" });
      x += colWidths.qty;

      doc.text("Rate", x, y + 7, { width: colWidths.rate, align: "center" });
      x += colWidths.rate;

      doc.text("Amount", x, y + 7, {
        width: colWidths.amount,
        align: "right",
      });

      // Row
      y += 35;
      x = margin;

      doc.fillColor(text).font("Helvetica");

      doc.text(data.courseName, x, y, { width: colWidths.item });
      x += colWidths.item;

      doc.text("1", x, y, { width: colWidths.qty, align: "center" });
      x += colWidths.qty;

      doc.text(formatCurrency(data.amount), x, y, {
        width: colWidths.rate,
        align: "center",
      });
      x += colWidths.rate;

      doc.text(formatCurrency(data.amount), x, y, {
        width: colWidths.amount,
        align: "right",
      });

      y += 40;

      // Totals
      const rightX = pageWidth - margin - 200;

      doc.text("Subtotal:", rightX, y);
      doc.text(formatCurrency(data.amount), rightX + 100, y, {
        width: 100,
        align: "right",
      });

      y += 20;

      doc.text("Paid:", rightX, y);
      doc.text(formatCurrency(data.amount), rightX + 100, y, {
        width: 100,
        align: "right",
      });

      // Total Box
      y += 30;

      const boxW = 220;
      const boxX = pageWidth - margin - boxW;

      doc.rect(boxX, y, boxW, 45).fill(primary);
      

      doc.fillColor("#fff").font("Helvetica-Bold");

      doc.text("TOTAL", boxX + 15, y + 15);
      doc.text(formatCurrency(data.amount), boxX, y + 15, {
        width: boxW - 15,
        align: "right",
      });

      // Watermark
      if (data.status === "SUCCESS") {
        doc.opacity(0.08);
        doc
          .fontSize(80)
          .fillColor("#16a34a")
          .rotate(-45, { origin: [300, 400] })
          .text("PAID", 150, 300);
        doc.opacity(1);
      }

      // Footer
      const footerY = pageHeight - 20;

      doc
        .fillColor(primary)
        .fontSize(12)
        .text("Thank you for choosing Cyborg Robotics!", margin, footerY, {
          align: "center",
          width: contentWidth,
        });

      doc
        .fillColor(light)
        .fontSize(9)
        .text(
          "www.cyborgrobotics.com",
          margin,
          footerY + 20,
          { align: "center", width: contentWidth }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export function generateInvoiceNumber(): string {
  const now = new Date();

  const datePart = now
    .toISOString()
    .slice(2, 10)
    .replace(/-/g, ""); // YYMMDD

  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `INV-CRA-${datePart}-${random}`;
}