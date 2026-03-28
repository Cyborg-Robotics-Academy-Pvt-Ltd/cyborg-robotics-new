"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

interface Course {
  name: string;
  level: string;
  classNumber: string;
  status: string;
  trainerId?: string | null;
  trainerName?: string | null;
  trainerImage?: string | null;
}

interface Student {
  id: string;
  prn: string;
  username?: string;
  fullName?: string;
  email?: string;
  trainerId?: string | null;
  trainerName?: string | null;
  courses?: Course[];
}

interface Trainer {
  id: string;
  name?: string;
  email?: string;
  username?: string;
  profileimage?: string;
}

const AssignTrainerPage = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTrainer, setFilterTrainer] = useState<string>("all");
  const [globalTrainerAssignment, setGlobalTrainerAssignment] = useState<
    Record<string, string>
  >({}); // Track global trainer assignments for display purposes
  const [expandedStudents, setExpandedStudents] = useState<
    Record<string, boolean>
  >({});
  const [editingCourse, setEditingCourse] = useState<{
    studentId: string;
    courseIndex: number;
  } | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: "prn" | "fullName" | "email";
    direction: "asc" | "desc";
  } | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user || userRole !== "admin") {
      router.push("/login");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch students
        const studentsQuery = query(collection(db, "students"));
        const studentsSnapshot = await getDocs(studentsQuery);
        const studentsData: Student[] = [];
        studentsSnapshot.forEach((doc) => {
          const data = doc.data();
          studentsData.push({
            id: doc.id,
            prn: data.PrnNumber || "",
            username: data.username || "",
            fullName: data.fullName || "",
            email: data.email || "",
            trainerId: data.trainerId || null,
            trainerName: data.trainerName || null,
            courses: data.courses || [],
          });
        });
        setStudents(studentsData);

        // Fetch trainers
        const trainersQuery = query(collection(db, "trainers"));
        const trainersSnapshot = await getDocs(trainersQuery);
        const trainersData: Trainer[] = [];
        trainersSnapshot.forEach((doc) => {
          const data = doc.data();
          trainersData.push({
            id: doc.id,
            name:
              data.name ||
              data.fullName ||
              data.displayName ||
              data.username ||
              "",
            email: data.email || "",
            username: data.username || "",
            profileimage: data.profileimage || "",
          });
        });
        setTrainers(trainersData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to fetch data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, userRole, authLoading, router]);

  const handleAssignTrainerToCourse = async (
    studentId: string,
    courseIndex: number,
    trainerId: string,
  ) => {
    // Only handle course-specific assignments (courseIndex >= 0)
    if (courseIndex < 0) {
      return; // Skip global trainer assignment
    }

    try {
      // Find the trainer to get their name
      const trainer = trainers.find((t) => t.id === trainerId);
      const trainerName = trainer
        ? trainer.name || trainer.username || trainer.email
        : "";

      // Update student's course with trainer assignment
      setStudents((prevStudents) =>
        prevStudents.map((student) => {
          if (student.id === studentId) {
            const updatedCourses = [...(student.courses || [])];
            if (updatedCourses && updatedCourses[courseIndex]) {
              // Find the trainer to get their profile image
              const trainer = trainers.find((t) => t.id === trainerId);
              updatedCourses[courseIndex] = {
                ...updatedCourses[courseIndex],
                trainerId: trainerId,
                trainerName: trainerName,
                trainerImage: trainer?.profileimage || null,
              };
            }
            return { ...student, courses: updatedCourses };
          }
          return student;
        }),
      );

      // Update Firestore
      const studentDocRef = doc(db, "students", studentId);
      const student = students.find((s) => s.id === studentId);
      if (student) {
        const updatedCourses = [...(student.courses || [])];
        if (updatedCourses && updatedCourses[courseIndex]) {
          // Find the trainer to get their profile image
          const trainer = trainers.find((t) => t.id === trainerId);
          updatedCourses[courseIndex] = {
            ...updatedCourses[courseIndex],
            trainerId: trainerId,
            trainerName: trainerName,
            trainerImage: trainer?.profileimage || null,
          };
          await updateDoc(studentDocRef, {
            courses: updatedCourses,
          });
        }
      }

      setEditingCourse(null);
    } catch (err) {
      console.error("Error assigning trainer to course:", err);
      setError("Failed to assign trainer to course. Please try again.");
    }
  };

  const handleRemoveTrainerFromCourse = async (
    studentId: string,
    courseIndex: number,
  ) => {
    try {
      // Update local state
      setStudents((prevStudents) =>
        prevStudents.map((student) => {
          if (student.id === studentId) {
            const updatedCourses = [...(student.courses || [])];
            if (updatedCourses && updatedCourses[courseIndex]) {
              updatedCourses[courseIndex] = {
                ...updatedCourses[courseIndex],
                trainerId: undefined,
                trainerName: undefined,
                trainerImage: undefined,
              };
            }
            return { ...student, courses: updatedCourses };
          }
          return student;
        }),
      );

      // Update Firestore
      const studentDocRef = doc(db, "students", studentId);
      const student = students.find((s) => s.id === studentId);
      if (student) {
        const updatedCourses = [...(student.courses || [])];
        if (updatedCourses && updatedCourses[courseIndex]) {
          updatedCourses[courseIndex] = {
            ...updatedCourses[courseIndex],
            trainerId: null,
            trainerName: null,
            trainerImage: null,
          };
          await updateDoc(studentDocRef, {
            courses: updatedCourses,
          });
        }
      }
    } catch (err) {
      console.error("Error removing trainer from course:", err);
      setError("Failed to remove trainer from course. Please try again.");
    }
  };

  const toggleStudentExpansion = (studentId: string) => {
    setExpandedStudents((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  // Removed handleRemoveTrainer since we're now handling course-specific assignments

  // Sort and filter logic
  const sortedAndFilteredStudents = useMemo(() => {
    let filtered = students.filter((student) => {
      const matchesSearch =
        student.prn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.fullName &&
          student.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.username &&
          student.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.email &&
          student.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.trainerName &&
          student.trainerName
            .toLowerCase()
            .includes(searchTerm.toLowerCase())) ||
        (student.courses &&
          Array.isArray(student.courses) &&
          student.courses.some(
            (course) =>
              course.trainerName &&
              course.trainerName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()),
          ));

      const matchesFilter =
        filterTrainer === "all" ||
        filterTrainer === "" ||
        (student.courses &&
          Array.isArray(student.courses) &&
          student.courses.some((course) => course.trainerId === filterTrainer));

      return matchesSearch && matchesFilter;
    });

    // Apply sorting
    if (sortConfig !== null) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        // Handle undefined/null values
        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;

        // Convert to string for comparison
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();

        if (aString < bString) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (aString > bString) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    } else {
      // Default sorting by PRN if no sort config
      filtered.sort((a, b) => {
        const aPrn = String(a.prn || "").toLowerCase();
        const bPrn = String(b.prn || "").toLowerCase();
        return aPrn.localeCompare(bPrn);
      });
    }

    return filtered;
  }, [students, searchTerm, filterTrainer, sortConfig]);

  const handleSort = (key: "prn" | "fullName" | "email") => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  if (authLoading || isLoading) {
    return <AuthLoadingSpinner />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="w-full bg-white/80 backdrop-blur-sm border border-gray-200/60 shadow-xl shadow-gray-300/50 rounded-2xl">
        <CardHeader className="bg-gradient-to-r from-[#A81B1E] to-[#062341] text-white rounded-t-2xl">
          <CardTitle className="text-2xl font-bold text-white">
            Assign Trainers to Courses
          </CardTitle>
          <p className="opacity-90 text-white">
            Manage individual trainer assignments for student courses
          </p>
        </CardHeader>
        <CardContent className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Search and Filter Controls */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search Students
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by PRN, name, email, or trainer..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A81B1E] focus:border-[#A81B1E] transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label
                htmlFor="filterTrainer"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Filter by Trainer
              </label>
              <Select
                value={filterTrainer}
                onValueChange={(value) => setFilterTrainer(value)}
              >
                <SelectTrigger className="w-full h-12">
                  <SelectValue placeholder="All Trainers" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="all">All Trainers</SelectItem>
                  {trainers.map((trainer) => (
                    <SelectItem key={trainer.id} value={trainer.id}>
                      <div className="flex items-center gap-3">
                        {trainer.profileimage ? (
                          <Image
                            width={50}
                            height={50}
                            src={trainer.profileimage}
                            alt={trainer.name || trainer.username || "Trainer"}
                            className="w-7 h-7 rounded-full object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#A81B1E] to-[#062341] flex items-center justify-center text-sm font-medium text-white">
                            {(
                              trainer.name?.charAt(0) ||
                              trainer.username?.charAt(0) ||
                              trainer.email?.charAt(0) ||
                              "?"
                            ).toUpperCase()}
                          </div>
                        )}
                        <span>
                          {trainer.name || trainer.username || trainer.email}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Students & Course Assignments
              </h2>
              <span className="text-sm text-gray-600">
                Showing {sortedAndFilteredStudents.length} of {students.length}
                students
              </span>
            </div>
            <Table className="border rounded-lg overflow-hidden shadow-sm">
              <TableHeader className="bg-gray-50">
                <TableRow className="border-b">
                  <TableHead className="font-bold text-gray-700 py-4 px-4">
                    <button
                      onClick={() => handleSort("prn")}
                      className="flex items-center gap-1 hover:text-[#A81B1E] w-full text-left transition-colors duration-200"
                    >
                      PRN
                      {sortConfig && sortConfig.key === "prn" && (
                        <span className="text-[#A81B1E]">
                          {sortConfig.direction === "asc" ? " ↑" : " ↓"}
                        </span>
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="font-bold text-gray-700 py-4 px-4">
                    <button
                      onClick={() => handleSort("fullName")}
                      className="flex items-center gap-1 hover:text-[#A81B1E] w-full text-left transition-colors duration-200"
                    >
                      Name
                      {sortConfig && sortConfig.key === "fullName" && (
                        <span className="text-[#A81B1E]">
                          {sortConfig.direction === "asc" ? " ↑" : " ↓"}
                        </span>
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="font-bold text-gray-700 py-4 px-4">
                    <button
                      onClick={() => handleSort("email")}
                      className="flex items-center gap-1 hover:text-[#A81B1E] w-full text-left transition-colors duration-200"
                    >
                      Email
                      {sortConfig && sortConfig.key === "email" && (
                        <span className="text-[#A81B1E]">
                          {sortConfig.direction === "asc" ? " ↑" : " ↓"}
                        </span>
                      )}
                    </button>
                  </TableHead>
                  <TableHead className="font-bold text-gray-700 py-4 px-4">
                    Courses
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredStudents.length > 0 ? (
                  sortedAndFilteredStudents.map((student) => (
                    <React.Fragment key={student.id}>
                      <TableRow className="hover:bg-gray-50 transition-colors duration-150">
                        <TableCell className="font-medium py-4 px-4">
                          {student.prn}
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          {student.fullName || student.username || "N/A"}
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          {student.email || "N/A"}
                        </TableCell>
                        <TableCell className="py-4 px-4">
                          <button
                            onClick={() => toggleStudentExpansion(student.id)}
                            className="text-[#A81B1E] hover:text-[#7a0d0f] font-medium flex items-center gap-1 transition-colors duration-200"
                          >
                            {student.courses?.length || 0} course(s)
                            <svg
                              className={`w-4 h-4 transition-transform ${expandedStudents[student.id] ? "rotate-180" : ""}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                        </TableCell>
                      </TableRow>
                      {expandedStudents[student.id] &&
                        student.courses &&
                        Array.isArray(student.courses) &&
                        student.courses.length > 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="p-0 bg-gray-50">
                              <div className="p-4 bg-white border-t border-gray-200">
                                <h3 className="font-semibold mb-3 text-gray-800 text-lg">
                                  Course Assignments
                                </h3>
                                <div className="space-y-3">
                                  {student.courses &&
                                    Array.isArray(student.courses) &&
                                    student.courses.map((course, index) => (
                                      <div
                                        key={index}
                                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                                      >
                                        <div className="flex-1">
                                          <div className="font-medium text-gray-900 text-base">
                                            {course.name}{" "}
                                            {course.level &&
                                              `(Level ${course.level})`}
                                          </div>
                                          <div className="text-sm text-gray-600 mt-1">
                                            Class: {course.classNumber || "N/A"}{" "}
                                            | Status: {course.status || "N/A"}
                                          </div>
                                          {course.trainerName && (
                                            <div className="text-sm text-[#A81B1E] mt-2 flex items-center gap-2">
                                              <span className="font-medium">
                                                Assigned Trainer:
                                              </span>
                                              <div className="flex items-center gap-2">
                                                {course.trainerImage ? (
                                                  <Image
                                                    width={50}
                                                    height={50}
                                                    src={course.trainerImage}
                                                    alt={course.trainerName}
                                                    className="w-6 h-6 rounded-full object-cover border border-gray-200"
                                                  />
                                                ) : (
                                                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#A81B1E] to-[#062341] flex items-center justify-center text-xs font-medium text-white">
                                                    {(
                                                      course.trainerName?.charAt(
                                                        0,
                                                      ) || "?"
                                                    ).toUpperCase()}
                                                  </div>
                                                )}
                                                <span className="font-medium">
                                                  {course.trainerName}
                                                </span>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex items-center space-x-2 ml-4">
                                          {editingCourse?.studentId ===
                                            student.id &&
                                          editingCourse?.courseIndex ===
                                            index ? (
                                            <React.Fragment>
                                              <Select
                                                value={course.trainerId || ""}
                                                onValueChange={(value) =>
                                                  handleAssignTrainerToCourse(
                                                    student.id,
                                                    index,
                                                    value,
                                                  )
                                                }
                                              >
                                                <SelectTrigger className="w-[180px] h-10">
                                                  <SelectValue placeholder="Select Trainer" />
                                                </SelectTrigger>
                                                <SelectContent className="z-[100]">
                                                  {trainers.map((trainer) => (
                                                    <SelectItem
                                                      key={trainer.id}
                                                      value={trainer.id}
                                                    >
                                                      <div className="flex items-center gap-2">
                                                        {trainer.profileimage ? (
                                                          <Image
                                                            width={50}
                                                            height={50}
                                                            src={
                                                              trainer.profileimage
                                                            }
                                                            alt={
                                                              trainer.name ||
                                                              trainer.username ||
                                                              "Trainer"
                                                            }
                                                            className="w-6 h-6 rounded-full object-cover border border-gray-200"
                                                          />
                                                        ) : (
                                                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#A81B1E] to-[#062341] flex items-center justify-center text-xs font-medium text-white">
                                                            {(
                                                              trainer.name?.charAt(
                                                                0,
                                                              ) ||
                                                              trainer.username?.charAt(
                                                                0,
                                                              ) ||
                                                              trainer.email?.charAt(
                                                                0,
                                                              ) ||
                                                              "?"
                                                            ).toUpperCase()}
                                                          </div>
                                                        )}
                                                        <span>
                                                          {trainer.name ||
                                                            trainer.username ||
                                                            trainer.email}
                                                        </span>
                                                      </div>
                                                    </SelectItem>
                                                  ))}
                                                </SelectContent>
                                              </Select>
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                  setEditingCourse(null)
                                                }
                                                className="h-10"
                                              >
                                                Cancel
                                              </Button>
                                            </React.Fragment>
                                          ) : (
                                            <React.Fragment>
                                              {!course.trainerId ? (
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() =>
                                                    setEditingCourse({
                                                      studentId: student.id,
                                                      courseIndex: index,
                                                    })
                                                  }
                                                  className="h-10 border-[#A81B1E] text-[#A81B1E] hover:bg-[#A81B1E] hover:text-white transition-colors"
                                                >
                                                  Assign Trainer
                                                </Button>
                                              ) : (
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() =>
                                                    handleRemoveTrainerFromCourse(
                                                      student.id,
                                                      index,
                                                    )
                                                  }
                                                  className="h-10 text-red-600 border-red-300 hover:bg-red-50 transition-colors"
                                                >
                                                  Remove
                                                </Button>
                                              )}
                                            </React.Fragment>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-gray-500 text-base"
                    >
                      No students found matching your search criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end pt-4">
            <Button
              onClick={() => router.push("/admin-dashboard")}
              variant="outline"
              className="border-[#A81B1E] text-[#A81B1E] hover:bg-[#A81B1E] hover:text-white transition-colors px-6 py-2"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignTrainerPage;
