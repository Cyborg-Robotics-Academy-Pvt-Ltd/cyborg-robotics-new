"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { app } from "../../../../firebaseConfig";
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
  Search,
  Loader2,
  ChevronUp,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface Registration {
  id: string;
  studentName?: string;
  dateOfBirth?: string;
  currentAge?: string;
  schoolName?: string;
  class?: string;
  board?: string;
  fatherName?: string;
  fatherContact?: string;
  fatherEmail?: string;
  motherName?: string;
  motherContact?: string;
  motherEmail?: string;
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
  preferredDay?: string | string[];
  preferredTime?: string;
  studentRegistrationNo?: string;
  contactNumber?: string;
  dateOfRegistration?: string;
  location?: string;
}

const ITEMS_PER_PAGE = 10;

const Page = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<
    Registration[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Registration;
    direction: "asc" | "desc";
  } | null>({ key: "dateOfRegistration", direction: "desc" });

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const db = getFirestore(app);
      const registrationsCollection = collection(db, "renewals");
      const registrationsSnapshot = await getDocs(registrationsCollection);
      const registrationsList = registrationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Registration, "id">),
      }));
      setRegistrations(registrationsList);
      setFilteredRegistrations(registrationsList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching registrations:", err);
      setError("Failed to load registrations. Please try again later.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredRegistrations(registrations);
      setCurrentPage(1);
      return;
    }
    const lowercasedSearch = searchTerm.toLowerCase();
    const filtered = registrations.filter(
      (reg) =>
        reg.studentName?.toLowerCase().includes(lowercasedSearch) ||
        reg.fatherName?.toLowerCase().includes(lowercasedSearch) ||
        reg.motherName?.toLowerCase().includes(lowercasedSearch) ||
        reg.schoolName?.toLowerCase().includes(lowercasedSearch)
    );
    setFilteredRegistrations(filtered);
    setCurrentPage(1);
  }, [searchTerm, registrations]);

  const sortedRegistrations = useMemo(() => {
    if (!sortConfig) return filteredRegistrations;

    const dateKeys = new Set<keyof Registration>([
      "dateOfRegistration",
      "dateOfJoining",
      "dateOfBirth",
    ]);

    type ValueWithToDate = { toDate: () => Date };

    const hasToDate = (v: unknown): v is ValueWithToDate => {
      return (
        typeof v === "object" &&
        v !== null &&
        "toDate" in (v as Record<string, unknown>) &&
        typeof (v as ValueWithToDate).toDate === "function"
      );
    };

    const getTimeValue = (value: unknown): number | null => {
      if (!value) return null;
      // Firestore Timestamp-like object
      if (hasToDate(value)) {
        try {
          return value.toDate().getTime();
        } catch {
          return null;
        }
      }
      // String date
      if (typeof value === "string") {
        const t = Date.parse(value);
        return Number.isNaN(t) ? null : t;
      }
      return null;
    };

    const toStringValue = (value: unknown): string => {
      if (value == null) return "";
      if (Array.isArray(value)) return value.join(", ");
      return String(value);
    };

    const sorted = [...filteredRegistrations].sort((a, b) => {
      const aRaw = a[sortConfig.key as keyof Registration];
      const bRaw = b[sortConfig.key as keyof Registration];

      if (dateKeys.has(sortConfig.key)) {
        const aTime = getTimeValue(aRaw) ?? -Infinity;
        const bTime = getTimeValue(bRaw) ?? -Infinity;
        return sortConfig.direction === "asc" ? aTime - bTime : bTime - aTime;
      }

      const aStr = toStringValue(aRaw);
      const bStr = toStringValue(bRaw);
      return sortConfig.direction === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
    return sorted;
  }, [filteredRegistrations, sortConfig]);

  const handleSort = (key: keyof Registration) => {
    setSortConfig((prev) => {
      if (prev?.key === key && prev.direction === "asc") {
        return { key, direction: "desc" };
      }
      return { key, direction: "asc" };
    });
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Registrations");
    worksheet.columns = [
      { header: "ADD DATE", key: "dateOfRegistration", width: 20 },
      {
        header: "Student Registration No.",
        key: "studentRegistrationNo",
        width: 25,
      },
      { header: "Student Name", key: "studentName", width: 20 },
      { header: "Contact No.", key: "contactNumber", width: 15 },
      { header: "Preferred Day", key: "preferredDay", width: 15 },
      { header: "Preferred Batch", key: "preferredTime", width: 20 },
      { header: "Date of Joining", key: "dateOfJoining", width: 15 },
      { header: "Location", key: "location", width: 15 },
      { header: "Duration (Hrs)", key: "duration", width: 15 },
      { header: "No. of Sessions", key: "sessions", width: 15 },
      { header: "Registration Fees", key: "registrationFees", width: 20 },
      { header: "Course Fees", key: "courseFees", width: 15 },
      { header: "Amount Paid", key: "amountPaid", width: 15 },
      { header: "Balance Amount", key: "balanceAmount", width: 15 },
      { header: "Mode of Payment", key: "modeOfPayment", width: 20 },
      { header: "Accepted By", key: "acceptedBy", width: 15 },
      { header: "Remark", key: "remark", width: 20 },
      { header: "Trainers", key: "trainers", width: 20 },
    ];
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF991B1B" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
    });
    sortedRegistrations.forEach((reg) => {
      const formatted = {
        ...reg,
        preferredDay: Array.isArray(reg.preferredDay)
          ? reg.preferredDay.join(", ")
          : reg.preferredDay || "",
      };
      worksheet.addRow(formatted);
    });
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "Student_Registrations.xlsx");
  };

  const totalPages = Math.ceil(sortedRegistrations.length / ITEMS_PER_PAGE);
  const paginatedRegistrations = sortedRegistrations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="container mx-auto px-4 py-12 max-w-full "
    >
      <Card className="shadow-lg border rounded-2xl overflow-hidden bg-white">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-red-800 via-red-700 to-red-600 p-6 shadow-md">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <CardTitle className="text-3xl font-extrabold text-white tracking-tight">
              Student Renewal
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white" />
                <Input
                  className="pl-12 pr-4 py-3 rounded-full border-slate-200 focus:ring-4 focus:ring-red-400/50 focus:border-red-500 transition-all duration-300 text-base shadow-lg placeholder:text-white text-white"
                  placeholder="Search by name or school..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={fetchRegistrations}
                  className="flex items-center gap-2 bg-white text-red-800 font-semibold px-5 py-3 rounded-full shadow hover:bg-red-50"
                  disabled={loading}
                >
                  <RefreshCw
                    className={`${loading ? "animate-spin" : ""} h-5 w-5`}
                  />{" "}
                  Refresh
                </Button>
                <Button
                  onClick={exportToExcel}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-3 rounded-full shadow"
                  disabled={loading || sortedRegistrations.length === 0}
                >
                  📊 Export
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center p-12 bg-slate-50">
              <Loader2 className="h-10 w-10 animate-spin text-red-800" />
              <span className="ml-3 text-lg text-slate-600 font-medium">
                Loading registrations...
              </span>
            </div>
          ) : error ? (
            <div className="p-10 text-center text-red-500 text-lg font-medium bg-red-50 rounded-b-2xl">
              {error}
            </div>
          ) : (
            <div>
              <Table>
                <TableHeader className="bg-slate-100 sticky top-0 z-20 shadow-sm">
                  <TableRow>
                    {[
                      { key: "dateOfRegistration", label: "ADD DATE" },
                      { key: "studentName", label: "Student Name" },
                      {
                        key: "studentRegistrationNo",
                        label: "Registration No.",
                      },
                      { key: "contactNumber", label: "Contact Number" },
                      { key: "location", label: "Location" },
                      { key: "preferredDay", label: "Preferred Day" },
                      { key: "preferredTime", label: "Preferred Batch" },
                    ].map((col) => (
                      <TableHead
                        key={col.key}
                        onClick={() =>
                          handleSort(col.key as keyof Registration)
                        }
                        className="py-4 px-3 text-sm font-bold uppercase tracking-wide cursor-pointer hover:bg-slate-200 transition select-none"
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          {sortConfig?.key === col.key &&
                            (sortConfig.direction === "asc" ? (
                              <ChevronUp className="h-4 w-4 text-red-700" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-red-700" />
                            ))}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRegistrations.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-10 text-slate-500"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <img
                            src="/no-data.svg"
                            alt="No data"
                            className="h-24"
                          />
                          <p>No registrations found.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRegistrations.map((reg, idx) => (
                      <TableRow
                        key={reg.id}
                        className={`transition-colors duration-200 hover:bg-red-50 ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}`}
                      >
                        <TableCell>
                          {reg.dateOfRegistration
                            ? new Date(
                                reg.dateOfRegistration
                              ).toLocaleDateString()
                            : "-"}
                        </TableCell>
                        <TableCell className="font-medium">
                          {reg.studentName || "-"}
                        </TableCell>
                        <TableCell>
                          {reg.studentRegistrationNo || "-"}
                        </TableCell>
                        <TableCell>{reg.contactNumber || "-"}</TableCell>
                        <TableCell>{reg.location || "-"}</TableCell>
                        <TableCell>
                          {Array.isArray(reg.preferredDay)
                            ? reg.preferredDay.join(", ")
                            : reg.preferredDay || "-"}
                        </TableCell>
                        <TableCell>{reg.preferredTime || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex flex-wrap justify-between items-center p-6 bg-slate-50 text-sm">
                <span className="font-medium text-slate-600">
                  Showing {paginatedRegistrations.length} of{" "}
                  {sortedRegistrations.length} registrations
                </span>
                {totalPages > 1 && (
                  <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full hover:bg-red-700 hover:text-white"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                    >
                      « First
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full hover:bg-red-700 hover:text-white"
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      ‹ Prev
                    </Button>
                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 font-bold">
                      {currentPage}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full hover:bg-red-700 hover:text-white"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(p + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next ›
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full hover:bg-red-700 hover:text-white"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                    >
                      Last »
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default Page;
