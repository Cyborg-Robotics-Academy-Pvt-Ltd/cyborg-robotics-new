"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  query,
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
import { generateCompetitionHallTicketNumber } from "@/lib/codefest-registration-validation";
import { normalizePaymentStatus } from "@/lib/payment-status";

type FirestoreTimestampLike = {
  toDate: () => Date;
};

type FirestoreRecord = Record<string, any>;

interface CompetitionRegistration {
  id: string;
  firestoreId?: string;
  orderId?: string;
  fullName?: string;
  gradeClass?: string;
  schoolName?: string;
  cityState?: string;
  fullResidentialAddress?: string;
  parentGuardianName?: string;
  parentEmailAddress?: string;
  studentEmailAddress?: string;
  parentGuardianContactNumber?: string;
  emergencyContactNumber?: string;
  deviceAvailableForCompetition?: string;
  previousExperience?: string;
  participatedBefore?: string;
  preferredCodingPlatform?: string;
  hallTicketNumber?: string;
  competitionId?: string;
  competitionKey?: string;
  competitionName?: string;
  registrationFee?: number | string;
  paidAmount?: number | string;
  paymentType?: string;
  paymentStatus?: string;
  status?: string;
  paymentId?: string;
  source?: string;
  dateOfRegistration?: string;
  createdAt?: FirestoreTimestampLike | string;
}

const isManualStatusEditable = (paymentStatus?: string) => {
  const normalized = normalizeAdminPaymentStatus(paymentStatus || "PENDING");
  return normalized === "PENDING" || normalized === "PENDING_PAYMENT";
};

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const STATUS_OPTIONS = ["PENDING", "SUCCESS", "FAILED"] as const;

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

