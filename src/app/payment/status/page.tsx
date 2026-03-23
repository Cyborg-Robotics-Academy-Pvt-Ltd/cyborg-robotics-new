// src/app/payment/status/page.tsx

import { Suspense } from "react";
import PaymentStatusClient from "@/components/PaymentStatusClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-slate-600">Loading payment status...</div>
        </div>
      }
    >
      <PaymentStatusClient />
    </Suspense>
  );
}
