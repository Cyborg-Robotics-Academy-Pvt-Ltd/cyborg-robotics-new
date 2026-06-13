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
  ChevronDown,
  ChevronRight,
  ChevronUp,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { FaWhatsapp } from "react-icons/fa";
import { normalizePaymentStatus } from "@/lib/payment-status";
import { generateCompetitionHallTicketNumber } from "@/lib/codefest-registration-validation";

// ─── Types ────────────────────────────────────────────────────────────────────

type FirestoreTimestampLike = { toDate: () => Date };
type FirestoreRecord = Record<string, any>;
type RegistrationFilter =
  | "all"
  | "new"
  | "renewal"
  | "workshop"
  | "competition"
  | "other";

interface UnifiedRegistration {
  id: string;
  registrationType: Exclude<RegistrationFilter, "all">;
  firestoreId?: string;
  paymentDocId?: string;
  orderId?: string;
  dateOfRegistration?: string;
  createdAt?: FirestoreTimestampLike | string;
  name?: string;
  age?: string;
  schoolName?: string;
  className?: string;
  prn?: string;
  parentName?: string;
  email?: string;
  contact?: string;
  location?: string;
  address?: string;
  programName?: string;
  programDetail?: string;
  paymentType?: string;
  paymentStatus?: string;
  amount?: number | string;
  remark?: string;
  extraDetails?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 25, 50];
const STATUS_OPTIONS = ["FAILED", "PENDING", "SUCCESS", "CASH_PAY"] as const;

const FILTER_OPTIONS: Array<{ value: RegistrationFilter; label: string }> = [
  { value: "all", label: "All Registrations" },
  { value: "new", label: "New Registration" },
  { value: "renewal", label: "Renewal" },
  { value: "workshop", label: "Workshop Registration" },
  { value: "competition", label: "Competition Registration" },
  { value: "other", label: "Other" },
];

const TYPE_LABELS: Record<UnifiedRegistration["registrationType"], string> = {
  new: "New",
  renewal: "Renewal",
  workshop: "Workshop",
  competition: "Competition",
  other: "Other",
};

const TYPE_STYLES: Record<UnifiedRegistration["registrationType"], string> = {
  new: "bg-blue-100 text-blue-800",
  renewal: "bg-purple-100 text-purple-800",
  workshop: "bg-cyan-100 text-cyan-800",
  competition: "bg-orange-100 text-orange-800",
  other: "bg-slate-100 text-slate-800",
};

// ─── Helper: Expanded row field ───────────────────────────────────────────────

const Field = ({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value?: string | number;
  mono?: boolean;
  highlight?: boolean;
}) => {
  if (!value && value !== 0) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-medium">
        {label}
      </span>
      <span
        className={[
          "text-xs break-words",
          mono ? "font-mono" : "",
          highlight ? "text-emerald-700 font-semibold" : "text-gray-700",
        ].join(" ")}
      >
        {String(value)}
      </span>
    </div>
  );
};

// ─── Pure helpers ─────────────────────────────────────────────────────────────

const normalizeText = (value: unknown) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");

const pickFirstValue = <T,>(...values: T[]): T | undefined =>
  values.find((value) => {
    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim().length > 0;
    return true;
  });

const isFirestoreTimestampLike = (
  value: unknown,
): value is FirestoreTimestampLike =>
  typeof value === "object" &&
  value !== null &&
  "toDate" in value &&
  typeof (value as FirestoreTimestampLike).toDate === "function";

const normalizeAdminPaymentStatus = (status?: string | null) => {
  const raw = String(status || "")
    .trim()
    .toUpperCase();
  if (raw === "CASH_PAY" || raw === "CASH PAY" || raw === "CASH")
    return "CASH_PAY";
  if (raw === "NEW") return "PENDING";
  if (raw === "PENDING_PAYMENT") return "PENDING_PAYMENT";
  return normalizePaymentStatus(raw);
};

const getPaymentStatusColor = (status?: string) => {
  switch (normalizeAdminPaymentStatus(status)) {
    case "SUCCESS":
    case "CASH_PAY":
      return "bg-emerald-100 text-emerald-800";
    case "FAILED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-amber-100 text-amber-800";
  }
};

const formatPaymentStatusLabel = (paymentStatus?: string) => {
  const normalized = normalizeAdminPaymentStatus(paymentStatus);
  if (normalized === "CASH_PAY") return "Cash Pay";
  return normalized === "PENDING_PAYMENT"
    ? "PENDING"
    : normalized.replace(/_/g, " ");
};

const isWhatsAppFollowUpStatus = (paymentStatus?: string) => {
  const normalized = normalizeAdminPaymentStatus(paymentStatus);
  return (
    normalized === "FAILED" ||
    normalized === "PENDING" ||
    normalized === "PENDING_PAYMENT"
  );
};

