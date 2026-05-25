"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  XCircle,
  Clock,
  RefreshCw,
  Home,
  ReceiptText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { readOrderId } from "@/lib/order-id-storage";
import {
  isFailedPaymentStatus,
  isSuccessfulPaymentStatus,
  isTerminalPaymentStatus,
  normalizePaymentStatus,
} from "@/lib/payment-status";

const FAILURE_SETTLE_DELAY_MS = 5000;
const PAYMENT_STATUS_POLL_INTERVAL_MS = 2500;

interface PaymentData {
  orderId?: string;
  amount?: number;
  status?: string;
  transactionReference?: string;
  studentName?: string;
  courseName?: string;
}

const getFailureMessage = (reason?: string | null) => {
  switch ((reason || "").trim().toLowerCase()) {
    case "session_binding_mismatch":
      return "We could not verify this payment session. Please start the payment again.";
    case "stored_amount_invalid":
    case "gateway_amount_missing":
    case "amount_mismatch":
      return "Payment verification failed. No successful payment has been confirmed for this order.";
    default:
      return "No successful payment has been confirmed for this order. You can try again or contact us if money was deducted.";
  }
};

export default function PaymentStatusClient() {
  const router = useRouter();
  const params = useSearchParams();
  const [orderId, setOrderId] = useState("");
  const [orderIdResolved, setOrderIdResolved] = useState(false);

  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [canShowFailure, setCanShowFailure] = useState(false);
  const syncInFlightRef = useRef(false);

  useEffect(() => {
    const fromQuery = params.get("order_id") || params.get("orderId") || "";
    setOrderId(fromQuery || readOrderId());
    setOrderIdResolved(true);
  }, [params]);

  useEffect(() => {
    setCanShowFailure(false);

    if (!orderId) return;

    const timeout = window.setTimeout(() => {
      setCanShowFailure(true);
    }, FAILURE_SETTLE_DELAY_MS);

    return () => window.clearTimeout(timeout);
  }, [orderId]);

  useEffect(() => {
    const statusFromQuery = params.get("status");
    const verifyFromQuery = params.get("verify");
    const isFailureRedirect =
      verifyFromQuery === "true" && !isSuccessfulPaymentStatus(statusFromQuery);

    if (
      orderId &&
      (isTerminalPaymentStatus(statusFromQuery) || isFailureRedirect)
    ) {
      setPaymentData({
        orderId,
        status: isFailureRedirect
          ? "FAILED"
          : normalizePaymentStatus(statusFromQuery),
      });
      return;
    }

    setPaymentData(null);
  }, [orderId, params]);

  const fetchCurrentStatus = async () => {
    if (!orderId) return;

    try {
      const res = await fetch(`/api/payment/status?order_id=${orderId}`);
      const data = await res.json();

      if (data.success) {
        const payment = data.payment as PaymentData;
        setPaymentData((current) =>
          isFailedPaymentStatus(current?.status) &&
          !isTerminalPaymentStatus(payment?.status)
            ? current
            : payment,
        );
        return payment;
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }

    return null;
  };

  const syncPaymentStatus = async () => {
    if (!orderId || syncInFlightRef.current) return false;

    syncInFlightRef.current = true;
    try {
      const res = await fetch("/api/payment/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (data.success) {
        const payment = data.payment as PaymentData;
        setPaymentData((current) =>
          isFailedPaymentStatus(current?.status) &&
          !isTerminalPaymentStatus(payment?.status)
            ? current
            : payment,
        );
        return isTerminalPaymentStatus(payment?.status);
      }
    } catch (err) {
      console.error("Payment sync error:", err);
    } finally {
      syncInFlightRef.current = false;
    }

    return false;
  };

  useEffect(() => {
    if (!orderIdResolved) return;

    if (!orderId) {
      return;
    }

    const bootstrap = async () => {
      const currentPayment = await fetchCurrentStatus();

      if (isSuccessfulPaymentStatus(currentPayment?.status)) {
        router.replace(`/registration-success?orderId=${encodeURIComponent(orderId)}`);
        return;
      }

      await syncPaymentStatus();
    };

    bootstrap();

    const interval = setInterval(async () => {
      await syncPaymentStatus();
    }, PAYMENT_STATUS_POLL_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [orderId, orderIdResolved, router]);

  useEffect(() => {
    if (!orderId || !isSuccessfulPaymentStatus(paymentData?.status)) return;

    router.replace(`/registration-success?orderId=${encodeURIComponent(orderId)}`);
  }, [orderId, paymentData?.status, router]);

  const currentStatus = normalizePaymentStatus(paymentData?.status);
  const amountLabel =
    paymentData?.amount !== undefined && paymentData?.amount !== null
      ? `₹${paymentData.amount.toLocaleString("en-IN")}`
      : "Waiting for gateway confirmation";

  const isSuccess = isSuccessfulPaymentStatus(currentStatus);
  const isFailed = isFailedPaymentStatus(currentStatus);
  const shouldShowFailed = isFailed && canShowFailure;
  const failureMessage = getFailureMessage(params.get("reason"));

  if (!orderIdResolved) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading payment status...
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff8f8] via-white to-[#f8ebeb] px-4">
        <div className="max-w-sm rounded-2xl border border-[#8D0F11]/10 bg-white/95 px-6 py-5 text-center text-slate-900 shadow-2xl shadow-[#8D0F11]/10 backdrop-blur">
          <Clock className="mx-auto mb-3 h-10 w-10 text-[#8D0F11]" />
          <h1 className="text-xl font-semibold">Missing order ID</h1>
          <p className="mt-2 text-sm text-slate-600">
            We could not verify this payment because the order reference is missing.
          </p>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff8f8] via-white to-[#f8ebeb] px-4">
        <div className="max-w-sm text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-[#8D0F11]" />
          <h1 className="text-xl font-semibold text-slate-900">
            Opening your confirmation
          </h1>
        </div>
      </div>
    );
  }

  if (!shouldShowFailed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff8f8] via-white to-[#f8ebeb] px-4">
        <div className="w-full max-w-sm rounded-2xl border border-[#8D0F11]/10 bg-white/95 px-6 py-7 text-center shadow-2xl shadow-[#8D0F11]/10">
          <RefreshCw className="mx-auto mb-4 h-9 w-9 animate-spin text-[#8D0F11]" />
          <h1 className="text-xl font-semibold text-slate-900">
            Confirming payment
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Please wait while we confirm your payment securely.
          </p>
          <p className="mt-4 break-all font-mono text-xs text-slate-500">
            {orderId}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff8f8] via-white to-[#f8ebeb] px-4">
      <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white/95 px-6 py-7 text-center shadow-2xl shadow-[#8D0F11]/10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-slate-900">
          Payment failed
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {failureMessage}
        </p>

        <div className="mt-5 space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-left">
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">Order ID</p>
            <p className="mt-1 break-all font-mono text-xs text-slate-900">
              {orderId}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Amount</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {amountLabel}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">Status</p>
              <p className="mt-1 text-sm font-semibold text-red-600">
                {currentStatus}
              </p>
            </div>
          </div>
          {paymentData?.transactionReference ? (
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">
                Transaction Reference
              </p>
              <p className="mt-1 break-all font-mono text-xs text-slate-900">
                {paymentData.transactionReference}
              </p>
            </div>
          ) : null}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link href="/registration/new">
            <Button className="h-11 w-full rounded-full bg-[#8D0F11] text-white hover:bg-[#761012]">
              Try again
            </Button>
          </Link>
          <Link href="/contact-us">
            <Button
              variant="outline"
              className="h-11 w-full rounded-full border-[#8D0F11]/20 text-[#8D0F11] hover:bg-[#fff3f3]"
            >
              <ReceiptText className="mr-2 h-4 w-4" />
              Contact support
            </Button>
          </Link>
        </div>

        <Link
          href="/"
          className="mt-4 inline-flex items-center text-sm font-medium text-slate-500 hover:text-[#8D0F11]"
        >
          <Home className="mr-2 h-4 w-4" />
          Back to home
        </Link>
      </div>
    </div>
  );
}
