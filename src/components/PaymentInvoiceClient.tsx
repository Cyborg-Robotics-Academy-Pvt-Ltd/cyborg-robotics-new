"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle, Info } from "lucide-react";
import { useEffect, useState } from "react";

export default function PaymentInvoiceClient() {
  const params = useSearchParams();
  const orderId = params.get("orderId") || params.get("order_id") || "";

  const [isDevelopment, setIsDevelopment] = useState(false);

  useEffect(() => {
    setIsDevelopment(process.env.NODE_ENV === "development");
  }, []);

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold">Invoice Not Available</h1>
          <p className="mt-2 text-gray-600">Missing order ID.</p>
          <Link href="/payment/status" className="inline-block mt-6">
            <Button variant="outline">Back</Button>
          </Link>
        </div>
      </div>
    );
  }

  const downloadUrl = `/api/payment/invoice?orderId=${orderId}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Payment Successful</h1>
        </div>

        {/* Order Card */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <p>
            <b>Order ID:</b> {orderId}
          </p>
          <p className="text-green-600 font-semibold">SUCCESS</p>
        </div>

        {/* Dev Notice */}
        {isDevelopment && (
          <div className="bg-amber-50 border p-4 rounded mb-6">
            <div className="flex gap-2">
              <Info className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-700">
                PDF may not render locally. Works in production.
              </p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <a href={downloadUrl} target="_blank">
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Download Invoice
            </Button>
          </a>

          <Link href="/payment/status">
            <Button variant="outline">Back</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
