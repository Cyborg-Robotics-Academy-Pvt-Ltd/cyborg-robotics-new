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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <Link href="/admin-dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Payment Management
          </h1>
          <p className="text-muted-foreground mt-1">
            View and manage all payment transactions
          </p>
        </div>

        <PaymentHistory />
      </div>
    </div>
  );
}
