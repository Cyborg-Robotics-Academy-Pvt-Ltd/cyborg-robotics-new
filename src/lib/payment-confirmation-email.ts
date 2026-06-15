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
import {
  generateInvoiceNumber,
  generateInvoicePDF,
  type InvoiceData,
} from "@/lib/invoice-generator";
import { sendPaymentConfirmation } from "@/lib/email-service";
import { db } from "@/lib/firebase";

type PaymentData = Record<string, any>;

function getTimestampIso(value: unknown): string {
  if (value && typeof (value as { toDate?: unknown }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  return new Date().toISOString();
}

function getInvoiceStudentName(payment: PaymentData): string {
  return (
    payment?.competitionRegistrationDraft?.fullName ||
    payment?.workshopRegistrationDraft?.childName ||
    payment?.registrationDraft?.studentName ||
    payment.studentName ||
    "N/A"
  );
}

function getInvoiceEmail(payment: PaymentData): string {
  return (
    payment?.competitionRegistrationDraft?.emailAddress ||
    payment?.workshopRegistrationDraft?.email ||
    payment?.registrationDraft?.primaryParentEmail ||
    payment.parentEmail ||
    payment.primaryParentEmail ||
    payment.studentEmail ||
    ""
  );
}

function getInvoicePhone(payment: PaymentData): string {
  return (
    payment?.competitionRegistrationDraft?.parentGuardianContactNumber ||
    payment?.workshopRegistrationDraft?.contactNumber ||
    payment?.registrationDraft?.primaryParentContact ||
    payment.parentPhone ||
    payment.primaryParentContact ||
    ""
  );
}

function getInvoiceCourseName(payment: PaymentData): string {
  return (
    payment?.competition?.name ||
    payment?.workshop?.name ||
    payment?.course?.name ||
    payment.courseName ||
    "Course Registration"
  );
}

function buildInvoiceData(
  payment: PaymentData,
  orderId: string,
  invoiceNumber: string
): InvoiceData {
  return {
    invoiceNumber,
    orderId: payment.orderId || orderId,
    transactionId: payment.transactionReference || "",
    studentName: getInvoiceStudentName(payment),
    parentEmail: getInvoiceEmail(payment),
    parentPhone: getInvoicePhone(payment),
    courseName: getInvoiceCourseName(payment),
    amount: payment.amount || 0,
    currency: payment.currency || "INR",
    status: payment.status || "SUCCESS",
    paymentDate: getTimestampIso(payment.updatedAt || payment.createdAt),
    customerId: payment.customerId || "",
  };
}

export async function sendPaymentConfirmationEmailForOrder(
  orderId: string,
  paymentDocId: string,
  payment: PaymentData
): Promise<boolean> {
  try {
    const recipientEmail = getInvoiceEmail(payment);

    if (!recipientEmail) {
      console.warn(`Skipping payment confirmation email for ${orderId}: no email found`);
      return false;
    }

    const invoicesRef = collection(db, "invoices");
    const existingInvoiceQuery = query(invoicesRef, where("orderId", "==", orderId));
    const existingInvoiceSnapshot = await getDocs(existingInvoiceQuery);

    let invoiceNumber = payment.invoiceNumber || generateInvoiceNumber();
    let invoiceDocId = invoiceNumber;
    let invoiceAlreadyEmailed = false;
    let isNewInvoice = true;

    if (!existingInvoiceSnapshot.empty) {
      const existingInvoiceDoc = existingInvoiceSnapshot.docs[0];
      const existingInvoice = existingInvoiceDoc.data();

      invoiceDocId = existingInvoiceDoc.id;
      invoiceNumber = existingInvoice.invoiceNumber || invoiceNumber;
      invoiceAlreadyEmailed = Boolean(existingInvoice.emailSent);
      isNewInvoice = false;
    }

    if (invoiceAlreadyEmailed) {
      return true;
    }

    const invoiceData = buildInvoiceData(payment, orderId, invoiceNumber);
    let pdfBuffer: Buffer | undefined;

    try {
      pdfBuffer = await generateInvoicePDF(invoiceData);
    } catch (pdfError) {
      console.error("Failed to generate invoice PDF for payment email:", pdfError);
    }

    const emailSent = await sendPaymentConfirmation(invoiceData, pdfBuffer);

    const invoicePayload = {
      invoiceNumber,
      orderId: invoiceData.orderId,
      customerId: invoiceData.customerId,
      studentName: invoiceData.studentName,
      amount: invoiceData.amount,
      pdfGenerated: Boolean(pdfBuffer),
      emailSent,
      emailSentAt: emailSent ? serverTimestamp() : null,
      updatedAt: serverTimestamp(),
    };

    if (isNewInvoice) {
      await setDoc(doc(db, "invoices", invoiceDocId), {
        ...invoicePayload,
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(doc(db, "invoices", invoiceDocId), invoicePayload);
    }

    await updateDoc(doc(db, "payments", paymentDocId), {
      invoiceNumber,
      invoiceGeneratedAt: serverTimestamp(),
      confirmationEmailSent: emailSent,
      confirmationEmailSentAt: emailSent ? serverTimestamp() : null,
    });

    return emailSent;
  } catch (error) {
    console.error("Failed to send payment confirmation email:", error);
    return false;
  }
}
