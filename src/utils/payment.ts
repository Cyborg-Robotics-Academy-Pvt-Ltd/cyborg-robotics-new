import { getFirestore, collection, addDoc, updateDoc, doc, getDocs, query, where } from "firebase/firestore";
import { app } from "@/lib/firebase";

const db = getFirestore(app);

export interface PaymentRecord {
  id?: string;
  orderId: string;
  amount: number;
  currency: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  paymentMethod?: string;
  transactionReference?: string;
  studentName?: string;
  studentEmail?: string;
  studentPhone?: string;
  courseKey?: string;
  courseName?: string;
  prn?: string;
  createdAt: Date;
  updatedAt?: Date;
  metadata?: Record<string, unknown>;
}

/**
 * Create a new payment record in Firestore
 */
export async function createPaymentRecord(payment: Omit<PaymentRecord, "id">): Promise<string> {
  try {
    const paymentsRef = collection(db, "payments");
    const docRef = await addDoc(paymentsRef, {
      ...payment,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Failed to create payment record:", error);
    throw new Error("Could not create payment record");
  }
}

/**
 * Update payment status and details
 */
export async function updatePaymentStatus(
  orderId: string,
  updates: Partial<PaymentRecord>
): Promise<void> {
  try {
    const paymentsRef = collection(db, "payments");
    const q = query(paymentsRef, where("orderId", "==", orderId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      throw new Error(`Payment record not found for order: ${orderId}`);
    }

    const docRef = doc(db, "payments", snapshot.docs[0].id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to update payment status:", error);
    throw new Error("Could not update payment status");
  }
}

/**
 * Get payment record by order ID
 */
export async function getPaymentByOrderId(orderId: string): Promise<PaymentRecord | null> {
  try {
    const paymentsRef = collection(db, "payments");
    const q = query(paymentsRef, where("orderId", "==", orderId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const data = snapshot.docs[0].data();
    return {
      id: snapshot.docs[0].id,
      ...data,
      createdAt: (data.createdAt as any)?.toDate?.() || new Date(),
      updatedAt: (data.updatedAt as any)?.toDate?.() || new Date(),
    } as PaymentRecord;
  } catch (error) {
    console.error("Failed to fetch payment record:", error);
    return null;
  }
}

/**
 * Verify payment with bank API (for status check)
 */
export async function verifyPaymentStatus(
  orderId: string,
  referenceId?: string
): Promise<{ verified: boolean; status?: string; message?: string }> {
  const bankApiUrl = process.env.BANK_API_URL;
  const apiKey = process.env.BANK_API_KEY;

  if (!bankApiUrl) {
    return {
      verified: false,
      message: "Bank API not configured",
    };
  }

  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    
    if (apiKey) {
      headers[process.env.BANK_API_KEY_HEADER || "x-api-key"] = apiKey;
    }

    // Call bank's payment status endpoint
    const response = await fetch(`${bankApiUrl}/status/${referenceId || orderId}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      return {
        verified: false,
        message: `Bank API returned status ${response.status}`,
      };
    }

    const data = await response.json();
    return {
      verified: true,
      status: data.status,
      message: data.message,
    };
  } catch (error) {
    console.error("Payment verification failed:", error);
    return {
      verified: false,
      message: "Verification service unavailable",
    };
  }
}
