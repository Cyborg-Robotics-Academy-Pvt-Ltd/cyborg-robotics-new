import puppeteer from "puppeteer";
import { InvoiceData, renderInvoiceHtml } from "@/lib/invoice-template";

export type { InvoiceData } from "@/lib/invoice-template";
export { renderInvoiceHtml } from "@/lib/invoice-template";

let puppeteerModule: typeof puppeteer | null = null;

async function loadPuppeteer() {
  if (puppeteerModule) return puppeteerModule;
  puppeteerModule = puppeteer;
  return puppeteerModule;
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  if (!data.invoiceNumber || !data.amount) {
    throw new Error("Invalid invoice data");
  }

  const html = renderInvoiceHtml(data);
  const browser = await (await loadPuppeteer()).launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    await page.emulateMediaType("screen");
    await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 100)));

    const buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    });

    return Buffer.from(buffer);
  } finally {
    await browser.close();
  }
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
