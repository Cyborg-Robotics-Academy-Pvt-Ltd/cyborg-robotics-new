"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { readOrderId } from "@/lib/order-id-storage";

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

  const status = params.get("status");

  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    const fromQuery = params.get("order_id") || params.get("orderId") || "";
    setOrderId(fromQuery || readOrderId());
    setOrderIdResolved(true);
  }, [params]);

  // ✅ Fetch + polling
  useEffect(() => {
    if (!orderIdResolved) return;

    if (!orderId) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchPayment = async () => {
      try {
        const res = await fetch(`/api/payment/status?order_id=${orderId}`, {
          signal: controller.signal,
        });

        const data = await res.json();

        if (data.success) {
          setPaymentData(data.payment);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Fetch error:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();

    const interval = setInterval(async () => {
      setRefreshCount((p) => p + 1);

      try {
        const res = await fetch(`/api/payment/status?order_id=${orderId}`);
        const data = await res.json();

        if (data.success) {
          const s = data.payment.status;
          setPaymentData(data.payment);

          if (["SUCCESS", "FAILED", "DECLINED"].includes(s)) {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 5000);

    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, [orderId, orderIdResolved]);

  // ✅ Manual verify
  const handleVerifyPayment = async () => {
    if (!orderId) return;

    setVerifying(true);
    try {
      const res = await fetch("/api/payment/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();

      if (data.success) {
        setPaymentData(data.payment);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  // ✅ UI helpers
  const currentStatus = paymentData?.status || status;

  const getIcon = () => {
    if (["SUCCESS", "CHARGED"].includes(currentStatus || ""))
      return <CheckCircle className="w-16 h-16 text-green-500" />;
    if (["FAILED", "DECLINED"].includes(currentStatus || ""))
      return <XCircle className="w-16 h-16 text-red-500" />;
    return <Clock className="w-16 h-16 text-yellow-500" />;
  };

  const getText = () => {
    if (["SUCCESS", "CHARGED"].includes(currentStatus || "")) {
      return { title: "Payment Successful", color: "text-green-600" };
    }
    if (["FAILED", "DECLINED"].includes(currentStatus || "")) {
      return { title: "Payment Failed", color: "text-red-600" };
    }
    return { title: "Payment Pending", color: "text-yellow-600" };
  };

  const statusInfo = getText();

  // ❌ No orderId
  if (!orderIdResolved) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading payment status...
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Missing Order ID
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">{getIcon()}</div>
          <CardTitle className={statusInfo.color}>{statusInfo.title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <RefreshCw className="animate-spin mx-auto" />
          ) : (
            <>
              <div className="bg-gray-100 p-3 rounded text-sm">
                <p>
                  <b>Order:</b> {orderId}
                </p>
                {paymentData?.amount && <p>₹{paymentData.amount}</p>}
              </div>

              {/* Verify */}
              {(!paymentData?.status || paymentData.status === "PENDING") && (
                <Button
                  onClick={handleVerifyPayment}
                  disabled={verifying}
                  className="w-full"
                  variant="outline"
                >
                  {verifying ? "Verifying..." : "Verify"}
                </Button>
              )}

              {/* Auto refresh */}
              {paymentData?.status === "PENDING" && (
                <p className="text-xs text-center">
                  Auto-refreshing... ({refreshCount})
                </p>
              )}

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Link href="/registration/new">
                  <Button variant="outline" className="w-full">
                    <Home className="w-4 h-4 mr-1" />
                    Home
                  </Button>
                </Link>

                {["SUCCESS", "CHARGED"].includes(paymentData?.status || "") && (
                  <Link href={`/payment/invoice?orderId=${orderId}`}>
                    <Button className="w-full">Invoice</Button>
                  </Link>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
