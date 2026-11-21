"use client";

import { useEffect, useState } from "react";

type CheckoutDetails = { keyId: string; orderId: string; razorpayOrderId: string; amount: number; currency: string; name: string; email: string; phone: string };
declare global { interface Window { Razorpay?: new (options: Record<string, unknown>) => { open: () => void }; } }

export default function RazorpayCheckoutPage() {
  const [orderId, setOrderId] = useState("");
  const [searchReady, setSearchReady] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setOrderId(new URLSearchParams(window.location.search).get("orderId") || "");
    setSearchReady(true);
  }, []);

  useEffect(() => {
    if (!searchReady) return;
    if (!orderId) { setError("Missing payment order."); setLoading(false); return; }
    let cancelled = false;
    const start = async () => {
      try {
        const response = await fetch(`/api/payment/razorpay/checkout?orderId=${encodeURIComponent(orderId)}`, { cache: "no-store" });
        const details = await response.json() as CheckoutDetails & { message?: string; alreadyPaid?: boolean };
        if (!response.ok) throw new Error(details.message || "Unable to load checkout.");
        if (details.alreadyPaid) { window.location.assign(`/registration-success?orderId=${encodeURIComponent(orderId)}`); return; }
        if (!window.Razorpay) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Unable to load Razorpay Checkout."));
            document.body.appendChild(script);
          });
        }
        if (cancelled || !window.Razorpay) return;
        const checkout = new window.Razorpay({
          key: details.keyId,
          order_id: details.razorpayOrderId,
          amount: details.amount,
          currency: details.currency,
          name: "Cyborg Robotics",
          description: details.name,
          prefill: { name: details.name, email: details.email, contact: details.phone },
          theme: { color: "#e11d48" },
          modal: { ondismiss: () => setError("Checkout closed. Your payment status will remain pending until the gateway confirms it.") },
          handler: async (paymentResponse: Record<string, string>) => {
            const verify = await fetch("/api/payment/razorpay/verify", {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId, ...paymentResponse }),
            });
            const result = await verify.json();
            if (verify.ok && result.success) window.location.assign(`/registration-success?orderId=${encodeURIComponent(orderId)}`);
            else setError(result.message || "Payment is awaiting verification. Refresh this page in a moment.");
          },
        });
        setLoading(false);
        checkout.open();
      } catch (checkoutError) {
        if (!cancelled) { setError(checkoutError instanceof Error ? checkoutError.message : "Unable to start payment."); setLoading(false); }
      }
    };
    void start();
    return () => { cancelled = true; };
  }, [orderId, searchReady]);

  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6"><div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm"><h1 className="text-xl font-semibold text-slate-900">Secure payment</h1><p className="mt-2 text-sm text-slate-600">{loading ? "Connecting  " : error || "Please proceed to complete your payment securely."}</p>{error && <><p role="alert" className="mt-4 text-sm text-red-700">{error}</p><button type="button" onClick={() => window.location.reload()} className="mt-5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white">Retry checkout</button></>}</div></main>;
}
