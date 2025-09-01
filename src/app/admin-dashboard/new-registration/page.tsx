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
  location?: string;
  preferredDay?: string;
  preferredTime?: string;
  studentRegistrationNo?: string;
  registrationDate?: string;
  dateOfRegistration?: string;
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
  } | null>(null);
  const [exporting, setExporting] = useState(false);

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const db = getFirestore(app);
      const registrationsCollection = collection(db, "registrations");
      const snapshot = await getDocs(registrationsCollection);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Registration, "id">),
      }));
      setRegistrations(data);
      setFilteredRegistrations(data);
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
        reg.fatherName?.toLowerCase().includes(term) ||
        reg.motherName?.toLowerCase().includes(term) ||
        reg.schoolName?.toLowerCase().includes(term) ||
        reg.registrationDate?.toLowerCase().includes(term) ||
        reg.dateOfRegistration?.toLowerCase().includes(term)
    );
    setFilteredRegistrations(filtered);
    setCurrentPage(1);
  }, [searchTerm, registrations]);

  const sortedRegistrations = useMemo(() => {
    if (!sortConfig) return filteredRegistrations;
    return [...filteredRegistrations].sort((a, b) => {
      const aValue = a[sortConfig.key] || "";
      const bValue = b[sortConfig.key] || "";
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  }, [filteredRegistrations, sortConfig]);

  const handleSort = (key: keyof Registration) => {
    setSortConfig((prev) =>
      prev?.key === key && prev.direction === "asc"
        ? { key, direction: "desc" }
        : { key, direction: "asc" }
    );
  };

  const exportToExcel = async () => {
    setExporting(true);
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Registrations");
      worksheet.columns = [
        { header: "Registration Date", key: "registrationDate", width: 20 },
        { header: "Student Name", key: "studentName", width: 25 },
        { header: "DOB", key: "dateOfBirth", width: 15 },
        { header: "Age", key: "currentAge", width: 10 },
        { header: "School", key: "schoolName", width: 25 },
        { header: "Class", key: "class", width: 10 },
        { header: "Board", key: "board", width: 15 },
        { header: "Father", key: "fatherName", width: 20 },
        { header: "Mother", key: "motherName", width: 20 },
      ];
      sortedRegistrations.forEach((reg) => worksheet.addRow(reg));
      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "Registrations.xlsx");
    } finally {
      setExporting(false);
    }
  };

  const totalPages = Math.ceil(sortedRegistrations.length / ITEMS_PER_PAGE);
  const paginated = sortedRegistrations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-12 mt-20"
    >
      <Card className="shadow-xl rounded-3xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-rose-100 to-pink-50 p-6 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <CardTitle className="text-3xl font-bold text-rose-800">
              Student Registrations
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-rose-700" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-10 rounded-full border border-rose-200 focus:ring-2 focus:ring-rose-500 shadow-sm"
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
                className="bg-rose-700 hover:bg-rose-800 rounded-full flex items-center gap-2"
              >
                <RefreshCw className={loading ? "animate-spin" : ""} /> Refresh
              </Button>
              <Button
                onClick={exportToExcel}
                disabled={exporting || sortedRegistrations.length === 0}
                className="bg-green-600 hover:bg-green-700 rounded-full flex items-center gap-2"
              >
                <FileSpreadsheet /> {exporting ? "Exporting..." : "Export"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-60 bg-rose-50">
              <Loader2 className="animate-spin h-8 w-8 text-rose-700" />
              <span className="ml-2 text-rose-700">Loading...</span>
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
                  <TableHeader className="bg-rose-100 sticky top-0 z-10">
                    <TableRow>
                      {[
                        { key: "registrationDate", label: "Date" },
                        { key: "studentName", label: "Name" },
                        { key: "dateOfBirth", label: "DOB" },
                        { key: "currentAge", label: "Age" },
                        { key: "schoolName", label: "School" },
                        { key: "class", label: "Class" },
                        { key: "board", label: "Board" },
                      ].map((col) => (
                        <TableHead
                          key={col.label}
                          onClick={() =>
                            col.key && handleSort(col.key as keyof Registration)
                          }
                          className="cursor-pointer hover:bg-rose-200 px-4 py-3"
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
                        className={`${i % 2 ? "bg-gray-50" : "bg-white"} hover:bg-rose-50 transition`}
                      >
                        <TableCell>{reg.registrationDate || "-"}</TableCell>
                        <TableCell>{reg.studentName || "-"}</TableCell>
                        <TableCell>{reg.dateOfBirth || "-"}</TableCell>
                        <TableCell>{reg.currentAge || "-"}</TableCell>
                        <TableCell>{reg.schoolName || "-"}</TableCell>
                        <TableCell>{reg.class || "-"}</TableCell>
                        <TableCell>{reg.board || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-between items-center p-4 bg-rose-50">
                <span className="text-sm">
                  Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
                  {Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    sortedRegistrations.length
                  )}{" "}
                  of {sortedRegistrations.length}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </Button>
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                    (n) => (
                      <Button
                        key={n}
                        size="sm"
                        variant={n === currentPage ? "default" : "outline"}
                        onClick={() => setCurrentPage(n)}
                      >
                        {n}
                      </Button>
                    )
                  )}
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
