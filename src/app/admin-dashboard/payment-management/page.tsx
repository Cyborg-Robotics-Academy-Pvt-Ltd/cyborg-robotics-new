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

const PAYMENT_GATEWAY_ADMIN_EMAIL = "shrikantg199@gmail.com";

async function readGatewayResponse(response: Response) {
  const body = await response.text();
  let data: Record<string, unknown> = {};

  if (body) {
    try {
      data = JSON.parse(body) as Record<string, unknown>;
    } catch {
      throw new Error(
        `Payment settings returned an invalid response (HTTP ${response.status}).`,
      );
    }
  } else if (response.ok) {
    throw new Error("Payment settings returned an empty response.");
  }

  if (!response.ok) {
    throw new Error(
      typeof data.message === "string"
        ? data.message
        : `Payment settings request failed (HTTP ${response.status}).`,
    );
  }

  return data;
}

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

        {user?.email?.toLowerCase() === PAYMENT_GATEWAY_ADMIN_EMAIL && (
          <PaymentGatewaySettings user={user} />
        )}
        <PaymentHistory />
      </div>
    </div>
  );
}

function PaymentGatewaySettings({ user }: { user: { getIdToken: () => Promise<string> } | null }) {
  const [activeGateway, setActiveGateway] = useState<"razorpay" | "hdfc">("razorpay");
  const [loadingGateway, setLoadingGateway] = useState(true);
  const [savingGateway, setSavingGateway] = useState(false);
  const [gatewayError, setGatewayError] = useState("");
  const [gatewaySaved, setGatewaySaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        if (!user) throw new Error("Admin session is unavailable.");
        const token = await user.getIdToken();
        const response = await fetch("/api/admin/payment-gateway", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        const data = await readGatewayResponse(response);
        if (!cancelled) setActiveGateway(data.activeGateway === "hdfc" ? "hdfc" : "razorpay");
      } catch (error) {
        if (!cancelled) setGatewayError(error instanceof Error ? error.message : "Could not load payment settings.");
      } finally {
        if (!cancelled) setLoadingGateway(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [user]);

  const saveGateway = async (gateway: "razorpay" | "hdfc") => {
    if (!user) return;
    setSavingGateway(true);
    setGatewayError("");
    setGatewaySaved(false);
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/payment-gateway", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ activeGateway: gateway }),
      });
      const data = await readGatewayResponse(response);
      setActiveGateway(data.activeGateway === "hdfc" ? "hdfc" : "razorpay");
      setGatewaySaved(true);
    } catch (error) {
      setGatewayError(error instanceof Error ? error.message : "Could not update payment provider.");
    } finally {
      setSavingGateway(false);
    }
  };

  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" aria-labelledby="payment-gateway-heading">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="payment-gateway-heading" className="text-lg font-semibold text-slate-900">Active payment provider</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">New registration, renewal, workshop, and competition payments will use this provider. You can switch it whenever needed.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {([ ["razorpay", "Razorpay"], ["hdfc", "Juspay / HDFC"] ] as const).map(([gateway, label]) => (
            <button
              key={gateway}
              type="button"
              disabled={loadingGateway || savingGateway || activeGateway === gateway}
              onClick={() => void saveGateway(gateway)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed ${activeGateway === gateway ? "bg-rose-600 text-white" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"} disabled:opacity-60`}
              aria-pressed={activeGateway === gateway}
            >
              {savingGateway ? "Saving…" : label}
            </button>
          ))}
        </div>
      </div>
      {loadingGateway && <p className="mt-3 text-sm text-slate-500">Loading current provider…</p>}
      {gatewaySaved && <p className="mt-3 text-sm font-medium text-emerald-700">New payments will use {activeGateway === "hdfc" ? "Juspay / HDFC" : "Razorpay"}.</p>}
      {gatewayError && <p role="alert" className="mt-3 text-sm font-medium text-red-700">{gatewayError}</p>}
    </section>
  );
}
