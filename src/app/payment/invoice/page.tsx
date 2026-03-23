// src/app/payment/invoice/page.tsx

import { Suspense } from "react";
import PaymentInvoiceClient from "@/components/PaymentInvoiceClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-slate-600">Loading invoice...</div>
        </div>
      }
    >
      <PaymentInvoiceClient />
    </Suspense>
  );
}