const getWhatsAppPhoneNumber = (contact?: string) => {
  const digits = String(contact || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith("0"))
    return `91${digits.slice(1)}`;
  return digits;
};

const getWhatsAppFollowUpLink = (registration: UnifiedRegistration) => {
  const phoneNumber = getWhatsAppPhoneNumber(registration.contact);
  if (!phoneNumber) return "";

  const status = formatPaymentStatusLabel(
    registration.paymentStatus,
  ).toLowerCase();
  const studentName = registration.name || "your child";
  const programName = registration.programName || "the registration";
  const orderText = registration.orderId
    ? ` Order ID: ${registration.orderId}.`
    : "";
  const message = `Hi, this is Cyborg Robotics. We noticed that the payment for ${studentName} - ${programName} is ${status}.${orderText} Please send us a screenshot of the payment so we can verify it and mark your order as paid. Let us know if you need any help completing the payment.`;

  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
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

const getDisplayDate = (registration: UnifiedRegistration) => {
  if (isFirestoreTimestampLike(registration.createdAt)) {
    return registration.createdAt.toDate().toLocaleDateString("en-IN");
  }
  if (typeof registration.createdAt === "string") {
    const parsedDate = new Date(registration.createdAt);
    if (!Number.isNaN(parsedDate.getTime()))
      return parsedDate.toLocaleDateString("en-IN");
  }
  if (registration.dateOfRegistration) {
    const parsedDate = new Date(registration.dateOfRegistration);
    if (!Number.isNaN(parsedDate.getTime()))
      return parsedDate.toLocaleDateString("en-IN");
    return registration.dateOfRegistration;
  }
  return "-";
};

const getRegistrationDateValue = (registration: UnifiedRegistration) => {
  if (isFirestoreTimestampLike(registration.createdAt))
    return registration.createdAt.toDate().getTime();
  if (typeof registration.createdAt === "string") {
    const ts = new Date(registration.createdAt).getTime();
    if (!Number.isNaN(ts)) return ts;
  }
  if (!registration.dateOfRegistration) return Number.NEGATIVE_INFINITY;
  const parsed = new Date(registration.dateOfRegistration).getTime();
  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
};

const mergeRegistrationRecords = (
  base: UnifiedRegistration,
  incoming: UnifiedRegistration,
): UnifiedRegistration => {
  const merged = {
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
  };

  // Improved status merging: prefer terminal statuses (SUCCESS, FAILED) over PENDING
  const baseStatus = base.paymentStatus || "";
  const incomingStatus = incoming.paymentStatus || "";

  if (baseStatus === "SUCCESS" || baseStatus === "CHARGED") {
    merged.paymentStatus = baseStatus;
  } else if (incomingStatus === "SUCCESS" || incomingStatus === "CHARGED") {
    merged.paymentStatus = incomingStatus;
  } else if (baseStatus === "FAILED") {
    merged.paymentStatus = baseStatus;
  } else {
    merged.paymentStatus = incomingStatus || baseStatus;
  }

  // Same for amount: if we have a success status, make sure we have the amount
  if (merged.paymentStatus === "SUCCESS" || merged.paymentStatus === "CHARGED") {
    merged.amount = incoming.amount || base.amount;
  }

  return merged;
};

// ─── Normalizers ──────────────────────────────────────────────────────────────

const normalizeNewRegistration = (
  record: FirestoreRecord,
  id: string,
): UnifiedRegistration => {
  const draft = record.registrationDraft || {};
  const course = record.course || {};
  const studentData = record.studentData || {};
  const parentData = record.parentData || {};
  return {
    id,
    registrationType: "new",
    orderId: record.orderId || "",
    name:
      record.studentName ||
      draft.studentName ||
      studentData.studentName ||
      studentData.fullName ||
      "",
    age:
      String(
        pickFirstValue(
          record.currentAge,
          draft.currentAge,
          studentData.currentAge,
          "",
        ),
      ) || "",
    schoolName:
      record.schoolName || draft.schoolName || studentData.schoolName || "",
    className: record.class || draft.class || studentData.class || "",
    parentName:
      record.primaryParentName ||
      draft.primaryParentName ||
      parentData.primaryParentName ||
      "",
    email:
      record.primaryParentEmail ||
      record.parentEmail ||
      draft.primaryParentEmail ||
      parentData.primaryParentEmail ||
      "",
    contact:
      record.primaryParentContact ||
      record.parentPhone ||
      draft.primaryParentContact ||
      parentData.primaryParentContact ||
      "",
    location: record.location || draft.location || "",
    address:
      record.permanentAddress ||
      draft.permanentAddress ||
      record.currentAddress ||
      draft.currentAddress ||
      "",
    programName:
      record.selectedCourseName ||
      record.courseName ||
      draft.selectedCourseName ||
      course.name ||
      "",
    paymentType: record.paymentType || draft.paymentType || "",
    paymentStatus: normalizeAdminPaymentStatus(
      record.paymentStatus || record.status,
    ),
    amount:
      record.paidAmount ||
      draft.paidAmount ||
      record.amount ||
      record.selectedCourseFee ||
      draft.selectedCourseFee ||
      course.price ||
      "",
    remark: record.paymentRemark || draft.paymentRemark || record.remark || "",
    dateOfRegistration:
      record.dateOfRegistration ||
      draft.dateOfRegistration ||
      record.registrationDate ||
      record.createdAt?.toDate?.()?.toISOString?.().split("T")[0] ||
      "",
    createdAt: record.createdAt,
  };
};

const normalizeRenewal = (
  record: FirestoreRecord,
  id: string,
): UnifiedRegistration => {
  const paidAmount = pickFirstValue(
    record.paidAmount,
    record.amountPaid,
    record.amount,
    "",
  );
  const paymentStatus = pickFirstValue(
    record.paymentStatus,
    record.payment_status,
    record.status === "confirmed" ? "SUCCESS" : record.status,
    paidAmount ? "SUCCESS" : "PENDING",
  );
  return {
    id,
    registrationType: "renewal",
    orderId: record.orderId || "",
    name: record.studentName || "",
    prn:
      record.studentRegistrationNo ||
      record.studentPRN ||
      record.PrnNumber ||
      record.prnNumber ||
      record.prn ||
      "",
    schoolName: record.schoolName || "",
    className: record.class || "",
    parentName: record.primaryParentName || "",
    email: record.parentEmail || record.primaryParentEmail || "",
    contact: record.contactNumber || record.primaryParentContact || "",
    location: record.location || record.center || record.branch || "",
    programName:
      record.selectedCourseName ||
      record.courseName ||
      record.course ||
      record.courseType ||
      "Renewal",
    programDetail: [
      record.preferredDay
        ? `Day: ${Array.isArray(record.preferredDay) ? record.preferredDay.join(", ") : record.preferredDay}`
        : "",
      record.preferredTime || record.preferredBatch
        ? `Batch: ${record.preferredTime || record.preferredBatch}`
        : "",
    ]
      .filter(Boolean)
      .join(" | "),
    paymentType: record.paymentType || record.modeOfPayment || "",
    paymentStatus: normalizeAdminPaymentStatus(paymentStatus),
    amount: paidAmount || "",
    remark: record.paymentRemark || record.remark || "",
    dateOfRegistration: record.dateOfRegistration || record.dateOfJoining || "",
    createdAt: record.createdAt,
  };
};

const normalizeWorkshop = (
  record: FirestoreRecord,
  id: string,
): UnifiedRegistration => {
  const draft = record.workshopRegistrationDraft || {};
  const workshop = record.workshop || {};
  
  // Normalize status: treat "confirmed" as "SUCCESS" for display consistency
  const rawStatus = record.paymentStatus || record.status || "";
  const statusToNormalize = rawStatus.toLowerCase() === "confirmed" ? "SUCCESS" : rawStatus;

  const normalizedPaymentStatus = normalizeAdminPaymentStatus(
    statusToNormalize ||
      (record.paymentType === "booking-request" ||
      record.source === "workshops-page"
        ? "PENDING_PAYMENT"
        : "") ||
      "",
  );
  const paidAmount =
    record.paidAmount ??
    (normalizedPaymentStatus === "SUCCESS" ||
    normalizedPaymentStatus === "CHARGED"
      ? record.amount
      : "");
  return {
    id,
    registrationType: "workshop",
    orderId: record.orderId || "",
    name: record.childName || record.studentName || draft.childName || "",
    age: String(
      pickFirstValue(record.age, record.currentAge, draft.age, "") ?? "",
    ),
    email:
      record.email ||
      record.parentEmail ||
      record.primaryParentEmail ||
      draft.email ||
      "",
    contact:
      record.contactNumber ||
      record.parentPhone ||
      record.primaryParentContact ||
      draft.contactNumber ||
      "",
    location: [record.city || draft.city, record.area || draft.area]
      .filter(Boolean)
      .join(", "),
    programName:
      record.workshopName ||
      record.selectedCourseName ||
      record.courseName ||
      workshop.name ||
      "",
    paymentType: record.paymentType || "",
    paymentStatus: normalizedPaymentStatus,
    amount: paidAmount || record.workshopFee || workshop.fee || "",
    remark: record.paymentRemark || "",
    dateOfRegistration:
      record.dateOfRegistration ||
      record.createdAt?.toDate?.()?.toISOString?.().split("T")[0] ||
      "",
    createdAt: record.createdAt,
  };
};

const normalizeCompetition = (
  record: FirestoreRecord,
  id: string,
): UnifiedRegistration => {
  const draft = record.competitionRegistrationDraft || {};
  const competition = record.competition || {};
  
  // Normalize status: treat "confirmed" as "SUCCESS" for display consistency
  const rawStatus = record.paymentStatus || record.status || "";
  const statusToNormalize = rawStatus.toLowerCase() === "confirmed" ? "SUCCESS" : rawStatus;
  
  const normalizedPaymentStatus = normalizeAdminPaymentStatus(statusToNormalize);

  const hallTicket =
    record.hallTicketNumber ||
    record.competitionId ||
    draft.hallTicketNumber ||
    (record.orderId ? generateCompetitionHallTicketNumber(record.orderId) : "");
  const paidAmount =
    record.paidAmount ??
    (normalizedPaymentStatus === "SUCCESS" ||
    normalizedPaymentStatus === "CHARGED"
      ? record.amount
      : "");
  return {
    id,
    registrationType: "competition",
    orderId: record.orderId || "",
    name: record.fullName || record.studentName || draft.fullName || "",
    className: record.gradeClass || draft.gradeClass || "",
    schoolName: record.schoolName || draft.schoolName || "",
    parentName: record.parentGuardianName || draft.parentGuardianName || "",
    email:
      record.parentEmailAddress ||
      record.parentEmail ||
      record.primaryParentEmail ||
      draft.parentEmailAddress ||
      record.studentEmailAddress ||
      draft.studentEmailAddress ||
      "",
    contact:
      record.parentGuardianContactNumber ||
      record.parentPhone ||
      record.primaryParentContact ||
      draft.parentGuardianContactNumber ||
      "",
    location: record.cityState || draft.cityState || "",
    address:
      record.fullResidentialAddress || draft.fullResidentialAddress || "",
    programName:
      record.competitionName || record.courseName || competition.name || "",
    programDetail: hallTicket ? `Hall Ticket: ${hallTicket}` : "",
    paymentType: record.paymentType || "",
    paymentStatus: normalizedPaymentStatus,
    amount: paidAmount || record.registrationFee || competition.fee || "",
    remark: record.paymentRemark || "",
    extraDetails: [
      record.deviceAvailableForCompetition ||
      draft.deviceAvailableForCompetition
        ? `Device: ${record.deviceAvailableForCompetition || draft.deviceAvailableForCompetition}`
        : "",
      record.preferredCodingPlatform || draft.preferredCodingPlatform
        ? `Platform: ${record.preferredCodingPlatform || draft.preferredCodingPlatform}`
        : "",
    ]
      .filter(Boolean)
      .join(" | "),
    dateOfRegistration:
      record.dateOfRegistration ||
      record.createdAt?.toDate?.()?.toISOString?.().split("T")[0] ||
      "",
    createdAt: record.createdAt,
  };
};

const normalizeOther = (
  record: FirestoreRecord,
  id: string,
): UnifiedRegistration => ({
  id,
  registrationType: "other",
  orderId: record.orderId || "",
  name: record.studentName || "",
  programName:
    record.selectedCourseName || record.courseName || record.course || "Other",
  paymentType: record.paymentType || "other",
  paymentStatus: normalizeAdminPaymentStatus(
    record.paymentStatus || record.status || "PENDING",
  ),
  amount: record.paidAmount || record.amount || "",
  remark: record.paymentRemark || record.remark || "",
  dateOfRegistration:
    record.dateOfRegistration ||
    record.createdAt?.toDate?.()?.toISOString?.().split("T")[0] ||
    "",
  createdAt: record.createdAt,
});

// ─── Page Component ───────────────────────────────────────────────────────────

const Page = () => {
  const [registrations, setRegistrations] = useState<UnifiedRegistration[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<RegistrationFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [exporting, setExporting] = useState(false);
  const [removingRegistrationId, setRemovingRegistrationId] = useState<
    string | null
  >(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof UnifiedRegistration;
    direction: "asc" | "desc";
  }>({ key: "dateOfRegistration", direction: "desc" });

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const firestore = getFirestore(app);
      const [
        registrationsSnapshot,
        renewalsSnapshot,
        otherRegistrationsSnapshot,
        workshopRegistrationsSnapshot,
        competitionRegistrationsSnapshot,
        paymentsSnapshot,
      ] = await Promise.all([
        getDocs(collection(firestore, "registrations")),
        getDocs(collection(firestore, "renewals")),
        getDocs(collection(firestore, "otherRegistrations")),
        getDocs(collection(firestore, "workshopRegistrations")),
        getDocs(collection(firestore, "competitionRegistrations")),
        getDocs(collection(firestore, "payments")),
      ]);

      const rows: UnifiedRegistration[] = [];
      const mergedByTypeAndOrder = new Map<string, UnifiedRegistration>();

      const appendMerged = (item: UnifiedRegistration) => {
        const key = `${item.registrationType}-${item.orderId || item.id}`;
        const existing = mergedByTypeAndOrder.get(key);
        mergedByTypeAndOrder.set(
          key,
          existing ? mergeRegistrationRecords(existing, item) : item,
        );
      };

      registrationsSnapshot.docs
        .map((entry) => ({
          id: entry.id,
          data: entry.data() as FirestoreRecord,
        }))
        .filter(({ data }) => isStudentRegistrationRecord(data))
        .forEach(({ id, data }) =>
          appendMerged({
            ...normalizeNewRegistration(data, id),
            firestoreId: id,
          }),
        );

      renewalsSnapshot.docs.forEach((entry) => {
        rows.push({
          ...normalizeRenewal(entry.data() as FirestoreRecord, entry.id),
          firestoreId: entry.id,
        });
      });

      otherRegistrationsSnapshot.docs.forEach((entry) => {
        rows.push({
          ...normalizeOther(entry.data() as FirestoreRecord, entry.id),
          firestoreId: entry.id,
        });
      });

      workshopRegistrationsSnapshot.docs.forEach((entry) =>
        appendMerged({
          ...normalizeWorkshop(entry.data() as FirestoreRecord, entry.id),
          firestoreId: entry.id,
        }),
      );

      competitionRegistrationsSnapshot.docs.forEach((entry) =>
        appendMerged({
          ...normalizeCompetition(entry.data() as FirestoreRecord, entry.id),
          firestoreId: entry.id,
        }),
      );

      paymentsSnapshot.docs.forEach((entry) => {
        const data = entry.data() as FirestoreRecord;
        if (data.paymentFlow === "workshop") {
          appendMerged({
            ...normalizeWorkshop(data, `payment-${entry.id}`),
            paymentDocId: entry.id,
          });
          return;
        }
        if (data.paymentFlow === "competition") {
          appendMerged({
            ...normalizeCompetition(data, `payment-${entry.id}`),
            paymentDocId: entry.id,
          });
          return;
        }
        if (data.paymentFlow === "other") {
          appendMerged({
            ...normalizeOther(data, `payment-${entry.id}`),
            paymentDocId: entry.id,
          });
          return;
        }
        if (isStudentRegistrationRecord(data)) {
          appendMerged({
            ...normalizeNewRegistration(data, `payment-${entry.id}`),
            paymentDocId: entry.id,
          });
        }
      });

      setRegistrations([...Array.from(mergedByTypeAndOrder.values()), ...rows]);
    } catch (fetchError) {
      console.error("Error fetching unified registrations:", fetchError);
      setError("Failed to load registrations. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // ── Derived data ───────────────────────────────────────────────────────────

  const filteredRegistrations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return registrations.filter((registration) => {
      const matchesType =
        activeFilter === "all" ||
        registration.registrationType === activeFilter;
      if (!matchesType) return false;
      if (!term) return true;
      return [
        registration.name,
        registration.prn,
        registration.parentName,
        registration.email,
        registration.contact,
        registration.schoolName,
        registration.className,
        registration.location,
        registration.programName,
        registration.programDetail,
        registration.paymentStatus,
        registration.orderId,
        registration.remark,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [activeFilter, registrations, searchTerm]);

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

  const totalPages = Math.max(
    1,
    Math.ceil(sortedRegistrations.length / itemsPerPage),
  );

  const paginatedRegistrations = sortedRegistrations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchTerm]);
  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSort = (key: keyof UnifiedRegistration) => {
    setSortConfig((prev) =>
      prev.key === key && prev.direction === "asc"
        ? { key, direction: "desc" }
        : { key, direction: "asc" },
    );
  };

  const handleRowClick = (id: string, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("select, button")) return;
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  const handleRemoveRegistration = useCallback(
    async (registration: UnifiedRegistration) => {
      const confirmed = window.confirm(
        `Are you sure you want to remove ${registration.name || "this registration"}? This action cannot be undone.`,
      );
      if (!confirmed) return;

      const firestore = getFirestore(app);
      setRemovingRegistrationId(registration.id);
      try {
        const deletions: Promise<void>[] = [];
        if (registration.firestoreId) {
          const collectionName =
            registration.registrationType === "new"
              ? "registrations"
              : registration.registrationType === "renewal"
                ? "renewals"
                : registration.registrationType === "workshop"
                  ? "workshopRegistrations"
                  : registration.registrationType === "competition"
                    ? "competitionRegistrations"
                    : "otherRegistrations";
          deletions.push(
            deleteDoc(doc(firestore, collectionName, registration.firestoreId)),
          );
        }
        if (registration.paymentDocId) {
          deletions.push(
            deleteDoc(doc(firestore, "payments", registration.paymentDocId)),
          );
        } else if (
          registration.orderId &&
          registration.registrationType !== "renewal"
        ) {
          const paymentsQuery = query(
            collection(firestore, "payments"),
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
        if (expandedRowId === registration.id) setExpandedRowId(null);
      } catch (removeError) {
        console.error("Failed to remove registration:", removeError);
      } finally {
        setRemovingRegistrationId(null);
      }
    },
    [expandedRowId],
  );

  const handleStatusChange = useCallback(
    async (registration: UnifiedRegistration, nextStatus: string) => {
      setUpdatingStatusId(registration.id);
      try {
        const response = await fetch("/api/admin/registration-payment-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: registration.orderId,
            paymentDocId: registration.paymentDocId,
            firestoreId: registration.firestoreId,
            registrationType: registration.registrationType,
            status: nextStatus,
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.success)
          throw new Error(
            data.message || "Failed to update registration status",
          );
        setRegistrations((current) =>
          current.map((item) =>
            item.id === registration.id
              ? { ...item, paymentStatus: data.paymentStatus }
              : item,
          ),
        );
      } catch (statusError) {
        console.error("Failed to update registration status:", statusError);
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
        { header: "Type", key: "type", width: 18 },
        { header: "Date", key: "date", width: 18 },
        { header: "Name", key: "name", width: 24 },
        { header: "PRN / Class", key: "classInfo", width: 18 },
        { header: "School", key: "schoolName", width: 28 },
        { header: "Program", key: "programName", width: 30 },
        { header: "Program Detail", key: "programDetail", width: 30 },
        { header: "Parent", key: "parentName", width: 24 },
        { header: "Email", key: "email", width: 28 },
        { header: "Contact", key: "contact", width: 18 },
        { header: "Location", key: "location", width: 24 },
        { header: "Payment Type", key: "paymentType", width: 18 },
        { header: "Payment Status", key: "paymentStatus", width: 18 },
        { header: "Amount", key: "amount", width: 14 },
        { header: "Order ID", key: "orderId", width: 24 },
        { header: "Remark", key: "remark", width: 30 },
      ];
      sortedRegistrations.forEach((registration) => {
        worksheet.addRow({
          type: TYPE_LABELS[registration.registrationType],
          date: getDisplayDate(registration),
          name: registration.name || "",
          classInfo:
            registration.prn ||
            [
              registration.age ? `Age ${registration.age}` : "",
              registration.className,
            ]
              .filter(Boolean)
              .join(" / "),
          schoolName: registration.schoolName || "",
          programName: registration.programName || "",
          programDetail:
            [registration.programDetail, registration.extraDetails]
              .filter(Boolean)
              .join(" | ") || "",
          parentName: registration.parentName || "",
          email: registration.email || "",
          contact: registration.contact || "",
          location: registration.location || "",
          paymentType: registration.paymentType || "",
          paymentStatus: formatPaymentStatusLabel(registration.paymentStatus),
          amount: registration.amount || "",
          orderId: registration.orderId || "",
          remark: registration.remark || "",
        });
      });
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "Registrations.xlsx");
    } finally {
      setExporting(false);
    }
  };

  // ── Sort columns config ────────────────────────────────────────────────────

  const tableColumns: Array<{
    key: string;
    label: string;
    sortable?: keyof UnifiedRegistration;
    width?: string;
  }> = [
    {
      key: "registrationType",
      label: "Type",
      sortable: "registrationType",
      width: "w-[100px]",
    },
    {
      key: "dateOfRegistration",
      label: "Date",
      sortable: "dateOfRegistration",
      width: "w-[90px]",
    },
    {
      key: "studentInfo",
      label: "Student / Participant",
      sortable: "name",
      width: "w-[200px]",
    },
    {
      key: "programName",
      label: "Program",
      sortable: "programName",
      width: "min-w-[180px]",
    },
    {
      key: "payment",
      label: "Payment",
      sortable: "paymentStatus",
      width: "w-[190px]",
    },
    { key: "amount", label: "Amount", sortable: "amount", width: "w-[90px]" },
    { key: "actions", label: "", width: "w-[48px]" },
  ];

  const SortIcon = ({ col }: { col: keyof UnifiedRegistration }) =>
    sortConfig.key === col ? (
      sortConfig.direction === "asc" ? (
        <ChevronUp size={13} className="text-red-600 shrink-0" />
      ) : (
        <ChevronDown size={13} className="text-red-600 shrink-0" />
      )
    ) : null;

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 px-4 py-8"
    >
      <div className="mx-auto max-w-7xl">
        <Card className="overflow-hidden rounded-2xl border-0 shadow-lg">
          {/* ── Header ── */}
          <CardHeader className="border-b-0 bg-gradient-to-r from-red-900 to-red-800 px-6 py-8">
            <div className="flex flex-col gap-6">
              <div>
                <CardTitle className="mb-1 text-3xl font-bold text-white">
                  Registrations
                </CardTitle>
                <p className="text-sm text-red-100">
                  {sortedRegistrations.length} registrations shown
                </p>
              </div>

              <div className="flex flex-col gap-3 xl:flex-row">
                {/* Search */}
                <div className="relative flex-1 xl:min-w-96 xl:flex-initial">
                  <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by name, contact, school, program, PRN, or order..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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

                {/* Filter */}
                <Select
                  value={activeFilter}
                  onValueChange={(value) =>
                    setActiveFilter(value as RegistrationFilter)
                  }
                >
                  <SelectTrigger className="h-11 w-full rounded-lg border-gray-200 bg-white text-gray-700 sm:w-52">
                    <SelectValue placeholder="Filter registrations" />
                  </SelectTrigger>
                  <SelectContent>
                    {FILTER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Actions */}
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

          {/* ── Body ── */}
          <CardContent className="p-0">
            {loading ? (
              <div className="flex h-64 flex-col items-center justify-center bg-white">
                <Loader2 className="mb-3 h-8 w-8 animate-spin text-red-600" />
                <p className="text-gray-500">Loading registrations...</p>
              </div>
            ) : error ? (
              <div className="border-l-4 border-red-500 bg-red-50 p-6 text-red-700">
                {error}
              </div>
            ) : paginatedRegistrations.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center bg-white text-gray-400">
                <Search className="mb-3 h-12 w-12 opacity-30" />
                <p>No registrations found.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto border-t border-gray-100">
                  <Table className="w-full">
                    {/* ── Table Head ── */}
                    <TableHeader className="sticky top-0 z-10 border-b border-gray-200 bg-gray-50">
                      <TableRow>
                        {tableColumns.map((col) => (
                          <TableHead
                            key={col.key}
                            onClick={() =>
                              col.sortable && handleSort(col.sortable)
                            }
                            className={[
                              "px-4 py-3 text-xs font-semibold text-gray-700",
                              col.sortable
                                ? "cursor-pointer transition-colors hover:bg-gray-100"
                                : "",
                              col.width ?? "",
                            ].join(" ")}
                          >
                            <div className="flex items-center gap-1.5">
                              <span>{col.label}</span>
                              {col.sortable && <SortIcon col={col.sortable} />}
                            </div>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>

                    {/* ── Table Body ── */}
                    <TableBody>
                      {paginatedRegistrations.map((registration) => {
                        const rowKey = `${registration.registrationType}-${registration.id}`;
                        const isExpanded = expandedRowId === registration.id;
                        const whatsAppFollowUpLink = isWhatsAppFollowUpStatus(
                          registration.paymentStatus,
                        )
                          ? getWhatsAppFollowUpLink(registration)
                          : "";

                        return (
                          <React.Fragment key={rowKey}>
                            {/* Main row */}
                            <TableRow
                              onClick={(e) =>
                                handleRowClick(registration.id, e)
                              }
                              className={[
                                "cursor-pointer border-b border-gray-100 transition-colors hover:bg-red-50",
                                isExpanded ? "bg-red-50" : "",
                              ].join(" ")}
                            >
                              {/* Type */}
                              <TableCell className="whitespace-nowrap px-4 py-3 text-sm">
                                <span
                                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${TYPE_STYLES[registration.registrationType]}`}
                                >
                                  {TYPE_LABELS[registration.registrationType]}
                                </span>
                              </TableCell>

                              {/* Date */}
                              <TableCell className="whitespace-nowrap px-4 py-3 text-xs text-gray-600">
                                {getDisplayDate(registration)}
                              </TableCell>

                              {/* Student */}
                              <TableCell className="px-4 py-3">
                                <div className="flex items-start gap-2">
                                  <span className="mt-0.5 shrink-0 text-gray-400 transition-transform duration-200">
                                    <ChevronRight
                                      size={14}
                                      className={`transition-transform duration-200 ${isExpanded ? "rotate-90 text-red-600" : ""}`}
                                    />
                                  </span>
                                  <div className="min-w-0">
                                    <p className="truncate font-medium text-gray-900 text-sm">
                                      {registration.name || "—"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {registration.prn
                                        ? `PRN: ${registration.prn}`
                                        : [
                                            registration.age
                                              ? `Age: ${registration.age}`
                                              : "",
                                            registration.className
                                              ? `Class: ${registration.className}`
                                              : "",
                                          ]
                                            .filter(Boolean)
                                            .join(" · ") || "—"}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>

                              {/* Program */}
                              <TableCell className="px-4 py-3">
                                <p className="font-medium text-gray-900 text-sm truncate max-w-[200px]">
                                  {registration.programName || "—"}
                                </p>
                                {registration.programDetail && (
                                  <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">
                                    {registration.programDetail}
                                  </p>
                                )}
                              </TableCell>

                              {/* Payment */}
                              <TableCell className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <Select
                                    value={normalizeAdminPaymentStatus(
                                      registration.paymentStatus,
                                    )}
                                    onValueChange={(value) =>
                                      handleStatusChange(registration, value)
                                    }
                                    disabled={
                                      updatingStatusId === registration.id
                                    }
                                  >
                                    <SelectTrigger
                                      className={`w-[130px] border text-xs font-semibold shadow-none ${getPaymentStatusColor(registration.paymentStatus)}`}
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
                                  {whatsAppFollowUpLink && (
                                    <Button
                                      asChild
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 rounded-full bg-emerald-50 p-0 text-emerald-600 transition-colors hover:bg-emerald-100 hover:text-emerald-700"
                                      aria-label="Message on WhatsApp"
                                      title="Message on WhatsApp"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <a
                                        href={whatsAppFollowUpLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <FaWhatsapp className="h-4 w-4" />
                                      </a>
                                    </Button>
                                  )}
                                </div>
                                <p className="text-[11px] text-gray-400 mt-1.5">
                                  {registration.paymentType || "—"}
                                </p>
                              </TableCell>

                              {/* Amount */}
                              <TableCell className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-emerald-700">
                                {registration.amount
                                  ? `₹${Number(registration.amount).toLocaleString("en-IN")}`
                                  : "—"}
                              </TableCell>

                              {/* Delete */}
                              <TableCell className="px-3 py-3 text-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveRegistration(registration);
                                  }}
                                  disabled={
                                    removingRegistrationId ===
                                      registration.id ||
                                    (!registration.firestoreId &&
                                      !registration.paymentDocId &&
                                      !registration.orderId)
                                  }
                                  className="text-red-500 transition-colors hover:bg-red-100 hover:text-red-700"
                                >
                                  {removingRegistrationId ===
                                  registration.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                            </TableRow>

                            {/* Expanded detail row */}
                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <TableRow
                                  key={`${rowKey}-expand`}
                                  className="bg-slate-50 hover:bg-slate-50"
                                >
                                  <TableCell
                                    colSpan={7}
                                    className="p-0 border-b border-gray-200"
                                  >
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{
                                        duration: 0.2,
                                        ease: "easeInOut",
                                      }}
                                      className="overflow-hidden"
                                    >
                                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-4 px-12 py-5 border-l-4 border-red-700">
                                        <Field
                                          label="School"
                                          value={registration.schoolName}
                                        />
                                        <Field
                                          label="Parent / Guardian"
                                          value={registration.parentName}
                                        />
                                        <Field
                                          label="Email"
                                          value={registration.email}
                                        />
                                        <Field
                                          label="Contact"
                                          value={registration.contact}
                                          mono
                                        />
                                        <Field
                                          label="Location"
                                          value={registration.location}
                                        />
                                        <Field
                                          label="Address"
                                          value={registration.address}
                                        />
                                        <Field
                                          label="Order ID"
                                          value={registration.orderId}
                                          mono
                                        />
                                        <Field
                                          label="Amount"
                                          value={
                                            registration.amount
                                              ? `₹${Number(registration.amount).toLocaleString("en-IN")}`
                                              : undefined
                                          }
                                          highlight
                                        />
                                        <Field
                                          label="Payment Type"
                                          value={registration.paymentType}
                                        />
                                        <Field
                                          label="Remark"
                                          value={registration.remark}
                                        />
                                        {registration.extraDetails && (
                                          <Field
                                            label="Extra Details"
                                            value={registration.extraDetails}
                                          />
                                        )}
                                      </div>
                                    </motion.div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </AnimatePresence>
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* ── Pagination ── */}
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

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      First
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </Button>
                    <span className="rounded-md bg-red-100 px-3 py-1 text-sm font-semibold text-red-800">
                      {currentPage} / {totalPages}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Last
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
