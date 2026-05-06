"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { app } from "@/lib/firebase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Loader2,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  X,
  FileSpreadsheet,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

type FirestoreTimestampLike = {
  toDate: () => Date;
};

type FirestoreRecord = Record<string, any>;

interface WorkshopRegistration {
  id: string;
  firestoreId?: string;
  orderId?: string;
  childName?: string;
  age?: string;
  email?: string;
  contactNumber?: string;
  city?: string;
  area?: string;
  workshopKey?: string;
  workshopName?: string;
  workshopFee?: number | string;
  paidAmount?: number | string;
  paymentType?: string;
  paymentStatus?: string;
  status?: string;
  paymentId?: string;
  source?: string;
  dateOfRegistration?: string;
  createdAt?: FirestoreTimestampLike | string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const STATUS_OPTIONS = ["PENDING", "SUCCESS", "FAILED"] as const;

const mapPaymentStatusToRecordStatus = (paymentStatus: string) => {
  if (paymentStatus === "SUCCESS") {
    return "confirmed";
  }

  if (paymentStatus === "FAILED") {
    return "failed";
  }

  return "pending-payment";
};

const isFirestoreTimestampLike = (
  value: unknown,
): value is FirestoreTimestampLike => {
  return (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as FirestoreTimestampLike).toDate === "function"
  );
};

const pickFirstValue = <T,>(...values: T[]): T | undefined => {
  return values.find((value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    return true;
  });
};

const getRegistrationDateValue = (registration: WorkshopRegistration) => {
  if (isFirestoreTimestampLike(registration.createdAt)) {
    return registration.createdAt.toDate().getTime();
  }

  if (typeof registration.createdAt === "string") {
    const createdAtTimestamp = new Date(registration.createdAt).getTime();
    if (!Number.isNaN(createdAtTimestamp)) {
      return createdAtTimestamp;
    }
  }

  if (!registration.dateOfRegistration) {
    return Number.NEGATIVE_INFINITY;
  }

  const parsedDate = new Date(registration.dateOfRegistration).getTime();
  return Number.isNaN(parsedDate) ? Number.NEGATIVE_INFINITY : parsedDate;
};

const formatDisplayDate = (registration: WorkshopRegistration) => {
  if (isFirestoreTimestampLike(registration.createdAt)) {
    return registration.createdAt.toDate().toLocaleDateString("en-IN");
  }

  if (typeof registration.createdAt === "string") {
    const parsedDate = new Date(registration.createdAt);
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toLocaleDateString("en-IN");
    }
  }

  if (registration.dateOfRegistration) {
    const parsedDate = new Date(registration.dateOfRegistration);
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toLocaleDateString("en-IN");
    }
  }

  return "-";
};

const formatPaymentStatusLabel = (paymentStatus?: string) => {
  if (!paymentStatus) {
    return "PENDING";
  }

  if (paymentStatus === "PENDING_PAYMENT") {
    return "PENDING";
  }

  return paymentStatus.replace(/_/g, " ");
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "SUCCESS":
    case "CHARGED":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "FAILED":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-amber-100 text-amber-800 border-amber-200";
  }
};

