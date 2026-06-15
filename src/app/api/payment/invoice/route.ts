import { NextResponse } from "next/server";
import {
  generateInvoicePDF,
  generateInvoiceNumber,
  renderInvoiceHtml,
  InvoiceData,
} from "@/lib/invoice-generator";
import { db } from "@/lib/firebase";
import { isValidOrderId } from "@/lib/order-id-utils";
import {
  PAYMENT_SESSION_COOKIE_NAME,
  getCookieValue,
  verifyPaymentSessionCookieValue,
} from "@/lib/payment-session-binding";
import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { sendPaymentConfirmation } from "@/lib/email-service";

export const runtime = "nodejs";

function getInvoiceStudentName(paymentData: Record<string, any>): string {
  return (
    paymentData?.competitionRegistrationDraft?.fullName ||
    paymentData?.workshopRegistrationDraft?.childName ||
    paymentData?.registrationDraft?.studentName ||
    paymentData.studentName ||
    "N/A"
  );
}

function getInvoiceEmail(paymentData: Record<string, any>): string {
  return (
    paymentData?.competitionRegistrationDraft?.emailAddress ||
    paymentData?.workshopRegistrationDraft?.email ||
    paymentData?.registrationDraft?.primaryParentEmail ||
    paymentData.parentEmail ||
    ""
  );
}

function getInvoicePhone(paymentData: Record<string, any>): string {
  return (
    paymentData?.competitionRegistrationDraft?.parentGuardianContactNumber ||
    paymentData?.workshopRegistrationDraft?.contactNumber ||
    paymentData?.registrationDraft?.primaryParentContact ||
    paymentData.parentPhone ||
    ""
  );
}

function getInvoiceCourseName(paymentData: Record<string, any>): string {
  return (
    paymentData?.competition?.name ||
    paymentData?.workshop?.name ||
    paymentData?.course?.name ||
    paymentData.courseName ||
    "Course Registration"
  );
}

