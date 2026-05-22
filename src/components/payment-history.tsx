"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
} from "firebase/firestore";
import { Search, RefreshCw, Download, Eye, Copy } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { app } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/hooks/use-toast";

interface PaymentRecord {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  status: string;
  transactionReference?: string;
  bankRef?: string;
  studentName?: string;
  studentEmail?: string;
  courseName?: string;
  paymentType?: string;
  paymentFlow?: string;
  course?: { key?: string; name?: string; price?: number };
  workshop?: { key?: string; name?: string; fee?: number };
  registrationDraft?: Record<string, any>;
  workshopRegistrationDraft?: Record<string, any>;
  createdAt: Date;
  updatedAt?: Date;
}

interface PaymentSummary {
  orderId: string;
  storedCount: number;
  latestRecord: PaymentRecord;
  records: PaymentRecord[];
  firstStoredAt: Date;
  latestStoredAt: Date;
}

const formatCurrency = (amount: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);

const formatExactTimestamp = (date: Date) =>
  new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "medium",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(date);

const formatDateTimeIso = (date: Date) =>
  date.toISOString().replace("T", " ").slice(0, 19) + " UTC";

const normalizeStatus = (status: string) =>
  String(status || "")
    .trim()
    .toUpperCase();

const isPendingPaymentStatus = (status: string) =>
  ["PENDING", "CREATED", "AUTHORIZED", "PENDING_VBV"].includes(
    normalizeStatus(status),
  );

const getStatusDisplay = (status: string) => {
  const normalized = normalizeStatus(status);

  if (normalized === "SUCCESS" || normalized === "CHARGED") {
    return {
      label: "Success",
      variant: "default" as const,
      explanation: "Payment was captured and can be treated as completed.",
    };
  }

  if (
    normalized === "PENDING" ||
    normalized === "CREATED" ||
    normalized === "AUTHORIZED" ||
    normalized === "PENDING_VBV"
  ) {
    return {
      label: "Pending",
      variant: "secondary" as const,
      explanation:
        "Payment is not fully finalized yet and should not be treated as settled.",
    };
  }

  if (
    normalized === "AUTHORIZATION_FAILED" ||
    normalized === "AUTHENTICATION_FAILED" ||
    normalized === "JUSPAY_DECLINED" ||
    normalized === "FAILED" ||
    normalized === "DECLINED"
  ) {
    return {
      label: "Failed",
      variant: "destructive" as const,
      explanation:
        normalized === "AUTHORIZATION_FAILED"
          ? "Authorization failed before capture, so this order did not complete successfully."
          : "The gateway rejected or failed the payment attempt.",
    };
  }

  if (normalized === "REFUNDED") {
    return {
      label: "Refunded",
      variant: "outline" as const,
      explanation: "Payment was completed earlier and later refunded.",
    };
  }

  return {
    label: normalized || "Unknown",
    variant: "outline" as const,
    explanation:
      "The current gateway state does not map cleanly to a standard admin label.",
  };
};

