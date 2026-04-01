"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

type FirestoreTimestampLike = {
  toDate: () => Date;
};

type FirestoreRecord = Record<string, any>;

interface Registration {
  id: string;
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
  paidAmount?: number | string;
  paymentRemark?: string;
  createdAt?: FirestoreTimestampLike | string;
  orderId?: string;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50];

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
  const workshopDraft = record.workshopRegistrationDraft || {};
  const course = record.course || {};
  const studentData = record.studentData || {};
  const parentData = record.parentData || {};

  return {
    id,
    orderId: record.orderId,
    studentName:
      record.studentName ||
      draft.studentName ||
      workshopDraft.childName ||
      studentData.studentName ||
      studentData.fullName ||
      "",
    dateOfBirth: record.dateOfBirth || draft.dateOfBirth || studentData.dateOfBirth || "",
    currentAge:
      record.currentAge ||
      draft.currentAge ||
      workshopDraft.age ||
      studentData.currentAge ||
      "",
    schoolName: record.schoolName || draft.schoolName || studentData.schoolName || "",
    class: record.class || draft.class || studentData.class || "",
    board: record.board || draft.board || studentData.board || "",
    primaryParentType:
      record.primaryParentType || draft.primaryParentType || parentData.primaryParentType || "",
    primaryParentName:
      record.primaryParentName ||
      draft.primaryParentName ||
      parentData.primaryParentName ||
      "",
    primaryParentContact:
      record.primaryParentContact ||
      record.parentPhone ||
      workshopDraft.contactNumber ||
      draft.primaryParentContact ||
      parentData.primaryParentContact ||
      "",
    primaryParentEmail:
      record.primaryParentEmail ||
      record.parentEmail ||
      workshopDraft.email ||
      draft.primaryParentEmail ||
      parentData.primaryParentEmail ||
      "",
    currentAddress: record.currentAddress || draft.currentAddress || "",
    permanentAddress: record.permanentAddress || draft.permanentAddress || "",
    selectedCourseKey:
      record.selectedCourseKey || record.courseKey || draft.selectedCourseKey || course.key || "",
    selectedCourseName:
      record.selectedCourseName || record.courseName || draft.selectedCourseName || course.name || "",
    selectedCourseFee:
      record.selectedCourseFee || draft.selectedCourseFee || course.price || record.amount || "",
    paymentType: record.paymentType || draft.paymentType || "",
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

      const registrationData = registrationsSnapshot.docs.map((doc) =>
        normalizeRegistration(doc.data() as FirestoreRecord, doc.id),
      );

      const paymentFallbackData = paymentsSnapshot.docs.map((doc) => {
        const payment = doc.data() as FirestoreRecord;
        return normalizeRegistration(payment, `payment-${doc.id}`);
      });

      const merged = [...registrationData, ...paymentFallbackData].filter(
        (item, index, array) => {
          const itemKey = item.orderId || item.id;
          return (
            index ===
            array.findIndex((entry) => (entry.orderId || entry.id) === itemKey)
          );
        },
      );

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
        { header: "Paid Amount", key: "paidAmount", width: 15 },
        { header: "Payment Remark", key: "paymentRemark", width: 30 },
      ];
      sortedRegistrations.forEach((reg) => worksheet.addRow(reg));
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "Registrations.xlsx");
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(sortedRegistrations.length / itemsPerPage));
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
      className="container mx-auto px-4 mt-20 "
    >
      <Card className="shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-red-900 via-red-800 to-red-700 p-6 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <CardTitle className="text-3xl font-bold text-white">
              Student Registrations
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-rose-700" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 rounded-full  bg-white   border-none shadow-sm "
                />
                {searchTerm && (
                  <X
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 cursor-pointer text-gray-400 hover:text-rose-600"
                  />
                )}
              </div>
              <Button
                onClick={fetchRegistrations}
                className="bg-red-800 hover:bg-red-900 text-white rounded-full flex items-center gap-2"
              >
                <RefreshCw
                  className={loading ? "animate-spin" : ""}
                  color="white"
                />{" "}
                Refresh
              </Button>
              <Button
                onClick={exportToExcel}
                disabled={exporting || sortedRegistrations.length === 0}
                className="bg-green-600 text-white hover:bg-green-700 rounded-full flex items-center gap-2"
              >
                <FileSpreadsheet color="white" />{" "}
                {exporting ? "Exporting..." : "Export"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-60 bg-gradient-to-r from-red-900 via-red-800 to-red-700">
              <Loader2 className="animate-spin h-8 w-8 text-rose-700" />
              <span className="ml-2 text-white">Loading...</span>
            </div>
          ) : error ? (
            <div className="text-center p-8 text-rose-700">{error}</div>
          ) : paginated.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              No registrations found.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                  <TableHeader className="bg-gradient-to-r from-red-900 via-red-800 to-red-700 text-white sticky top-0 z-10">
                    <TableRow>
                      {[
                        { key: "dateOfRegistration", label: "Date" },
                        { key: "studentName", label: "Name" },
                        { key: "currentAge", label: "Age" },
                        { key: "schoolName", label: "School" },
                        { key: "class", label: "Class" },
                        { key: "selectedCourseName", label: "Course" },
                        { key: "paymentType", label: "Payment Type" },
                        { key: "paidAmount", label: "Paid Amount" },
                        { key: "paymentRemark", label: "Payment Remark" },
                        { key: "primaryParentName", label: "Parent" },
                        { key: "primaryParentContact", label: "Contact" },
                      ].map((col) => (
                        <TableHead
                          key={col.label}
                          onClick={() =>
                            col.key && handleSort(col.key as keyof Registration)
                          }
                          className={`cursor-pointer px-4 py-3 ${
                            col.key === "dateOfRegistration" ? "w-28" : ""
                          }`}
                        >
                          <div className="flex items-center gap-1">
                            {col.label}
                            {sortConfig?.key === col.key &&
                              (sortConfig.direction === "asc" ? (
                                <ChevronUp size={14} />
                              ) : (
                                <ChevronDown size={14} />
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
                        className={`${i % 2 ? "bg-gray-50" : "bg-white"}`}
                      >
                        <TableCell className="min-w-32">
                          {reg.dateOfRegistration || "-"}
                        </TableCell>
                        <TableCell>{reg.studentName || "-"}</TableCell>
                        <TableCell>{reg.currentAge || "-"}</TableCell>
                        <TableCell>{reg.schoolName || "-"}</TableCell>
                        <TableCell>{reg.class || "-"}</TableCell>
                        <TableCell>{reg.selectedCourseName || "-"}</TableCell>
                        <TableCell>{reg.paymentType || "-"}</TableCell>
                        <TableCell>{reg.paidAmount ?? "-"}</TableCell>
                        <TableCell>{reg.paymentRemark || "-"}</TableCell>
                        <TableCell>{reg.primaryParentName || "-"}</TableCell>
                        <TableCell>{reg.primaryParentContact || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-col gap-4 p-4 bg-gradient-to-r from-red-900 via-red-800 to-red-700 text-white sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center">
                  <span>
                    Showing {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(
                      currentPage * itemsPerPage,
                      sortedRegistrations.length,
                    )} {""}
                    of {sortedRegistrations.length}
                  </span>
                  <Select
                    value={String(itemsPerPage)}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[140px] bg-white text-black">
                      <SelectValue placeholder="Rows per page" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size} / page
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
                  >
                    Prev
                  </Button>
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((n) => (
                    <Button
                      key={n}
                      size="sm"
                      variant={n === currentPage ? "default" : "outline"}
                      onClick={() => setCurrentPage(n)}
                      className="min-w-10"
                    >
                      {n}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(p + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Page;

