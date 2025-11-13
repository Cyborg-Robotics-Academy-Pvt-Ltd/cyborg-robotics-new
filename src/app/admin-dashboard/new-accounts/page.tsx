"use client";

import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { app } from "@/lib/firebase";
import {
  UsersRound,
  Search,
  XCircle,
  CheckCircle,
  UserPlus,
  Eye,
  Mail,
  Calendar,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Student {
  id: string;
  uid: string;
  fullName: string;
  email: string;
  grade: string;
  createdAt: any;
  courses: any[];
  role: string;
}

const NewAccountsPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNewStudents = async () => {
    setLoading(true);
    try {
      const db = getFirestore(app);

      // Query students who have no courses assigned
      const studentsRef = collection(db, "students");
      const q = query(studentsRef, where("courses", "==", []));

      const querySnapshot = await getDocs(q);

      const studentList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          uid: data.uid || "",
          fullName: data.fullName || "",
          email: data.email || "",
          grade: data.grade || "",
          createdAt: data.createdAt || null,
          courses: data.courses || [],
          role: data.role || "student",
        };
      });

      setStudents(studentList);
    } catch (error) {
      console.error("Error fetching new students:", error);
      toast.error("Failed to fetch new accounts");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNewStudents();
  }, []);

  const filteredStudents = students.filter((student) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      student.fullName.toLowerCase().includes(searchTermLower) ||
      student.email.toLowerCase().includes(searchTermLower) ||
      student.grade.toLowerCase().includes(searchTermLower)
    );
  });

  const formatDate = (date: any) => {
    if (!date) return "N/A";
    try {
      // Handle Firestore Timestamp
      if (date.toDate) {
        return format(date.toDate(), "MMM dd, yyyy HH:mm");
      }
      // Handle JavaScript Date
      if (date instanceof Date) {
        return format(date, "MMM dd, yyyy HH:mm");
      }
      // Handle string date
      return format(new Date(date), "MMM dd, yyyy HH:mm");
    } catch (error) {
      return "Invalid Date";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 font-sans">
      <header className="bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                <UsersRound className="h-6 w-6 md:h-7 md:w-7 text-gray-900" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                  New Accounts
                </h1>
                <p className="text-sm md:text-base text-white text-opacity-90 mt-1">
                  Students who have registered but not yet assigned courses
                </p>
              </div>
            </div>

            <Link
              href="/admin-dashboard"
              className="inline-flex items-center px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 text-gray-900"
            >
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
              New Student Accounts
            </h2>
            <p className="mt-2 text-base text-gray-600">
              Manage and assign courses to newly registered students
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3">
            <div className="bg-[#991b1b] bg-opacity-10  text-white px-4 py-2 rounded-full font-semibold flex items-center shadow-sm">
              <UsersRound className="h-4 w-4 mr-2" />
              New Accounts: {students.length}
            </div>
            <Button
              size="sm"
              className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-white rounded-full shadow-md font-semibold tracking-wide transition-all duration-200"
              onClick={async () => {
                setRefreshing(true);
                await fetchNewStudents();
              }}
              disabled={refreshing || loading}
            >
              {refreshing ? (
                <svg
                  className="animate-spin h-4 w-4 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="h-4 w-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582M20 20v-5h-.581M5.635 19A9 9 0 003 12c0-5 4-9 9-9s9 4 9 9a9 9 0 01-2.635 6.364M19 5l-7 7-7-7"
                  />
                </svg>
              )}
              Refresh
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-12 pr-12 py-3 bg-gray-50 border outline-none border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-300"
                  placeholder="Search by name, email, or grade..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search students"
                />
                {searchTerm && (
                  <button
                    className="absolute inset-y-0 right-0 flex items-center pr-4"
                    onClick={() => setSearchTerm("")}
                    aria-label="Clear search"
                  >
                    <XCircle className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Showing: {filteredStudents.length}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-xl rounded-3xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center">
              <div className="animate-pulse space-y-6 w-full max-w-5xl">
                <div className="h-10 bg-gray-100 rounded w-full"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="h-16 bg-gray-100 rounded w-full"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="overflow-x-auto">
              <Table className="min-w-full divide-y divide-gray-200">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">
                      Student Name
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">
                      Email Address
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">
                      Grade
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6">
                      Registration Date
                    </TableHead>
                    <TableHead className="font-semibold text-gray-700 py-4 px-6 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow
                      key={student.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <TableCell className="font-medium text-gray-900 py-4 px-6">
                        <div className="flex items-center">
                          <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex items-center justify-center mr-3">
                            <UserPlus className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <div className="font-medium">
                              {student.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {student.uid.substring(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 py-4 px-6">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {student.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 py-4 px-6">
                        <div className="flex items-center">
                          <GraduationCap className="h-4 w-4 mr-2 text-gray-400" />
                          {student.grade}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 py-4 px-6">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDate(student.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right">
                        <div className="flex justify-end space-x-2">
                          <Link
                            href={`/create-user?email=${encodeURIComponent(student.email)}`}
                            className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                          >
                            <UserPlus className="h-4 w-4 mr-1" />
                            Assign Courses
                          </Link>
                          <Link
                            href={`/${student.id}`}
                            className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="p-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
                <UsersRound className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No New Accounts Found
              </h3>
              <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
                {searchTerm
                  ? "Try adjusting your search terms or clear the search filter."
                  : "All students have been assigned courses. Great job!"}
              </p>
              <div className="mt-6">
                <Link
                  href="/admin-dashboard"
                  className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-xl shadow-sm text-sm font-medium hover:bg-gray-700 transition-all duration-200"
                >
                  Back to Dashboard
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default NewAccountsPage;
