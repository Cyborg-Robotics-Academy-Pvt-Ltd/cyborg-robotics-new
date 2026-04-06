"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAdminUserData } from "@/lib/admin-utils";
import { useAuth } from "@/lib/auth-context";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";
import PaymentHistory from "@/components/payment-history";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PaymentManagement() {
  const router = useRouter();
  const { user, userRole, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user || userRole !== "admin") {
      router.push("/login");
      return;
    }

    const checkAdminAuth = async () => {
      try {
        const adminData = await getAdminUserData(user.uid);
        if (!adminData) {
          router.push("/create-user");
          return;
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error verifying admin status:", error);
        setIsLoading(false);
      }
    };

    checkAdminAuth();
  }, [user, userRole, authLoading, router]);

  if (authLoading || isLoading) {
    return <AuthLoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <Link href="/admin-dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">
            Payment Management
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Clean bank-ready payment records with exact timestamps, grouped order counts, and structured product details.
          </p>
        </div>

        <PaymentHistory />
      </div>
    </div>
  );
}
