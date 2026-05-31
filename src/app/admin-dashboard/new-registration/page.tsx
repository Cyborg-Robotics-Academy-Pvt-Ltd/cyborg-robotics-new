"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
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
import { normalizePaymentStatus } from "@/lib/payment-status";

type FirestoreTimestampLike = {
  toDate: () => Date;
};

type FirestoreRecord = Record<string, any>;

interface Registration {
  id: string;
  firestoreId?: string;
  paymentDocId?: string;
  studentName?: string;
  dateOfBirth?: string;
  currentAge?: string;
  schoolName?: string;
  class?: string;
  board?: string;
  primaryParentType?: string;
  primaryParentName?: string;
  primaryParentContact?: string;
  primaryParentEmail?: string;
  currentAddress?: string;
  permanentAddress?: string;
  studentPRN?: string;
  courseType?: string;
  dateOfJoining?: string;
  duration?: string;
  sessions?: string;
  registrationFees?: string;
  courseFees?: string;
  amountPaid?: string;
  balanceAmount?: string;
  modeOfPayment?: string;
  acceptedBy?: string;
  remark?: string;
  trainers?: string;
  course?: string;
  type?: string;
  location?: string;
  preferredDay?: string;
  preferredTime?: string;
  studentRegistrationNo?: string;
  registrationDate?: string;
  dateOfRegistration?: string;
  selectedCourseKey?: string;
  selectedCourseName?: string;
  selectedCourseFee?: number | string;
  paymentType?: string;
  paymentStatus?: string;
  paidAmount?: number | string;
  paymentRemark?: string;
  createdAt?: FirestoreTimestampLike | string;
  orderId?: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const STATUS_OPTIONS = ["FAILED", "PENDING", "SUCCESS", "CASH_PAY"] as const;

const normalizeText = (value: unknown) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const getPaymentStatusColor = (status?: string) => {
  const normalized = normalizeAdminPaymentStatus(status);

  switch (normalized) {
    case "SUCCESS":
    case "CASH_PAY":
      return "bg-emerald-100 text-emerald-800";
    case "FAILED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-amber-100 text-amber-800";
  }
};

const normalizeAdminPaymentStatus = (status: unknown) => {
  const raw = String(status || "").trim().toUpperCase();
  if (raw === "CASH_PAY" || raw === "CASH PAY" || raw === "CASH") {
    return "CASH_PAY";
  }

  const normalized = normalizePaymentStatus(raw);
  return normalized === "NEW" ? "PENDING" : normalized;
};

const formatPaymentStatusLabel = (status?: string) => {
  const normalized = normalizeAdminPaymentStatus(status);
  if (normalized === "CASH_PAY") return "Cash Pay";
  return normalized.replace(/_/g, " ");
};

const mergeRegistrationRecords = (
  base: Registration,
  incoming: Registration,
): Registration => {
  const incomingIsPayment = Boolean(incoming.paymentDocId);

  return {
    ...base,
    ...Object.fromEntries(
      Object.entries(incoming).filter(([, value]) => {
        if (value === null || value === undefined) return false;
        if (typeof value === "string") return value.trim().length > 0;
        return true;
      }),
    ),
    id: base.id,
    firestoreId: base.firestoreId || incoming.firestoreId,
    paymentDocId: incoming.paymentDocId || base.paymentDocId,
    paymentStatus: incomingIsPayment
      ? incoming.paymentStatus
      : base.paymentStatus || incoming.paymentStatus,
    paidAmount: incomingIsPayment
      ? incoming.paidAmount
      : base.paidAmount || incoming.paidAmount,
    paymentType: incomingIsPayment
      ? incoming.paymentType || base.paymentType
      : base.paymentType || incoming.paymentType,
    paymentRemark: incomingIsPayment
      ? incoming.paymentRemark || base.paymentRemark
      : base.paymentRemark || incoming.paymentRemark,
  };
};

const isCompetitionRecord = (record: FirestoreRecord) => {
  const paymentFlow = normalizeText(record.paymentFlow);
  const competitionName = normalizeText(
    record.competitionName ||
      record.courseName ||
      record.selectedCourseName ||
      record.competition?.name,
  );
  const competitionKey = normalizeText(
    record.competitionKey || record.courseKey || record.competition?.key,
  );

  return (
    paymentFlow === "competition" ||
    Boolean(record.competitionRegistrationDraft) ||
    Boolean(record.competition) ||
    competitionKey.includes("codefest") ||
    competitionName.includes("codefest") ||
    competitionName.includes("mazechallenge")
  );
};

const isWorkshopRecord = (record: FirestoreRecord) =>
  normalizeText(record.paymentFlow) === "workshop" ||
  Boolean(record.workshopRegistrationDraft) ||
  Boolean(record.workshop);

const isStudentRegistrationRecord = (record: FirestoreRecord) =>
  !isWorkshopRecord(record) && !isCompetitionRecord(record);

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

const getRegistrationDateValue = (registration: Registration) => {
  if (isFirestoreTimestampLike(registration.createdAt)) {
    return registration.createdAt.toDate().getTime();
  }

  if (typeof registration.createdAt === "string") {
    const createdAtTimestamp = new Date(registration.createdAt).getTime();

    if (!Number.isNaN(createdAtTimestamp)) {
      return createdAtTimestamp;
    }
  }

  const dateValue =
    registration.dateOfRegistration ||
    registration.registrationDate ||
    registration.dateOfJoining;

  if (!dateValue) {
    return Number.NEGATIVE_INFINITY;
  }

  const parsedDate = new Date(dateValue);
  const timestamp = parsedDate.getTime();

  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
};

const normalizeRegistration = (
  record: FirestoreRecord,
  id: string,
): Registration => {
  const draft = record.registrationDraft || {};
  const course = record.course || {};
  const studentData = record.studentData || {};
  const parentData = record.parentData || {};

  return {
    id,
    orderId: record.orderId,
    studentName:
      record.studentName ||
      draft.studentName ||
      studentData.studentName ||
      studentData.fullName ||
      "",
    dateOfBirth:
      record.dateOfBirth || draft.dateOfBirth || studentData.dateOfBirth || "",
    currentAge:
      record.currentAge || draft.currentAge || studentData.currentAge || "",
    schoolName:
      record.schoolName || draft.schoolName || studentData.schoolName || "",
    class: record.class || draft.class || studentData.class || "",
    board: record.board || draft.board || studentData.board || "",
    primaryParentType:
      record.primaryParentType ||
      draft.primaryParentType ||
      parentData.primaryParentType ||
      "",
    primaryParentName:
      record.primaryParentName ||
      draft.primaryParentName ||
      parentData.primaryParentName ||
      "",
    primaryParentContact:
      record.primaryParentContact ||
      record.parentPhone ||
      draft.primaryParentContact ||
      parentData.primaryParentContact ||
      "",
    primaryParentEmail:
      record.primaryParentEmail ||
      record.parentEmail ||
      draft.primaryParentEmail ||
      parentData.primaryParentEmail ||
      "",
    currentAddress: record.currentAddress || draft.currentAddress || "",
    permanentAddress: record.permanentAddress || draft.permanentAddress || "",
    selectedCourseKey:
      record.selectedCourseKey ||
      record.courseKey ||
      draft.selectedCourseKey ||
      course.key ||
      "",
    selectedCourseName:
      record.selectedCourseName ||
      record.courseName ||
      draft.selectedCourseName ||
      course.name ||
      "",
    selectedCourseFee:
      record.selectedCourseFee ||
      draft.selectedCourseFee ||
      course.price ||
      record.amount ||
      "",
    paymentType: record.paymentType || draft.paymentType || "",
    paymentStatus: normalizeAdminPaymentStatus(
      record.paymentStatus || record.status,
    ),
    paidAmount: record.paidAmount || draft.paidAmount || record.amount || "",
    paymentRemark: record.paymentRemark || draft.paymentRemark || "",
    dateOfRegistration:
      record.dateOfRegistration ||
      draft.dateOfRegistration ||
      record.createdAt?.toDate?.()?.toISOString?.().split("T")[0] ||
      "",
    createdAt: record.createdAt,
  };
};

const Page = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<
    Registration[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Registration;
    direction: "asc" | "desc";
  }>({
    key: "dateOfRegistration",
    direction: "desc",
  });
  const [exporting, setExporting] = useState(false);
  const [removingRegistrationId, setRemovingRegistrationId] = useState<
    string | null
  >(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const db = getFirestore(app);
      const registrationsCollection = collection(db, "registrations");
      const paymentsCollection = collection(db, "payments");

      const [registrationsSnapshot, paymentsSnapshot] = await Promise.all([
        getDocs(registrationsCollection),
        getDocs(paymentsCollection),
      ]);

      const registrationData = registrationsSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          data: doc.data() as FirestoreRecord,
        }))
        .filter(({ data }) => isStudentRegistrationRecord(data))
        .map(({ id, data }) => ({
          ...normalizeRegistration(data, id),
          firestoreId: id,
        }));

      const paymentFallbackData = paymentsSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          data: doc.data() as FirestoreRecord,
        }))
        .filter(({ data }) => isStudentRegistrationRecord(data))
        .map(({ id, data }) => ({
          ...normalizeRegistration(data, `payment-${id}`),
          paymentDocId: id,
        }));

      const mergedByOrder = new Map<string, Registration>();

      [...registrationData, ...paymentFallbackData].forEach((item) => {
        const itemKey = item.orderId || item.id;
        const existing = mergedByOrder.get(itemKey);
        mergedByOrder.set(
          itemKey,
          existing ? mergeRegistrationRecords(existing, item) : item,
        );
      });

      const merged = Array.from(mergedByOrder.values());

      setRegistrations(merged);
      setFilteredRegistrations(merged);
    } catch {
      setError("Failed to load registrations. Please try again later.");
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
      (reg) =>
        reg.studentName?.toLowerCase().includes(term) ||
        reg.primaryParentName?.toLowerCase().includes(term) ||
        reg.schoolName?.toLowerCase().includes(term) ||
        reg.dateOfRegistration?.toLowerCase().includes(term) ||
        reg.selectedCourseName?.toLowerCase().includes(term) ||
        reg.paymentType?.toLowerCase().includes(term) ||
        reg.paymentStatus?.toLowerCase().includes(term) ||
        reg.paymentRemark?.toLowerCase().includes(term),
    );
    setFilteredRegistrations(filtered);
    setCurrentPage(1);
  }, [searchTerm, registrations]);

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

  const handleSort = (key: keyof Registration) => {
    setSortConfig((prev) =>
      prev?.key === key && prev.direction === "asc"
        ? { key, direction: "desc" }
        : { key, direction: "asc" },
    );
  };

  const handleRemoveRegistration = useCallback(
    async (registration: Registration) => {
      const hasRegistrationDoc = Boolean(registration.firestoreId);
      const hasPaymentReference = Boolean(
        registration.paymentDocId || registration.orderId,
      );

      if (!hasRegistrationDoc && !hasPaymentReference) {
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to remove ${
          registration.studentName || "this registration"
        }? This action cannot be undone.`,
      );

      if (!confirmed) {
        return;
      }

      const db = getFirestore(app);
      setRemovingRegistrationId(registration.id);

      try {
        const deletions: Promise<void>[] = [];

        if (registration.firestoreId) {
          deletions.push(
            deleteDoc(doc(db, "registrations", registration.firestoreId)),
          );
        }

        if (registration.paymentDocId) {
          deletions.push(
            deleteDoc(doc(db, "payments", registration.paymentDocId)),
          );
        } else if (registration.orderId) {
          const paymentsQuery = query(
            collection(db, "payments"),
            where("orderId", "==", registration.orderId),
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
      } catch (error) {
        console.error("Failed to remove registration:", error);
      } finally {
        setRemovingRegistrationId(null);
      }
    },
    [],
  );

  const handleStatusChange = useCallback(
    async (registration: Registration, nextStatus: string) => {
      setUpdatingStatusId(registration.id);

      try {
        const response = await fetch("/api/admin/registration-payment-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: registration.orderId,
            paymentDocId: registration.paymentDocId,
            firestoreId: registration.firestoreId,
            registrationType: "new",
            status: nextStatus,
          }),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to update registration status");
        }

        const updateRegistration = (item: Registration) =>
          item.id === registration.id
            ? {
                ...item,
                paymentStatus: data.paymentStatus,
              }
            : item;

        setRegistrations((current) => current.map(updateRegistration));
        setFilteredRegistrations((current) => current.map(updateRegistration));
      } catch (error) {
        console.error("Failed to update registration status:", error);
      } finally {
        setUpdatingStatusId(null);
      }
    },
    [],
  );

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Registrations");
      worksheet.columns = [
        { header: "Registration Date", key: "dateOfRegistration", width: 20 },
        { header: "Student Name", key: "studentName", width: 25 },
        { header: "Age", key: "currentAge", width: 10 },
        { header: "School", key: "schoolName", width: 25 },
        { header: "Class", key: "class", width: 10 },
        { header: "Primary Parent", key: "primaryParentName", width: 20 },
        { header: "Primary Contact", key: "primaryParentContact", width: 15 },
        { header: "Primary Email", key: "primaryParentEmail", width: 20 },
        { header: "Permanent Address", key: "permanentAddress", width: 25 },
        { header: "Course", key: "selectedCourseName", width: 25 },
        { header: "Course Fee", key: "selectedCourseFee", width: 15 },
        { header: "Payment Type", key: "paymentType", width: 15 },
        { header: "Payment Status", key: "paymentStatus", width: 18 },
        { header: " Amount", key: "paidAmount", width: 15 },
        { header: "Payment Remark", key: "paymentRemark", width: 30 },
      ];
      sortedRegistrations.forEach((reg) => worksheet.addRow(reg));
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "Registrations.xlsx");
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.max(
    1,
    Math.ceil(sortedRegistrations.length / itemsPerPage),
  );
  const paginated = sortedRegistrations.slice(
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
                    Student Registrations
                  </CardTitle>
                  <p className="text-red-100 text-sm">
                    {sortedRegistrations.length} total registrations
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:flex-initial sm:min-w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, school, course, or contact..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                <p className="text-gray-500">Loading registrations...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border-l-4 border-red-500 p-6 text-red-700">
                {error}
              </div>
            ) : paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 bg-white text-gray-400">
                <Search className="h-12 w-12 mb-3 opacity-30" />
                <p>No registrations found.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto border-t border-gray-100">
                  <Table className="w-full">
                    <TableHeader className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                      <TableRow>
                        {[
                          { key: "dateOfRegistration", label: "Date" },
                          { key: "studentName", label: "Name" },
                          { key: "currentAge", label: "Age" },
                          { key: "schoolName", label: "School" },
                          { key: "class", label: "Class" },
                          { key: "selectedCourseName", label: "Course" },
                          { key: "paymentType", label: "Payment Type" },
                          { key: "paymentStatus", label: "Payment Status" },
                          { key: "paidAmount", label: "Amount" },
                          { key: "paymentRemark", label: "Remark" },
                          { key: "primaryParentName", label: "Parent" },
                          { key: "primaryParentContact", label: "Contact" },
                          { key: "actions", label: "Actions" },
                        ].map((col) => (
                          <TableHead
                            key={col.label}
                            onClick={() => {
                              if (col.key === "actions") return;
                              handleSort(col.key as keyof Registration);
                            }}
                            className={`px-4 py-3 text-xs font-semibold text-gray-700 ${
                              col.key === "actions"
                                ? ""
                                : "cursor-pointer hover:bg-gray-100"
                            } transition-colors`}
                          >
                            <div className="flex items-center gap-2">
                              <span>{col.label}</span>
                              {col.key !== "actions" &&
                                sortConfig?.key === col.key &&
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
                      {paginated.map((reg, i) => (
                        <TableRow
                          key={reg.id}
                          className="border-b border-gray-100 hover:bg-red-50 transition-colors"
                        >
                          <TableCell className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                            {reg.dateOfRegistration || "-"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm font-medium text-gray-900">
                            {reg.studentName || "-"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-700">
                            {reg.currentAge || "-"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-700">
                            {reg.schoolName || "-"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-700">
                            {reg.class || "-"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              {reg.selectedCourseName || "-"}
                            </span>
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-700">
                            {reg.paymentType || "-"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm">
                            <Select
                              value={normalizeAdminPaymentStatus(reg.paymentStatus)}
                              onValueChange={(value) =>
                                handleStatusChange(reg, value)
                              }
                              disabled={updatingStatusId === reg.id}
                            >
                              <SelectTrigger
                                className={`w-[140px] border text-xs font-semibold shadow-none ${getPaymentStatusColor(
                                  reg.paymentStatus,
                                )}`}
                              >
                                <SelectValue>
                                  {updatingStatusId === reg.id
                                    ? "Updating..."
                                    : formatPaymentStatusLabel(reg.paymentStatus)}
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
                            {reg.paidAmount ?? "-"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                            {reg.paymentRemark || "-"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-700">
                            {reg.primaryParentName || "-"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm text-gray-700 font-mono ">
                            {reg.primaryParentContact || "-"}
                          </TableCell>
                          <TableCell className="px-4 py-3 text-sm">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveRegistration(reg)}
                              disabled={
                                removingRegistrationId === reg.id ||
                                (!reg.firestoreId &&
                                  !reg.paymentDocId &&
                                  !reg.orderId)
                              }
                              className="text-red-600 hover:bg-red-100 hover:text-red-700 transition-colors"
                            >
                              {removingRegistrationId === reg.id ? (
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
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                      className="border-gray-200 hover:bg-gray-100"
                    >
                      Prev
                    </Button>
                    <div className="flex gap-1">
                      {Array.from(
                        { length: totalPages },
                        (_, idx) => idx + 1,
                      ).map((n) => (
                        <Button
                          key={n}
                          size="sm"
                          variant={n === currentPage ? "default" : "outline"}
                          onClick={() => setCurrentPage(n)}
                          className={`min-w-10 ${
                            n === currentPage
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : "border-gray-200 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {n}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
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
