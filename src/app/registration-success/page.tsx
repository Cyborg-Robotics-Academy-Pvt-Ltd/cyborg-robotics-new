// src/app/registration-success/page.tsx

import { Suspense } from "react";
import RegistrationSuccessClient from "@/components/RegistrationSuccessClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-slate-600">Loading registration status...</div>
        </div>
      }
    >
      <RegistrationSuccessClient />
    </Suspense>
  );
}