const normalizeWorkshopRecord = (
  record: FirestoreRecord,
  id: string,
): WorkshopRegistration => {
  const draft = record.workshopRegistrationDraft || {};
  const workshop = record.workshop || {};
  const normalizedPaymentStatus = String(
    record.paymentStatus ||
      (record.paymentType === "booking-request" ||
      record.source === "workshops-page"
        ? "PENDING_PAYMENT"
        : record.status) ||
      "",
  ).toUpperCase();
  const normalizedPaidAmount =
    record.paidAmount ??
    (normalizedPaymentStatus === "SUCCESS" ||
    normalizedPaymentStatus === "CHARGED"
      ? record.amount
      : "");

  return {
    id,
    firestoreId:
      typeof id === "string" && id.startsWith("payment-workshop-") ? "" : id,
    orderId: record.orderId || "",
    childName: record.childName || record.studentName || draft.childName || "",
    age: String(
      pickFirstValue(record.age, record.currentAge, draft.age, "") ?? "",
    ),
    email:
      record.email ||
      record.parentEmail ||
      record.primaryParentEmail ||
      draft.email ||
      "",
    contactNumber:
      record.contactNumber ||
      record.parentPhone ||
      record.primaryParentContact ||
      draft.contactNumber ||
      "",
    city: record.city || draft.city || "",
    area: record.area || draft.area || "",
    workshopKey: record.workshopKey || workshop.key || "",
    workshopName:
      record.workshopName ||
      record.selectedCourseName ||
      record.courseName ||
      workshop.name ||
      "",
    workshopFee:
      record.workshopFee ||
      record.selectedCourseFee ||
      workshop.fee ||
      record.amount ||
      "",
    paidAmount: normalizedPaidAmount,
    paymentType: record.paymentType || "",
    paymentStatus: normalizedPaymentStatus,
    status: record.status || "",
    paymentId: record.paymentId || record.transactionReference || "",
    source: record.source || record.paymentFlow || "",
    dateOfRegistration:
      record.dateOfRegistration ||
      record.createdAt?.toDate?.()?.toISOString?.().split("T")[0] ||
      "",
    createdAt: record.createdAt,
  };
};

const mergeWorkshopRecord = (
  base: WorkshopRegistration,
  incoming: WorkshopRegistration,
): WorkshopRegistration => {
  return {
    id: pickFirstValue(base.id, incoming.id) || "",
    orderId: pickFirstValue(base.orderId, incoming.orderId) || "",
    childName: pickFirstValue(base.childName, incoming.childName) || "",
    age: pickFirstValue(base.age, incoming.age) || "",
    email: pickFirstValue(base.email, incoming.email) || "",
    contactNumber:
      pickFirstValue(base.contactNumber, incoming.contactNumber) || "",
    city: pickFirstValue(base.city, incoming.city) || "",
    area: pickFirstValue(base.area, incoming.area) || "",
    workshopKey: pickFirstValue(base.workshopKey, incoming.workshopKey) || "",
    workshopName:
      pickFirstValue(base.workshopName, incoming.workshopName) || "",
    workshopFee: pickFirstValue(base.workshopFee, incoming.workshopFee) || "",
    paidAmount: pickFirstValue(incoming.paidAmount, base.paidAmount) || "",
    paymentType: pickFirstValue(base.paymentType, incoming.paymentType) || "",
    paymentStatus:
      pickFirstValue(incoming.paymentStatus, base.paymentStatus) || "",
    status: pickFirstValue(incoming.status, base.status) || "",
    paymentId: pickFirstValue(incoming.paymentId, base.paymentId) || "",
    source: pickFirstValue(base.source, incoming.source) || "",
    dateOfRegistration:
      pickFirstValue(base.dateOfRegistration, incoming.dateOfRegistration) ||
      "",
    createdAt: base.createdAt || incoming.createdAt,
  };
};