const parseOrderIds = (value: string | null | undefined) =>
  (value || "")
    .split(/[,\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);

const getPaymentProduct = (payment: PaymentRecord) => {
  const isWorkshop =
    payment.paymentFlow === "workshop" ||
    Boolean(payment.workshop) ||
    Boolean(payment.workshopRegistrationDraft);

  if (isWorkshop) {
    const name =
      payment.workshop?.name ||
      payment.workshopRegistrationDraft?.workshopName ||
      payment.courseName ||
      "Workshop";

    const fee =
      payment.workshop?.fee ??
      payment.workshopRegistrationDraft?.fee ??
      payment.amount;

    const participant =
      payment.workshopRegistrationDraft?.childName ||
      payment.studentName ||
      null;

    return {
      type: "Workshop",
      name,
      fee,
      extra: participant ? `Participant: ${participant}` : null,
    };
  }

  const name =
    payment.registrationDraft?.selectedCourseName ||
    payment.course?.name ||
    payment.courseName ||
    "Course";

  const fee =
    payment.course?.price ??
    payment.registrationDraft?.selectedCourseFee ??
    payment.amount;

  const paymentType =
    payment.registrationDraft?.paymentType || payment.paymentType || null;

  return {
    type: "Course",
    name,
    fee,
    extra: paymentType ? `Payment type: ${paymentType}` : null,
  };
};

const buildPlainTextReport = (summaries: PaymentSummary[]) => {
  const header = [
    "Order ID",
    "Stored Count",
    "Exact Timestamp",
    "Product Type",
    "Product Name",
    "Amount",
    "Status",
    "Gateway Status",
    "Txn Ref",
    "Bank Ref",
    "Explanation",
  ].join(" | ");

  const rows = summaries.map((summary) => {
    const payment = summary.latestRecord;
    const product = getPaymentProduct(payment);
    const status = getStatusDisplay(payment.status);

    return [
      summary.orderId,
      String(summary.storedCount),
      formatExactTimestamp(summary.latestStoredAt),
      product.type,
      product.name,
      formatCurrency(payment.amount, payment.currency || "INR"),
      status.label,
      normalizeStatus(payment.status),
      payment.transactionReference || "-",
      payment.bankRef || "-",
      status.explanation,
    ].join(" | ");
  });

  return [header, ...rows].join("\n");
};

export default function PaymentHistory() {
  const searchParams = useSearchParams();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [copying, setCopying] = useState(false);
  const [reconcilingOrderId, setReconcilingOrderId] = useState<string | null>(
    null,
  );

  const orderIdFilter = useMemo(() => {
    const queryValue =
      searchParams.get("orderIds") ||
      searchParams.get("orderId") ||
      process.env.NEXT_PUBLIC_BANK_PAYMENT_ORDER_IDS ||
      "";

    return parseOrderIds(queryValue);
  }, [searchParams]);
  const isBankReport = orderIdFilter.length > 0;

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const db = getFirestore(app);
      const paymentsRef = collection(db, "payments");
      const q = query(paymentsRef, orderBy("createdAt", "desc"), limit(200));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => {
        const raw = doc.data() as Record<string, any>;
        return {
          id: doc.id,
          ...raw,
          createdAt: raw.createdAt?.toDate?.() || new Date(),
        } as PaymentRecord;
      });

      setPayments(data);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
      toast.destructive({
        title: "Unable to load payments",
        description: "Please refresh the page and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const summaries = useMemo<PaymentSummary[]>(() => {
    const grouped = new Map<string, PaymentRecord[]>();

    payments.forEach((payment) => {
      const key = payment.orderId || payment.id;
      const existing = grouped.get(key) || [];
      grouped.set(key, [...existing, payment]);
    });

    const entries = Array.from(grouped.entries()).map(([orderId, records]) => {
      const orderedRecords = [...records].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
      );

      return {
        orderId,
        storedCount: orderedRecords.length,
        latestRecord: orderedRecords[0],
        records: orderedRecords,
        firstStoredAt: orderedRecords[orderedRecords.length - 1].createdAt,
        latestStoredAt: orderedRecords[0].createdAt,
      };
    });

    entries.sort(
      (a, b) => b.latestStoredAt.getTime() - a.latestStoredAt.getTime(),
    );
    return entries;
  }, [payments]);

  const filteredSummaries = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const requestedOrderSet = new Set(orderIdFilter);

    const base = summaries.filter((summary) => {
      if (orderIdFilter.length > 0 && !requestedOrderSet.has(summary.orderId)) {
        return false;
      }

      const payment = summary.latestRecord;
      const product = getPaymentProduct(payment);
      const status = normalizeStatus(payment.status);

      const matchesSearch =
        !normalizedSearch ||
        summary.orderId.toLowerCase().includes(normalizedSearch) ||
        (payment.transactionReference || "")
          .toLowerCase()
          .includes(normalizedSearch) ||
        (payment.bankRef || "").toLowerCase().includes(normalizedSearch) ||
        (payment.studentName || "").toLowerCase().includes(normalizedSearch) ||
        (payment.studentEmail || "").toLowerCase().includes(normalizedSearch) ||
        product.type.toLowerCase().includes(normalizedSearch) ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        status.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        filterStatus === "all" ||
        normalizeStatus(payment.status) === filterStatus;

      return matchesSearch && matchesStatus;
    });

    if (orderIdFilter.length > 0) {
      const orderIndex = new Map(orderIdFilter.map((id, index) => [id, index]));
      return [...base].sort(
        (a, b) =>
          (orderIndex.get(a.orderId) ?? 0) - (orderIndex.get(b.orderId) ?? 0),
      );
    }

    return base;
  }, [filterStatus, orderIdFilter, searchTerm, summaries]);

  const missingOrderIds = useMemo(() => {
    if (orderIdFilter.length === 0) return [];
    const found = new Set(summaries.map((summary) => summary.orderId));
    return orderIdFilter.filter((id) => !found.has(id));
  }, [orderIdFilter, summaries]);

  const totalAmount = useMemo(
    () =>
      filteredSummaries
        .filter((summary) => {
          const status = normalizeStatus(summary.latestRecord.status);
          return status === "SUCCESS" || status === "CHARGED";
        })
        .reduce((sum, summary) => sum + summary.latestRecord.amount, 0),
    [filteredSummaries],
  );

  const pendingAmount = useMemo(
    () =>
      filteredSummaries
        .filter((summary) => isPendingPaymentStatus(summary.latestRecord.status))
        .reduce((sum, summary) => sum + summary.latestRecord.amount, 0),
    [filteredSummaries],
  );

  const copyPlainTextReport = async () => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(
        buildPlainTextReport(filteredSummaries),
      );
      toast.success({
        title: "Report copied",
        description: "The bank-ready text report is now on your clipboard.",
      });
    } catch (error) {
      console.error("Failed to copy payment report:", error);
      toast.destructive({
        title: "Copy failed",
        description: "Your browser blocked clipboard access.",
      });
    } finally {
      setCopying(false);
    }
  };

  const reconcilePayment = async (orderId: string) => {
    try {
      setReconcilingOrderId(orderId);
      const response = await fetch("/api/admin/payment-reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to reconcile payment");
      }

      toast.success({
        title: "Payment reconciled",
        description: `${orderId} is now ${data.payment.status}.`,
      });
      await fetchPayments();
    } catch (error) {
      console.error("Failed to reconcile payment:", error);
      toast.destructive({
        title: "Reconcile failed",
        description:
          error instanceof Error
            ? error.message
            : "Please check the gateway order and try again.",
      });
    } finally {
      setReconcilingOrderId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const display = getStatusDisplay(status);

    return <Badge variant={display.variant}>{display.label}</Badge>;
  };

  const renderProductCell = (payment: PaymentRecord) => {
    const product = getPaymentProduct(payment);

    return (
      <div className="space-y-0.5 leading-tight">
        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          {product.type}
        </div>
        <div className="text-sm font-medium text-slate-900">{product.name}</div>
        <div className="text-[11px] text-slate-500">
          Fee: {formatCurrency(product.fee, payment.currency || "INR")}
        </div>
        {product.extra ? (
          <div className="text-[11px] text-slate-500">{product.extra}</div>
        ) : null}
      </div>
    );
  };

  const renderStatusCell = (payment: PaymentRecord) => {
    const status = getStatusDisplay(payment.status);

    return (
      <div className="space-y-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          {getStatusBadge(payment.status)}
          <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wide text-slate-600">
            {normalizeStatus(payment.status) || "UNKNOWN"}
          </span>
        </div>
        <div className="max-w-[250px] text-[11px] leading-4 text-slate-500">
          {status.explanation}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <CardTitle className="text-lg">Payment Report</CardTitle>
              <CardDescription>
                Clean, bank-friendly payment rows with exact timestamps, stored
                count, structured product details, and explicit status notes.
              </CardDescription>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={copyPlainTextReport}
                variant="outline"
                disabled={loading || copying}
              >
                <Copy className="mr-2 h-4 w-4" />
                {copying ? "Copying..." : "Copy text report"}
              </Button>
              <Button
                onClick={fetchPayments}
                disabled={loading}
                variant="outline"
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isBankReport ? (
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Total Revenue</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">
                  {formatCurrency(totalAmount)}
                </div>
                <div className="text-xs text-slate-500">
                  Successful payments only
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Pending Amount</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">
                  {formatCurrency(pendingAmount)}
                </div>
                <div className="text-xs text-slate-500">
                  Awaiting final confirmation
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-sm text-slate-500">Order IDs in View</div>
                <div className="mt-1 text-2xl font-semibold text-slate-900">
                  {filteredSummaries.length}
                </div>
                <div className="text-xs text-slate-500">
                  All visible payment groups
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-medium text-slate-900">
                Bank report mode
              </div>
              <div className="mt-1 text-sm text-slate-600">
                The view is filtered to the requested order IDs so the
                screenshot stays clean and exact.
              </div>
            </div>
          )}

          {isBankReport ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-medium text-slate-900">
                Requested Order IDs
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {orderIdFilter.map((orderId) => (
                  <span
                    key={orderId}
                    className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-mono text-slate-700"
                  >
                    {orderId}
                  </span>
                ))}
              </div>
              {missingOrderIds.length > 0 ? (
                <div className="mt-3 text-sm text-amber-700">
                  Missing from Firestore: {missingOrderIds.join(", ")}
                </div>
              ) : (
                <div className="mt-3 text-sm text-emerald-700">
                  All requested order IDs were found in the payment collection.
                </div>
              )}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle>Payment History</CardTitle>
          <CardDescription>
            Rows are grouped by order ID so the bank can see how many times each
            order was stored.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <RefreshCw className="h-8 w-8 animate-spin text-slate-500" />
            </div>
          ) : filteredSummaries.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-500">
              No matching payments found.
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                Scroll horizontally to view all payment columns.
              </div>
              <div className="overflow-x-auto overscroll-x-contain">
                <Table className="min-w-[1260px] text-sm">
                  <TableHeader>
                    <TableRow className="bg-slate-50/80">
                      <TableHead className="sticky top-0 z-10 whitespace-nowrap bg-slate-50/95 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                        Order ID
                      </TableHead>
                      <TableHead className="sticky top-0 z-10 whitespace-nowrap bg-slate-50/95 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                        Stored Count
                      </TableHead>
                      <TableHead className="sticky top-0 z-10 whitespace-nowrap bg-slate-50/95 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                        Exact Timestamp
                      </TableHead>
                      <TableHead className="sticky top-0 z-10 whitespace-nowrap bg-slate-50/95 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                        Product Details
                      </TableHead>
                      <TableHead className="sticky top-0 z-10 whitespace-nowrap bg-slate-50/95 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                        Amount
                      </TableHead>
                      <TableHead className="sticky top-0 z-10 whitespace-nowrap bg-slate-50/95 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                        Status
                      </TableHead>
                      <TableHead className="sticky top-0 z-10 whitespace-nowrap bg-slate-50/95 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                        Txn / Bank Ref
                      </TableHead>
                      <TableHead className="sticky top-0 z-10 whitespace-nowrap bg-slate-50/95 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSummaries.map((summary, index) => {
                      const payment = summary.latestRecord;
                      return (
                        <TableRow
                          key={summary.orderId}
                          className={[
                            index % 2 === 0 ? "bg-white" : "bg-slate-50/40",
                            "transition-colors hover:bg-slate-50",
                          ].join(" ")}
                        >
                          <TableCell className="whitespace-nowrap px-3 py-2.5 align-top font-mono text-xs font-medium text-slate-900">
                            {summary.orderId}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-3 py-2.5 align-top">
                            <Badge variant="outline">
                              {summary.storedCount}
                            </Badge>
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-3 py-2.5 align-top text-xs text-slate-700">
                            <div className="font-medium text-slate-900">
                              {formatExactTimestamp(summary.latestStoredAt)}
                            </div>
                            <div className="mt-0.5 text-[11px] text-slate-500">
                              {formatDateTimeIso(summary.latestStoredAt)}
                            </div>
                          </TableCell>
                          <TableCell className="min-w-[240px] px-3 py-2.5 align-top">
                            {renderProductCell(payment)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-3 py-2.5 align-top text-right text-xs font-semibold text-slate-900">
                            {formatCurrency(
                              payment.amount,
                              payment.currency || "INR",
                            )}
                          </TableCell>
                          <TableCell className="min-w-[240px] px-3 py-2.5 align-top">
                            {renderStatusCell(payment)}
                          </TableCell>
                          <TableCell className="space-y-0.5 whitespace-nowrap px-3 py-2.5 align-top font-mono text-[11px] text-slate-700">
                            <div>{payment.transactionReference || "-"}</div>
                            <div>{payment.bankRef || "-"}</div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap px-3 py-2.5 align-top">
                            {isPendingPaymentStatus(payment.status) ? (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mr-2"
                                onClick={() => reconcilePayment(summary.orderId)}
                                disabled={reconcilingOrderId === summary.orderId}
                                aria-label="Reconcile payment with gateway"
                                title="Reconcile payment with gateway"
                              >
                                <RefreshCw
                                  className={`h-3.5 w-3.5 ${
                                    reconcilingOrderId === summary.orderId
                                      ? "animate-spin"
                                      : ""
                                  }`}
                                />
                              </Button>
                            ) : null}
                            <Button asChild variant="ghost" size="sm">
                              <Link
                                href={`/admin-dashboard/payment-management/${summary.orderId}`}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {!isBankReport ? (
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle>Search and Filters</CardTitle>
            <CardDescription>
              Use this when you need to narrow the report before capturing a
              screenshot or sharing it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by order ID, name, or reference..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 sm:w-[340px]"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                >
                  <option value="all">All statuses</option>
                  <option value="SUCCESS">Success</option>
                  <option value="CHARGED">Charged</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                  <option value="AUTHORIZATION_FAILED">
                    Authorization failed
                  </option>
                </select>
              </div>

              <div className="text-sm text-slate-500">
                Showing {filteredSummaries.length} grouped order IDs from{" "}
                {payments.length} stored payment records.
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
