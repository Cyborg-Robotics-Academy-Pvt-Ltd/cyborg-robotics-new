"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Home,
  ArrowRight,
  ShieldCheck,
  ReceiptText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { readOrderId } from "@/lib/order-id-storage";
import {
  isFailedPaymentStatus,
  isSuccessfulPaymentStatus,
  isTerminalPaymentStatus,
} from "@/lib/payment-status";

interface PaymentData {
  orderId?: string;
  amount?: number;
  status?: string;
  transactionReference?: string;
  studentName?: string;
  courseName?: string;
}

export default function PaymentStatusClient() {
  const params = useSearchParams();
  const [orderId, setOrderId] = useState("");
  const [orderIdResolved, setOrderIdResolved] = useState(false);
  const isVerifyMode = params.get("verify") === "true";
  const brandGradient = "from-[#8D0F11] via-[#a63534] to-[#b92423]";
  const brandAccent = "text-[#8D0F11]";

  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const syncInFlightRef = useRef(false);

  useEffect(() => {
    const fromQuery = params.get("order_id") || params.get("orderId") || "";
    setOrderId(fromQuery || readOrderId());
    setOrderIdResolved(true);
  }, [params]);

  useEffect(() => {
    setRefreshCount(0);
    setPaymentData(null);
    setLoading(true);
  }, [orderId]);

  const fetchCurrentStatus = async () => {
    if (!orderId) return;

    try {
      const res = await fetch(`/api/payment/status?order_id=${orderId}`);
      const data = await res.json();

      if (data.success) {
        setPaymentData(data.payment);
        return data.payment as PaymentData;
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
        setPaymentData(data.payment);
        return isTerminalPaymentStatus(data.payment?.status);
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
      setLoading(false);
      return;
    }

    let cancelled = false;

    const bootstrap = async () => {
      await fetchCurrentStatus();
      if (!cancelled) {
        setLoading(false);
      }
    };

    bootstrap();

    const interval = setInterval(async () => {
      setRefreshCount((count) => count + 1);
      const terminal = await syncPaymentStatus();
      if (terminal) {
        clearInterval(interval);
      }
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [orderId, orderIdResolved]);

  const handleVerifyPayment = async () => {
    if (!orderId) return;

    setVerifying(true);
    try {
      await syncPaymentStatus();
    } finally {
      setVerifying(false);
    }
  };

  const currentStatus = paymentData?.status || "PENDING";
  const amountLabel =
    paymentData?.amount !== undefined && paymentData?.amount !== null
      ? `₹${paymentData.amount.toLocaleString("en-IN")}`
      : "Waiting for gateway confirmation";

  const getIcon = () => {
    if (isSuccessfulPaymentStatus(currentStatus))
      return <CheckCircle className="w-16 h-16 text-white drop-shadow-sm" />;
    if (isFailedPaymentStatus(currentStatus))
      return <XCircle className="w-16 h-16 text-white drop-shadow-sm" />;
    return <Clock className="w-16 h-16 text-white drop-shadow-sm" />;
  };

  const getText = () => {
    if (isSuccessfulPaymentStatus(currentStatus)) {
      return {
        title: "Payment confirmed",
        color: "text-[#8D0F11]",
        panel: brandGradient,
      };
    }
    if (isFailedPaymentStatus(currentStatus)) {
      return {
        title: "Payment not confirmed",
        color: "text-[#8D0F11]",
        panel: brandGradient,
      };
    }
    return {
      title: isVerifyMode ? "Verifying payment" : "Payment pending",
      color: "text-[#8D0F11]",
      panel: brandGradient,
    };
  };

  const statusInfo = getText();

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

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-gradient-to-br from-[#fff8f8] via-white to-[#f8ebeb] px-3 py-3 text-slate-900 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-6rem] h-72 w-72 rounded-full bg-[#8D0F11]/15 blur-3xl" />
        <div className="absolute right-[-7rem] top-24 h-80 w-80 rounded-full bg-[#a63534]/15 blur-3xl" />
        <div className="absolute bottom-[-9rem] left-1/3 h-96 w-96 rounded-full bg-[#b92423]/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex h-full w-full max-w-2xl items-center justify-center">
        <Card className="w-full max-h-[calc(100dvh-1.5rem)] overflow-y-auto border border-[#8D0F11]/10 bg-white/95 text-slate-900 shadow-[0_24px_80px_rgba(141,15,17,0.16)] backdrop-blur-xl sm:max-h-[calc(100dvh-2rem)]">
          <div className={`h-2 w-full bg-gradient-to-r ${statusInfo.panel}`} />
          <CardHeader className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-[#8D0F11] via-[#a63534] to-[#b92423] shadow-lg shadow-[#8D0F11]/20 sm:h-20 sm:w-20">
                {getIcon()}
              </div>
              <div className="space-y-2">
                <CardTitle className={`text-xl sm:text-3xl ${statusInfo.color}`}>
                  {statusInfo.title}
                </CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-4 pt-0 sm:p-6 sm:pt-0">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#8D0F11]/10 bg-[#fff8f8] p-3 sm:p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#8D0F11]/70">
                  Order ID
                </p>
                <p className="mt-2 break-all font-mono text-xs font-semibold text-slate-900 sm:text-sm">
                  {orderId}
                </p>
              </div>
              <div className="rounded-2xl border border-[#8D0F11]/10 bg-[#fff8f8] p-3 sm:p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#8D0F11]/70">
                  Amount
                </p>
                <p className="mt-2 text-base font-semibold text-slate-900 sm:text-lg">
                  {amountLabel}
                </p>
              </div>
              <div className="rounded-2xl border border-[#8D0F11]/10 bg-[#fff8f8] p-3 sm:p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-[#8D0F11]/70">
                  Status
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ShieldCheck className={`h-4 w-4 ${brandAccent}`} />
                  {currentStatus}
                </p>
              </div>
            </div>

            {paymentData?.transactionReference ? (
              <div className="rounded-2xl border border-[#8D0F11]/10 bg-white p-3 sm:p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                  <ReceiptText className={`h-4 w-4 ${brandAccent}`} />
                  Transaction Reference
                </div>
                <p className="mt-2 break-all font-mono text-xs text-slate-900 sm:text-sm">
                  {paymentData.transactionReference}
                </p>
              </div>
            ) : null}

            {loading ? (
              <div className="flex items-center justify-center rounded-2xl border border-[#8D0F11]/10 bg-[#fff8f8] py-5">
                <RefreshCw className={`h-5 w-5 animate-spin ${brandAccent}`} />
                <span className="ml-3 text-sm text-slate-600">
                  Checking the latest payment status...
                </span>
              </div>
            ) : (
              <>
                {(!paymentData?.status || paymentData.status === "PENDING") && (
                  <Button
                    onClick={handleVerifyPayment}
                    disabled={verifying}
                    className="h-11 w-full rounded-full bg-gradient-to-r from-[#8D0F11] via-[#a63534] to-[#b92423] text-white shadow-lg shadow-[#8D0F11]/20 hover:opacity-95 sm:h-12"
                  >
                    {verifying ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Verifying payment...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Verify payment now
                      </>
                    )}
                  </Button>
                )}

                {paymentData?.status === "PENDING" && (
                  <p className="text-center text-[11px] text-slate-500">
                    Auto-refreshing every 5 seconds
                    {refreshCount > 0 ? ` | checked ${refreshCount} times` : ""}
                  </p>
                )}

                <div className="grid gap-3 sm:grid-cols-3">
                  <Link href="/registration/new" className="sm:col-span-1">
                    <Button variant="outline" className="h-11 w-full rounded-full border-[#8D0F11]/20 text-[#8D0F11] hover:bg-[#fff3f3] sm:h-12">
                      <Home className="mr-2 h-4 w-4" />
                      Home
                    </Button>
                  </Link>

                  {isSuccessfulPaymentStatus(paymentData?.status) ? (
                    <>
                      <Link
                        href={`/registration-success?orderId=${orderId}`}
                        className="sm:col-span-1"
                      >
                        <Button className="h-11 w-full rounded-full bg-gradient-to-r from-[#8D0F11] via-[#a63534] to-[#b92423] text-white shadow-lg shadow-[#8D0F11]/20 hover:opacity-95 sm:h-12">
                          Open Success Page
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                      <Link
                        href={`/payment/invoice?orderId=${orderId}`}
                        className="sm:col-span-1"
                      >
                        <Button
                          variant="outline"
                          className="h-11 w-full rounded-full border-[#8D0F11]/20 text-[#8D0F11] hover:bg-[#fff3f3] sm:h-12"
                        >
                          <ReceiptText className="mr-2 h-4 w-4" />
                          Invoice
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <div className="sm:col-span-2 rounded-2xl border border-dashed border-[#8D0F11]/20 bg-white p-3 text-sm text-slate-600">
                      Once the gateway confirms the payment, the success page and receipt links will appear here.
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