const Page = () => {
  const [registrations, setRegistrations] = useState<WorkshopRegistration[]>(
    [],
  );
  const [filteredRegistrations, setFilteredRegistrations] = useState<
    WorkshopRegistration[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof WorkshopRegistration;
    direction: "asc" | "desc";
  }>({
    key: "dateOfRegistration",
    direction: "desc",
  });
  const [exporting, setExporting] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [removingRegistrationId, setRemovingRegistrationId] = useState<
    string | null
  >(null);

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const firestore = getFirestore(app);
      const workshopRegistrationsCollection = collection(
        firestore,
        "workshopRegistrations",
      );
      const paymentsCollection = collection(firestore, "payments");

      const [workshopRegistrationsSnapshot, paymentsSnapshot] =
        await Promise.all([
          getDocs(workshopRegistrationsCollection),
          getDocs(paymentsCollection),
        ]);

      const workshopRegistrationData = workshopRegistrationsSnapshot.docs.map(
        (doc) => normalizeWorkshopRecord(doc.data() as FirestoreRecord, doc.id),
      );

      const workshopPaymentData = paymentsSnapshot.docs
        .map((doc) => doc.data() as FirestoreRecord)
        .filter((record) => record.paymentFlow === "workshop")
        .map((record, index) =>
          normalizeWorkshopRecord(record, `payment-workshop-${index}`),
        );

      const mergedMap = new Map<string, WorkshopRegistration>();

      for (const registration of workshopRegistrationData) {
        const key = registration.orderId || registration.id;
        mergedMap.set(key, registration);
      }

      for (const payment of workshopPaymentData) {
        const key = payment.orderId || payment.id;
        const existing = mergedMap.get(key);
        mergedMap.set(
          key,
          existing ? mergeWorkshopRecord(existing, payment) : payment,
        );
      }

      const merged = Array.from(mergedMap.values());
      setRegistrations(merged);
      setFilteredRegistrations(merged);
    } catch (fetchError) {
      console.error("Error fetching workshop registrations:", fetchError);
      setError(
        "Failed to load workshop registrations. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRegistrations(registrations);
      setCurrentPage(1);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = registrations.filter(
      (registration) =>
        registration.childName?.toLowerCase().includes(term) ||
        registration.email?.toLowerCase().includes(term) ||
        registration.contactNumber?.toLowerCase().includes(term) ||
        registration.city?.toLowerCase().includes(term) ||
        registration.area?.toLowerCase().includes(term) ||
        registration.workshopName?.toLowerCase().includes(term) ||
        registration.orderId?.toLowerCase().includes(term) ||
        registration.paymentStatus?.toLowerCase().includes(term),
    );

    setFilteredRegistrations(filtered);
    setCurrentPage(1);
  }, [registrations, searchTerm]);

  const sortedRegistrations = useMemo(() => {
    return [...filteredRegistrations].sort((a, b) => {
      if (sortConfig.key === "dateOfRegistration") {
        const aValue = getRegistrationDateValue(a);
        const bValue = getRegistrationDateValue(b);

        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      const aValue = String(a[sortConfig.key] ?? "");
      const bValue = String(b[sortConfig.key] ?? "");

      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  }, [filteredRegistrations, sortConfig]);

  const handleSort = (key: keyof WorkshopRegistration) => {
    setSortConfig((prev) =>
      prev.key === key && prev.direction === "asc"
        ? { key, direction: "desc" }
        : { key, direction: "asc" },
    );
  };

  const handleStatusChange = useCallback(
    async (registration: WorkshopRegistration, nextStatus: string) => {
      if (!registration.firestoreId) {
        return;
      }

      const firestore = getFirestore(app);
      setUpdatingStatusId(registration.id);

      try {
        await updateDoc(
          doc(firestore, "workshopRegistrations", registration.firestoreId),
          {
            paymentStatus: nextStatus,
            status: mapPaymentStatusToRecordStatus(nextStatus),
            updatedAt: serverTimestamp(),
          },
        );

        setRegistrations((current) =>
          current.map((item) =>
            item.id === registration.id
              ? {
                  ...item,
                  paymentStatus: nextStatus,
                  status: mapPaymentStatusToRecordStatus(nextStatus),
                }
              : item,
          ),
        );
        setFilteredRegistrations((current) =>
          current.map((item) =>
            item.id === registration.id
              ? {
                  ...item,
                  paymentStatus: nextStatus,
                  status: mapPaymentStatusToRecordStatus(nextStatus),
                }
              : item,
          ),
        );
      } catch (error) {
        console.error("Failed to update workshop status:", error);
      } finally {
        setUpdatingStatusId(null);
      }
    },
    [],
  );

  const handleRemoveRegistration = useCallback(
    async (registration: WorkshopRegistration) => {
      const hasFirestoreRecord = Boolean(registration.firestoreId);
      const hasWorkshopPaymentReference = Boolean(registration.orderId);

      if (!hasFirestoreRecord && !hasWorkshopPaymentReference) {
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to remove ${
          registration.childName || "this registration"
        }? This action cannot be undone.`,
      );

      if (!confirmed) {
        return;
      }

      const firestore = getFirestore(app);
      setRemovingRegistrationId(registration.id);

      try {
        const deletions: Promise<void>[] = [];

        if (registration.firestoreId) {
          deletions.push(
            deleteDoc(
              doc(firestore, "workshopRegistrations", registration.firestoreId),
            ),
          );
        }

        if (registration.orderId) {
          const workshopPaymentsQuery = query(
            collection(firestore, "payments"),
            where("orderId", "==", registration.orderId),
            where("paymentFlow", "==", "workshop"),
          );
          const workshopPaymentsSnapshot = await getDocs(workshopPaymentsQuery);

          workshopPaymentsSnapshot.forEach((paymentDoc) => {
            deletions.push(deleteDoc(paymentDoc.ref));
          });
        }

        await Promise.all(deletions);

        setRegistrations((current) =>
          current.filter((item) => item.id !== registration.id),
        );
        setFilteredRegistrations((current) =>
          current.filter((item) => item.id !== registration.id),
        );
      } catch (error) {
        console.error("Failed to remove workshop registration:", error);
      } finally {
        setRemovingRegistrationId(null);
      }
    },
    [],
  );

  const exportToExcel = async () => {
    setExporting(true);

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Workshop Registrations");

      worksheet.columns = [
        { header: "Date", key: "dateOfRegistration", width: 18 },
        { header: "Workshop", key: "workshopName", width: 28 },
        { header: "Child Name", key: "childName", width: 22 },
        { header: "Age", key: "age", width: 10 },
        { header: "Contact Number", key: "contactNumber", width: 18 },
        { header: "City", key: "city", width: 18 },
        { header: "Area", key: "area", width: 18 },
        { header: "Payment Status", key: "paymentStatus", width: 18 },
        { header: "Paid Amount", key: "paidAmount", width: 14 },
        { header: "Order ID", key: "orderId", width: 24 },
      ];

      sortedRegistrations.forEach((registration) =>
        worksheet.addRow({
          ...registration,
          dateOfRegistration: formatDisplayDate(registration),
        }),
      );

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "Workshop_Registrations.xlsx");
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.max(
    1,
    Math.ceil(sortedRegistrations.length / itemsPerPage),
  );
  const paginatedRegistrations = sortedRegistrations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4 py-8"
    >
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-red-900 to-red-800 px-6 py-8 border-b-0">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-3xl font-bold text-white mb-1">
                    Workshop Registrations
                  </CardTitle>
                  <p className="text-red-100 text-sm">
                    {sortedRegistrations.length} total registrations
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:flex-initial sm:min-w-96">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, workshop, contact, or city..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="pl-11 pr-10 py-2.5 rounded-lg bg-white border border-gray-200 shadow-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={fetchRegistrations}
                    disabled={loading}
                    className="bg-white text-red-800 hover:bg-gray-100 border border-gray-200 rounded-lg shadow-sm transition-all flex items-center gap-2 px-4"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>

                  <Button
                    onClick={exportToExcel}
                    disabled={exporting || sortedRegistrations.length === 0}
                    className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg shadow-sm transition-all flex items-center gap-2 px-4"
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {exporting ? "Exporting..." : "Export"}
                    </span>
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-red-600 mb-3" />
                <p className="text-gray-500">
                  Loading workshop registrations...
                </p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-6 text-red-700">
                {error}
              </div>
            ) : paginatedRegistrations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white text-gray-400">
                <Search className="h-12 w-12 mb-3 opacity-30" />
                <p>No workshop registrations found.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto border-t border-gray-100">
                  <Table className="w-full">
                    <TableHeader className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                      <TableRow>
                        {[
                          { key: "dateOfRegistration", label: "Date" },
                          { key: "workshopName", label: "Workshop" },
                          { key: "childName", label: "Child Name" },
                          { key: "age", label: "Age" },
                          { key: "contactNumber", label: "Contact" },
                          { key: "city", label: "City" },
                          { key: "area", label: "Area" },
                          { key: "paymentStatus", label: "Payment Status" },
                          { key: "paidAmount", label: "Paid Amount" },
                          { key: "actions", label: "Actions" },
                        ].map((column) => (
                          <TableHead
                            key={column.key}
                            onClick={() => {
                              if (column.key === "actions") {
                                return;
                              }

                              handleSort(
                                column.key as keyof WorkshopRegistration,
                              );
                            }}
                            className={`px-4 py-3 text-xs font-semibold text-gray-700 ${
                              column.key === "actions"
                                ? ""
                                : "cursor-pointer hover:bg-gray-100"
                            } transition-colors`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{column.label}</span>
                              {column.key !== "actions" &&
                                sortConfig.key === column.key &&
                                (sortConfig.direction === "asc" ? (
                                  <ChevronUp
                                    size={14}
                                    className="text-red-600"
                                  />
                                ) : (
                                  <ChevronDown
                                    size={14}
                                    className="text-red-600"
                                  />
                                ))}
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedRegistrations.map((registration) => (
                        <TableRow
                          key={registration.orderId || registration.id}
                          className="border-b border-gray-100 hover:bg-red-50 transition-colors"
                        >
                          <TableCell className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                            {formatDisplayDate(registration)}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm font-medium text-gray-900">
                            {registration.workshopName || "-"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-700">
                            {registration.childName || "-"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-700">
                            {registration.age || "-"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-700 font-mono text-xs">
                            {registration.contactNumber || "-"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-700">
                            {registration.city || "-"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-700">
                            {registration.area || "-"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm">
                            <Select
                              value={registration.paymentStatus || "PENDING"}
                              onValueChange={(value) =>
                                handleStatusChange(registration, value)
                              }
                              disabled={
                                !registration.firestoreId ||
                                updatingStatusId === registration.id
                              }
                            >
                              <SelectTrigger
                                className={`w-[140px] text-xs font-semibold border rounded-md shadow-none ${getStatusColor(
                                  registration.paymentStatus || "PENDING",
                                )}`}
                              >
                                <SelectValue>
                                  {updatingStatusId === registration.id
                                    ? "Updating..."
                                    : formatPaymentStatusLabel(
                                        registration.paymentStatus,
                                      )}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {STATUS_OPTIONS.map((status) => (
                                  <SelectItem key={status} value={status}>
                                    {formatPaymentStatusLabel(status)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm font-medium text-emerald-700">
                            {registration.paidAmount ?? "-"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleRemoveRegistration(registration)
                              }
                              disabled={
                                removingRegistrationId === registration.id ||
                                (!registration.firestoreId &&
                                  !registration.orderId)
                              }
                              className="text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                            >
                              {removingRegistrationId === registration.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center text-sm text-gray-600">
                    <span>
                      Showing {(currentPage - 1) * itemsPerPage + 1}–
                      {Math.min(
                        currentPage * itemsPerPage,
                        sortedRegistrations.length,
                      )}{" "}
                      of {sortedRegistrations.length}
                    </span>
                    <Select
                      value={String(itemsPerPage)}
                      onValueChange={(value) => {
                        setItemsPerPage(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[140px] bg-white border-gray-200 text-gray-700 text-sm">
                        <SelectValue placeholder="Rows per page" />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_SIZE_OPTIONS.map((size) => (
                          <SelectItem key={size} value={String(size)}>
                            {size} per page
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((page) => Math.max(page - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="border-gray-200 hover:bg-gray-100"
                    >
                      Prev
                    </Button>
                    <div className="flex gap-1">
                      {Array.from(
                        { length: totalPages },
                        (_, index) => index + 1,
                      ).map((pageNumber) => (
                        <Button
                          key={pageNumber}
                          size="sm"
                          variant={
                            pageNumber === currentPage ? "default" : "outline"
                          }
                          onClick={() => setCurrentPage(pageNumber)}
                          className={`min-w-10 ${
                            pageNumber === currentPage
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : "border-gray-200 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {pageNumber}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((page) => Math.min(page + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="border-gray-200 hover:bg-gray-100"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default Page;
