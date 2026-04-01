"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { readOrderId } from "@/lib/order-id-storage";

export default function PaymentInvoiceClient() {
  const params = useSearchParams();
  const [orderId, setOrderId] = useState("");
  const [orderIdResolved, setOrderIdResolved] = useState(false);

  useEffect(() => {
    const fromQuery = params.get("orderId") || params.get("order_id") || "";
    setOrderId(fromQuery || readOrderId());
    setOrderIdResolved(true);
  }, [params]);

  if (!orderIdResolved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="text-slate-600">Loading invoice...</div>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold">Invoice Not Available</h1>
          <p className="mt-2 text-gray-600">Missing order ID.</p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/payment/status">Back</Link>
          </Button>
        </div>
      </div>
    );
  }

  const downloadUrl = `/api/payment/invoice?orderId=${orderId}`;
  const previewUrl = `/api/payment/invoice?orderId=${orderId}&mode=html`;

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Invoice Preview</h1>
            <p className="mt-1 text-sm text-slate-600">
              Shared preview for PDF, email, and admin views.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a href={downloadUrl} target="_blank" rel="noreferrer">
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            </a>

            <Button asChild variant="outline">
              <Link href={`/payment/status?orderId=${orderId}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Status
              </Link>
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <iframe
            src={previewUrl}
            title="Invoice preview"
            className="h-[calc(100vh-180px)] w-full bg-white"
          />
        </div>
      </div>
    </div>
  );
}
