"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { XCircle, Clock, RefreshCw, Home, ReceiptText } from "lucide-react";
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
const PAYMENT_STATUS_POLL_INTERVALS_MS = [3000, 5000, 10000, 20000, 30000];
const MAX_PAYMENT_STATUS_ATTEMPTS = 20;

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
  const [pollingExhausted, setPollingExhausted] = useState(false);
  const [pollGeneration, setPollGeneration] = useState(0);
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

  const syncPaymentStatus = async (signal: AbortSignal) => {
    if (!orderId || syncInFlightRef.current) return false;

    syncInFlightRef.current = true;
    try {
      const res = await fetch("/api/payment/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
        signal,
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
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        console.error("Payment sync error:", err);
      }
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

    let timeout: number | undefined;
    let attempts = 0;
    let stopped = false;
    let pendingDelay: number | undefined;
    const controller = new AbortController();

    const poll = async () => {
      if (stopped) return;
      if (document.visibilityState === "hidden") return;
      if (attempts >= MAX_PAYMENT_STATUS_ATTEMPTS) {
        setPollingExhausted(true);
        return;
      }

      attempts += 1;
      const terminal = await syncPaymentStatus(controller.signal);
      if (terminal || stopped) return;
      if (attempts >= MAX_PAYMENT_STATUS_ATTEMPTS) {
        setPollingExhausted(true);
        return;
      }

      const delay = PAYMENT_STATUS_POLL_INTERVALS_MS[
        Math.min(attempts - 1, PAYMENT_STATUS_POLL_INTERVALS_MS.length - 1)
      ];
      schedule(delay);
    };

    const schedule = (delay: number) => {
      pendingDelay = delay;
      if (stopped || document.visibilityState === "hidden") return;
      timeout = window.setTimeout(() => {
        timeout = undefined;
        pendingDelay = undefined;
        void poll();
      }, delay);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (timeout) window.clearTimeout(timeout);
        timeout = undefined;
        return;
      }

      if (pendingDelay !== undefined && timeout === undefined) {
        schedule(pendingDelay);
      }
    };

    setPollingExhausted(false);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    schedule(0);

    return () => {
      stopped = true;
      if (timeout) window.clearTimeout(timeout);
      controller.abort();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [orderId, orderIdResolved, pollGeneration]);

  useEffect(() => {
    if (!orderId || !isSuccessfulPaymentStatus(paymentData?.status)) return;

    router.replace(
      `/registration-success?orderId=${encodeURIComponent(orderId)}`,
    );
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
  const retryPaymentCheck = pollingExhausted ? (
    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-left" role="status">
      <p className="text-sm text-amber-900">
        Automatic checks have paused. If you completed payment, check again; please do not pay again for this order.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-3"
        onClick={() => setPollGeneration((generation) => generation + 1)}
      >
        Check again
      </Button>
    </div>
  ) : null;

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
            We could not verify this payment because the order reference is
            missing.
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

  if (currentStatus === "PENDING_VBV") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fff8f8] via-white to-[#f8ebeb] px-4">
        <div className="w-full max-w-sm rounded-2xl border border-amber-200 bg-white/95 px-6 py-7 text-center shadow-2xl shadow-[#8D0F11]/10">
          <Clock className="mx-auto mb-4 h-9 w-9 text-amber-600" />
          <h1 className="text-xl font-semibold text-slate-900">
            Bank verification pending
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Your bank has not completed secure payment verification yet. We are
            checking the status automatically. Your registration will be
            confirmed once the payment is successful; please do not pay again
            for this order.
          </p>
          {retryPaymentCheck}
          <p className="mt-4 break-all font-mono text-xs text-slate-500">
            {orderId}
          </p>
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
          {retryPaymentCheck}
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
        <p className="mt-2 text-sm text-slate-600">{failureMessage}</p>

        <div className="mt-5 space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-left">
          <div>
            <p className="text-xs font-medium uppercase text-slate-500">
              Order ID
            </p>
            <p className="mt-1 break-all font-mono text-xs text-slate-900">
              {orderId}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">
                Amount
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {amountLabel}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase text-slate-500">
                Status
              </p>
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