const getRegistrationDateValue = (registration: CompetitionRegistration) => {
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

const formatDisplayDate = (registration: CompetitionRegistration) => {
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
  const normalized = normalizeAdminPaymentStatus(paymentStatus);

  if (!normalized) {
    return "PENDING";
  }

  if (normalized === "PENDING_PAYMENT") {
    return "PENDING";
  }

  return normalized.replace(/_/g, " ");
};

const getStatusColor = (status: string) => {
  switch (normalizeAdminPaymentStatus(status)) {
    case "SUCCESS":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "FAILED":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-amber-100 text-amber-800 border-amber-200";
  }
};

function normalizeAdminPaymentStatus(status?: string | null) {
  const raw = String(status || "")
    .trim()
    .toUpperCase();
  if (raw === "NEW") return "PENDING";
  if (raw === "PENDING_PAYMENT") return "PENDING_PAYMENT";
  return normalizePaymentStatus(raw);
}

const normalizeCompetitionRecord = (
  record: FirestoreRecord,
  id: string,
): CompetitionRegistration => {
  const draft = record.competitionRegistrationDraft || {};
  const competition = record.competition || {};
  const normalizedPaymentStatus = normalizeAdminPaymentStatus(
    record.paymentStatus || record.status || "",
  );
  const normalizedPaidAmount =
    record.paidAmount ??
    (normalizedPaymentStatus === "SUCCESS" ||
    normalizedPaymentStatus === "CHARGED"
      ? record.amount
      : "");

  return {
    id,
    firestoreId:
      typeof id === "string" && id.startsWith("payment-competition-") ? "" : id,
    orderId: record.orderId || "",
    fullName: record.fullName || record.studentName || draft.fullName || "",
    gradeClass: record.gradeClass || draft.gradeClass || "",
    schoolName: record.schoolName || draft.schoolName || "",
    cityState: record.cityState || draft.cityState || "",
    fullResidentialAddress:
      record.fullResidentialAddress || draft.fullResidentialAddress || "",
    parentGuardianName:
      record.parentGuardianName || draft.parentGuardianName || "",
    parentEmailAddress:
      record.parentEmailAddress ||
      record.parentEmail ||
      record.primaryParentEmail ||
      draft.parentEmailAddress ||
      "",
    studentEmailAddress:
      record.studentEmailAddress ||
      record.studentEmail ||
      draft.studentEmailAddress ||
      "",
    parentGuardianContactNumber:
      record.parentGuardianContactNumber ||
      record.parentPhone ||
      record.primaryParentContact ||
      draft.parentGuardianContactNumber ||
      "",
    emergencyContactNumber:
      record.emergencyContactNumber || draft.emergencyContactNumber || "",
    deviceAvailableForCompetition:
      record.deviceAvailableForCompetition ||
      draft.deviceAvailableForCompetition ||
      "",
    previousExperience:
      record.previousExperience || draft.previousExperience || "",
    participatedBefore:
      record.participatedBefore || draft.participatedBefore || "",
    preferredCodingPlatform:
      record.preferredCodingPlatform || draft.preferredCodingPlatform || "",
    hallTicketNumber:
      record.hallTicketNumber ||
      record.competitionId ||
      draft.hallTicketNumber ||
      (record.orderId
        ? generateCompetitionHallTicketNumber(record.orderId)
        : ""),
    competitionId:
      record.competitionId ||
      record.hallTicketNumber ||
      draft.competitionId ||
      (record.orderId
        ? generateCompetitionHallTicketNumber(record.orderId)
        : ""),
    competitionKey: record.competitionKey || competition.key || "",
    competitionName:
      record.competitionName || record.courseName || competition.name || "",
    registrationFee:
      record.registrationFee || competition.fee || record.amount || "",
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

const mergeCompetitionRecord = (
  base: CompetitionRegistration,
  incoming: CompetitionRegistration,
): CompetitionRegistration => {
  return {
    id: pickFirstValue(base.id, incoming.id) || "",
    orderId: pickFirstValue(base.orderId, incoming.orderId) || "",
    fullName: pickFirstValue(base.fullName, incoming.fullName) || "",
    gradeClass: pickFirstValue(base.gradeClass, incoming.gradeClass) || "",
    schoolName: pickFirstValue(base.schoolName, incoming.schoolName) || "",
    cityState: pickFirstValue(base.cityState, incoming.cityState) || "",
    fullResidentialAddress:
      pickFirstValue(
        base.fullResidentialAddress,
        incoming.fullResidentialAddress,
      ) || "",
    parentGuardianName:
      pickFirstValue(base.parentGuardianName, incoming.parentGuardianName) ||
      "",
    parentEmailAddress:
      pickFirstValue(base.parentEmailAddress, incoming.parentEmailAddress) ||
      "",
    studentEmailAddress:
      pickFirstValue(base.studentEmailAddress, incoming.studentEmailAddress) ||
      "",
    parentGuardianContactNumber:
      pickFirstValue(
        base.parentGuardianContactNumber,
        incoming.parentGuardianContactNumber,
      ) || "",
    emergencyContactNumber:
      pickFirstValue(
        base.emergencyContactNumber,
        incoming.emergencyContactNumber,
      ) || "",
    deviceAvailableForCompetition:
      pickFirstValue(
        base.deviceAvailableForCompetition,
        incoming.deviceAvailableForCompetition,
      ) || "",
    previousExperience:
      pickFirstValue(base.previousExperience, incoming.previousExperience) ||
      "",
    participatedBefore:
      pickFirstValue(base.participatedBefore, incoming.participatedBefore) ||
      "",
    preferredCodingPlatform:
      pickFirstValue(
        base.preferredCodingPlatform,
        incoming.preferredCodingPlatform,
      ) || "",
    hallTicketNumber:
      pickFirstValue(base.hallTicketNumber, incoming.hallTicketNumber) || "",
    competitionId:
      pickFirstValue(base.competitionId, incoming.competitionId) || "",
    competitionKey:
      pickFirstValue(base.competitionKey, incoming.competitionKey) || "",
    competitionName:
      pickFirstValue(base.competitionName, incoming.competitionName) || "",
    registrationFee:
      pickFirstValue(base.registrationFee, incoming.registrationFee) || "",
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
  const [registrations, setRegistrations] = useState<CompetitionRegistration[]>(
    [],
  );
  const [filteredRegistrations, setFilteredRegistrations] = useState<
    CompetitionRegistration[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof CompetitionRegistration;
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
      const competitionRegistrationsCollection = collection(
        firestore,
        "competitionRegistrations",
      );
      const paymentsCollection = collection(firestore, "payments");

      const [competitionRegistrationsSnapshot, paymentsSnapshot] =
        await Promise.all([
          getDocs(competitionRegistrationsCollection),
          getDocs(paymentsCollection),
        ]);

      const competitionRegistrationData =
        competitionRegistrationsSnapshot.docs.map((entry) =>
          normalizeCompetitionRecord(entry.data() as FirestoreRecord, entry.id),
        );

      const competitionPaymentData = paymentsSnapshot.docs
        .map((entry) => entry.data() as FirestoreRecord)
        .filter((record) => record.paymentFlow === "competition")
        .map((record, index) =>
          normalizeCompetitionRecord(record, `payment-competition-${index}`),
        );

      const mergedMap = new Map<string, CompetitionRegistration>();

      for (const registration of competitionRegistrationData) {
        const key = registration.orderId || registration.id;
        mergedMap.set(key, registration);
      }

      for (const payment of competitionPaymentData) {
        const key = payment.orderId || payment.id;
        const existing = mergedMap.get(key);
        mergedMap.set(
          key,
          existing ? mergeCompetitionRecord(existing, payment) : payment,
        );
      }

      const merged = Array.from(mergedMap.values());
      setRegistrations(merged);
      setFilteredRegistrations(merged);
    } catch (fetchError) {
      console.error("Error fetching competition registrations:", fetchError);
      setError(
        "Failed to load competition registrations. Please try again later.",
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
        registration.fullName?.toLowerCase().includes(term) ||
        registration.studentEmailAddress?.toLowerCase().includes(term) ||
        registration.parentEmailAddress?.toLowerCase().includes(term) ||
        registration.parentGuardianContactNumber
          ?.toLowerCase()
          .includes(term) ||
        registration.gradeClass?.toLowerCase().includes(term) ||
        registration.schoolName?.toLowerCase().includes(term) ||
        registration.cityState?.toLowerCase().includes(term) ||
        registration.competitionName?.toLowerCase().includes(term) ||
        registration.hallTicketNumber?.toLowerCase().includes(term) ||
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

  const handleSort = (key: keyof CompetitionRegistration) => {
    setSortConfig((prev) =>
      prev.key === key && prev.direction === "asc"
        ? { key, direction: "desc" }
        : { key, direction: "asc" },
    );
  };

  const handleStatusChange = useCallback(
    async (registration: CompetitionRegistration, nextStatus: string) => {
      if (
        !registration.orderId ||
        !isManualStatusEditable(registration.paymentStatus)
      ) {
        return;
      }
      setUpdatingStatusId(registration.id);

      try {
        const response = await fetch("/api/admin/competition-payment-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: registration.orderId,
            status: nextStatus,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to update competition status",
          );
        }

        setRegistrations((current) =>
          current.map((item) =>
            item.id === registration.id
              ? {
                  ...item,
                  paymentStatus: data.paymentStatus,
                  status: data.status,
                }
              : item,
          ),
        );
        setFilteredRegistrations((current) =>
          current.map((item) =>
            item.id === registration.id
              ? {
                  ...item,
                  paymentStatus: data.paymentStatus,
                  status: data.status,
                }
              : item,
          ),
        );
      } catch (statusError) {
        console.error("Failed to update competition status:", statusError);
      } finally {
        setUpdatingStatusId(null);
      }
    },
    [],
  );

  const handleRemoveRegistration = useCallback(
    async (registration: CompetitionRegistration) => {
      const hasFirestoreRecord = Boolean(registration.firestoreId);
      const hasPaymentReference = Boolean(registration.orderId);

      if (!hasFirestoreRecord && !hasPaymentReference) {
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to remove ${
          registration.fullName || "this registration"
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
              doc(
                firestore,
                "competitionRegistrations",
                registration.firestoreId,
              ),
            ),
          );
        }

        if (registration.orderId) {
          const paymentsQuery = query(
            collection(firestore, "payments"),
            where("orderId", "==", registration.orderId),
            where("paymentFlow", "==", "competition"),
          );
          const paymentsSnapshot = await getDocs(paymentsQuery);

          paymentsSnapshot.forEach((paymentDoc) => {
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
      } catch (removeError) {
        console.error(
          "Failed to remove competition registration:",
          removeError,
        );
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
      const worksheet = workbook.addWorksheet("Competition Registrations");

      worksheet.columns = [
        { header: "Date", key: "dateOfRegistration", width: 18 },
        { header: "Competition", key: "competitionName", width: 30 },
        { header: "Participant Name", key: "fullName", width: 24 },
        { header: "Hall Ticket", key: "hallTicketNumber", width: 18 },
        { header: "Grade / Class", key: "gradeClass", width: 16 },
        { header: "School Name", key: "schoolName", width: 28 },
        { header: "City & State", key: "cityState", width: 18 },
        {
          header: "Residential Address",
          key: "fullResidentialAddress",
          width: 36,
        },
        { header: "Parent Name", key: "parentGuardianName", width: 24 },
        { header: "Parent Email", key: "parentEmailAddress", width: 28 },
        { header: "Student Email", key: "studentEmailAddress", width: 28 },
        {
          header: "Parent Contact",
          key: "parentGuardianContactNumber",
          width: 18,
        },
        {
          header: "Emergency Contact",
          key: "emergencyContactNumber",
          width: 18,
        },
        {
          header: "Device",
          key: "deviceAvailableForCompetition",
          width: 14,
        },
        { header: "Previous Experience", key: "previousExperience", width: 20 },
        { header: "Participated Before", key: "participatedBefore", width: 18 },
        {
          header: "Preferred Platform",
          key: "preferredCodingPlatform",
          width: 18,
        },
        { header: "Payment Status", key: "paymentStatus", width: 18 },
        { header: "Amount", key: "paidAmount", width: 14 },
        { header: "Order ID", key: "orderId", width: 24 },
      ];

      sortedRegistrations.forEach((registration) =>
        worksheet.addRow({
          ...registration,
          dateOfRegistration: formatDisplayDate(registration),
        }),
      );

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "Competition_Registrations.xlsx");
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
        <Card className="overflow-hidden rounded-2xl border-0 shadow-lg">
          <CardHeader className="border-b-0 bg-gradient-to-r from-red-900 to-red-800 px-6 py-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="mb-1 text-3xl font-bold text-white">
                    Competition Registrations
                  </CardTitle>
                  <p className="text-sm text-red-100">
                    {sortedRegistrations.length} total registrations
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1 sm:min-w-96 sm:flex-initial">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by participant, hall ticket, email, or city..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="rounded-lg border border-gray-200 bg-white py-2.5 pl-11 pr-10 shadow-sm transition-all focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={fetchRegistrations}
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 text-red-800 shadow-sm transition-all hover:bg-gray-100"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                    />
                    <span className="hidden sm:inline">Refresh</span>
                  </Button>

                  <Button
                    onClick={exportToExcel}
                    disabled={exporting || sortedRegistrations.length === 0}
                    className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 text-white shadow-sm transition-all hover:bg-emerald-700"
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
              <div className="flex h-64 flex-col items-center justify-center bg-white">
                <Loader2 className="mb-3 h-8 w-8 animate-spin text-red-600" />
                <p className="text-gray-500">
                  Loading competition registrations...
                </p>
              </div>
            ) : error ? (
              <div className="border-l-4 border-red-500 bg-red-50 p-6 text-red-700">
                {error}
              </div>
            ) : paginatedRegistrations.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center bg-white text-gray-400">
                <Search className="mb-3 h-12 w-12 opacity-30" />
                <p>No competition registrations found.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto border-t border-gray-100">
                  <Table className="w-full">
                    <TableHeader className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
                      <TableRow>
                        {[
                          { key: "dateOfRegistration", label: "Date" },
                          { key: "competitionName", label: "Competition" },
                          { key: "fullName", label: "Participant" },
                          {
                            key: "parentGuardianName",
                            label: "Parent / Contact",
                          },
                          { key: "cityState", label: "Location" },
                          { key: "preferredCodingPlatform", label: "Setup" },
                          { key: "paymentStatus", label: "Payment Status" },
                          { key: "paidAmount", label: "Amount" },
                          { key: "actions", label: "Actions" },
                        ].map((column) => (
                          <TableHead
                            key={column.key}
                            onClick={() => {
                              if (column.key === "actions") {
                                return;
                              }

                              handleSort(
                                column.key as keyof CompetitionRegistration,
                              );
                            }}
                            className={`px-4 py-3 text-xs font-semibold text-gray-700 ${
                              column.key === "actions"
                                ? ""
                                : "cursor-pointer transition-colors hover:bg-gray-100"
                            }`}
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
                          className="border-b border-gray-100 transition-colors hover:bg-red-50"
                        >
                          <TableCell className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                            {formatDisplayDate(registration)}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm font-medium text-gray-900">
                            {registration.competitionName || "-"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-700">
                            <div className="min-w-[220px] space-y-1">
                              <p className="font-medium text-gray-900">
                                {registration.fullName || "-"}
                              </p>
                              <p className="text-xs text-gray-500">
                                Hall Ticket:{" "}
                                {registration.hallTicketNumber ||
                                  registration.competitionId ||
                                  "-"}
                              </p>
                              <p className="text-xs text-gray-500">
                                Student Email:{" "}
                                {registration.studentEmailAddress || "-"}
                              </p>
                              <p className="text-xs text-gray-500">
                                Grade: {registration.gradeClass || "-"}
                              </p>
                              <p className="text-xs text-gray-500">
                                School: {registration.schoolName || "-"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-700">
                            <div className="min-w-[220px] space-y-1">
                              <p className="font-medium text-gray-900">
                                {registration.parentGuardianName || "-"}
                              </p>
                              <p className="text-xs text-gray-500">
                                Parent Email:{" "}
                                {registration.parentEmailAddress || "-"}
                              </p>
                              <p className="text-xs font-mono text-gray-500">
                                Parent Contact:{" "}
                                {registration.parentGuardianContactNumber ||
                                  "-"}
                              </p>
                              <p className="text-xs font-mono text-gray-500">
                                Emergency:{" "}
                                {registration.emergencyContactNumber || "-"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-700">
                            <div className="min-w-[240px] space-y-1">
                              <p className="font-medium text-gray-900">
                                {registration.cityState || "-"}
                              </p>
                              <p className="line-clamp-3 text-xs text-gray-500">
                                {registration.fullResidentialAddress || "-"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-700">
                            <div className="min-w-[200px] space-y-1">
                              <p className="text-xs text-gray-500">
                                Device:{" "}
                                {registration.deviceAvailableForCompetition ||
                                  "-"}
                              </p>
                              <p className="text-xs text-gray-500">
                                Experience:{" "}
                                {registration.previousExperience || "-"}
                              </p>
                              <p className="text-xs text-gray-500">
                                Participated Before:{" "}
                                {registration.participatedBefore || "-"}
                              </p>
                              <p className="text-xs text-gray-500">
                                Platform:{" "}
                                {registration.preferredCodingPlatform || "-"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm">
                            {isManualStatusEditable(
                              registration.paymentStatus,
                            ) ? (
                              <Select
                                value={registration.paymentStatus || "PENDING"}
                                onValueChange={(value) =>
                                  handleStatusChange(registration, value)
                                }
                                disabled={updatingStatusId === registration.id}
                              >
                                <SelectTrigger
                                  className={`w-[140px] rounded-md border text-xs font-semibold shadow-none ${getStatusColor(
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
                                  {STATUS_OPTIONS.filter(
                                    (status) => status !== "PENDING",
                                  ).map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {formatPaymentStatusLabel(status)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <span
                                className={`inline-flex min-w-[140px] items-center justify-center rounded-md border px-3 py-2 text-xs font-semibold ${getStatusColor(
                                  registration.paymentStatus || "PENDING",
                                )}`}
                              >
                                {formatPaymentStatusLabel(
                                  registration.paymentStatus,
                                )}
                              </span>
                            )}
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
                              className="text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
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

                <div className="flex flex-col gap-4 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-3 text-sm text-gray-600 sm:flex-row sm:items-center">
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
                      <SelectTrigger className="w-[140px] border-gray-200 bg-white text-sm text-gray-700">
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
                              ? "bg-red-600 text-white hover:bg-red-700"
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
