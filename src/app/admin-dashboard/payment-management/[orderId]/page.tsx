"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getAdminUserData } from "@/lib/admin-utils";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";
import { Button } from "@/components/ui/button";

export default function AdminInvoicePreviewPage() {
  const router = useRouter();
  const params = useParams<{ orderId: string }>();
  const { user, userRole, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  const orderId = params?.orderId || "";
  const previewUrl = `/api/payment/invoice?orderId=${orderId}&mode=html`;
  const downloadUrl = `/api/payment/invoice?orderId=${orderId}`;

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

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-semibold">Invoice Not Available</h1>
          <p className="mt-2 text-gray-600">Missing order ID.</p>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/admin-dashboard/payment-management">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Invoice Preview</h1>
            <p className="mt-1 text-sm text-slate-600">
              Order {orderId}
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
              <Link href="/admin-dashboard/payment-management">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
          <iframe
            src={previewUrl}
            title="Admin invoice preview"
            className="h-[calc(100vh-180px)] w-full bg-white"
          />
        </div>
      </div>
    </div>
  );
}