function verifyPaymentOwnership(
  req: Request,
  orderId: string | null | undefined,
  paymentData: Record<string, any>
): { ok: boolean; reason?: string } {
  const cookieValue = getCookieValue(
    req.headers.get("cookie"),
    PAYMENT_SESSION_COOKIE_NAME
  );
  const sessionCheck = verifyPaymentSessionCookieValue(cookieValue);

  if (!sessionCheck.ok) {
    return { ok: false, reason: sessionCheck.reason };
  }

  if (sessionCheck.payload.orderId !== orderId) {
    return { ok: false, reason: "Payment session order mismatch" };
  }

  if (!paymentData.sessionBindingKey) {
    return { ok: false, reason: "Payment session binding missing" };
  }

  if (sessionCheck.payload.sessionBindingKey !== paymentData.sessionBindingKey) {
    return { ok: false, reason: "Payment session binding mismatch" };
  }

  return { ok: true };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const inline = searchParams.get("inline") === "true";
    const email = searchParams.get("email") === "true";
    const mode = searchParams.get("mode") || "pdf";

    // Validate orderId format before touching Firestore
    if (!isValidOrderId(orderId)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing order ID" },
        { status: 400 }
      );
    }

    // --- Fetch payment record ---
    const paymentsRef = collection(db, "payments");
    const q = query(paymentsRef, where("orderId", "==", orderId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    const paymentDoc = snapshot.docs[0];
    const payment = paymentDoc.data();
    const ownershipCheck = verifyPaymentOwnership(req, orderId, payment);

    if (!ownershipCheck.ok) {
      return NextResponse.json(
        {
          success: false,
          message: ownershipCheck.reason || "Payment session validation failed",
        },
        { status: 403 }
      );
    }

    // --- Gate on payment status - only SUCCESS gets an invoice ---
    if (payment.status !== "SUCCESS" && payment.status !== "CHARGED") {
      return NextResponse.json(
        {
          success: false,
          message: "Invoice is only available for successful payments",
        },
        { status: 403 }
      );
    }

    // --- Idempotency - reuse existing invoice if already generated ---
    const invoicesRef = collection(db, "invoices");
    const existingInvoiceQuery = query(
      invoicesRef,
      where("orderId", "==", orderId)
    );
    const existingInvoiceSnapshot = await getDocs(existingInvoiceQuery);

    let invoiceNumber: string;
    let shouldSendEmail = false;

    if (!existingInvoiceSnapshot.empty) {
      // Invoice already exists - reuse the same number, don't re-email unless requested
      invoiceNumber = existingInvoiceSnapshot.docs[0].data().invoiceNumber;
    } else {
      // First time generating this invoice
      invoiceNumber = generateInvoiceNumber();
      shouldSendEmail = true;
    }

    // --- Prepare invoice data from Firestore only - no client input ---
    const invoiceData: InvoiceData = {
      invoiceNumber,
      orderId: payment.orderId || orderId!,
      transactionId: payment.transactionReference || "",
      studentName: getInvoiceStudentName(payment),
      parentEmail: getInvoiceEmail(payment),
      parentPhone: getInvoicePhone(payment),
      courseName: getInvoiceCourseName(payment),
      amount: payment.amount || 0,
      currency: payment.currency || "INR",
      status: payment.status,
      paymentDate:
        payment.createdAt && typeof payment.createdAt.toDate === "function"
          ? payment.createdAt.toDate().toISOString()
          : new Date().toISOString(),
      customerId: payment.customerId || "",
    };

    // --- Generate PDF ---
    const invoiceHtml = renderInvoiceHtml(invoiceData);

    const shouldGeneratePdf = mode === "pdf" || email;

    let pdfBuffer: Buffer | undefined;
    if (shouldGeneratePdf) {
      try {
        pdfBuffer = await generateInvoicePDF(invoiceData);
      } catch (pdfError) {
        console.error("PDF generation error:", pdfError);
        return NextResponse.json(
          {
            success: false,
            message: "PDF generation temporarily unavailable. Please contact support for your invoice.",
            details: "Server-side PDF rendering failed",
          },
          { status: 500 }
        );
      }
    }

    // --- Send email on first generation or when explicitly requested ---
    const shouldEmailNow = shouldGeneratePdf && (shouldSendEmail || email) && invoiceData.parentEmail;
    if (shouldEmailNow) {
      try {
        await sendPaymentConfirmation(invoiceData, pdfBuffer);
      } catch (emailError) {
        console.error("Failed to send invoice email:", emailError);
      }
    }

    // --- Save invoice record only on first generation ---
    if (shouldSendEmail) {
      const invoiceRef = doc(db, "invoices", invoiceNumber);
      await setDoc(invoiceRef, {
        invoiceNumber,
        orderId: invoiceData.orderId,
        customerId: invoiceData.customerId,
        studentName: invoiceData.studentName,
        amount: invoiceData.amount,
        createdAt: serverTimestamp(),
        pdfGenerated: true,
        emailSent: !!invoiceData.parentEmail,
      });
    }

    // --- Store invoice number on payment record for easy lookup ---
    if (payment.invoiceNumber !== invoiceNumber) {
      await updateDoc(doc(db, "payments", paymentDoc.id), {
        invoiceNumber,
        invoiceGeneratedAt: serverTimestamp(),
      });
    }

    // --- Return HTML preview when mode=html ---
    if (mode === "html") {
      return new NextResponse(invoiceHtml, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-store",
        },
        status: 200,
      });
    }

    // --- Return JSON metadata instead of PDF when mode=json ---
    if (mode === "json") {
      return NextResponse.json(
        { success: true, invoiceNumber, emailed: !!shouldEmailNow },
        { status: 200 }
      );
    }

    // --- Serve PDF ---
    return new NextResponse(Buffer.from(pdfBuffer || new Uint8Array()), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename=invoice-${invoiceNumber}.pdf`,
        "Content-Security-Policy": "default-src 'none'",
        "X-Content-Type-Options": "nosniff",
      },
      status: 200,
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to generate invoice. Please try again.",
      },
      { status: 500 }
    );
  }
}




