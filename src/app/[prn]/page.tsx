"use client";
import React, { use } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  AlertTriangle,
  BookOpen,
  Trophy,
  Calendar,
  UserCheck,
  Trash2,
  X,
  Check,
  ChevronRight,
  Pencil,
  Shield,
  GraduationCap,
  Award,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { auth } from "../../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import RoboticsCard from "@/components/ui/robotics-card";

interface CourseData {
  classNumber: string;
  level: string;
  name: string;
  certificate?: boolean;
  completed?: boolean;
}

interface Student {
  PrnNumber: string;
  username: string;
  profileimage?: string;
  courses: CourseData[];
  courseClassNumbers?: {
    [key: string]: string;
  };
  status?: string;
}

async function getStudentData(prn: string) {
  const studentsRef = collection(db, "students");
  const q = query(studentsRef, where("PrnNumber", "==", prn));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) return null;
  const d = querySnapshot.docs[0].data();
  return {
    ...d,
    profileimage: d.profileimage || d.imageUrl || d.imageUrls?.[0] || undefined,
  } as Student;
}

function toSlug(courseName: string, level?: string) {
  if (typeof courseName !== "string" || !courseName) return "";
  let slug = courseName
    .toLowerCase()
    .replace(/ & /g, "-and-")
    .replace(/ \+ /g, "-plus-")
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
  if (level) {
    let levelText = level;
    if (level === "1") levelText = "beginner";
    else if (level === "2") levelText = "intermediate";
    else if (level === "3") levelText = "advanced";
    else if (level === "4") levelText = "expert";
    slug += `-level-${levelText}`;
  }
  return slug;
}

function getLevelConfig(level: string) {
  switch (level.toLowerCase()) {
    case "1":
    case "beginner":
      return {
        label: "Beginner",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        dot: "bg-emerald-500",
      };
    case "2":
    case "intermediate":
      return {
        label: "Intermediate",
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        dot: "bg-blue-500",
      };
    case "3":
    case "advanced":
      return {
        label: "Advanced",
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
        dot: "bg-purple-500",
      };
    case "4":
    case "expert":
      return {
        label: "Expert",
        bg: "bg-amber-50",
        text: "text-amber-700",
        border: "border-amber-200",
        dot: "bg-amber-500",
      };
    default:
      return {
        label: `Level ${level}`,
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
        dot: "bg-gray-500",
      };
  }
}

function getStatusConfig(status?: string) {
  switch (status?.toLowerCase()) {
    case "active":
      return {
        label: "Active",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        dot: "bg-emerald-500",
      };
    case "inactive":
      return {
        label: "Inactive",
        bg: "bg-red-50",
        text: "text-[#9F0712]",
        border: "border-red-200",
        dot: "bg-red-500",
      };
    default:
      return {
        label: "Active",
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        dot: "bg-emerald-500",
      };
  }
}

export default function Page({ params }: { params: Promise<{ prn: string }> }) {
  const { prn } = use(params);
  const [student, setStudent] = React.useState<Student | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [userChecked, setUserChecked] = React.useState(false);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [newClassNumber, setNewClassNumber] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [classNumberError, setClassNumberError] = React.useState<string | null>(
    null,
  );
  const [deletingIndex, setDeletingIndex] = React.useState<number | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] =
    React.useState(false);

  React.useEffect(() => {
    getStudentData(prn).then(setStudent);
  }, [prn]);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      setUserChecked(true);
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const { doc, getDoc } = await import("firebase/firestore");
        const adminDocRef = doc(db, "admins", user.uid);
        const adminDoc = await getDoc(adminDocRef);
        setIsAdmin(adminDoc.exists());
      } catch {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleEditClick = (index: number, currentClassNumber: string) => {
    setEditingIndex(index);
    setNewClassNumber(currentClassNumber || "");
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setNewClassNumber("");
    setClassNumberError(null);
  };

  const handleSave = async (index: number) => {
    if (!student) return;
    const classNumberValue = parseInt(newClassNumber, 10);
    if (
      isNaN(classNumberValue) ||
      classNumberValue < 1 ||
      classNumberValue > 30
    ) {
      setClassNumberError("Class number must be between 1 and 30");
      return;
    }
    setClassNumberError(null);
    setLoading(true);
    try {
      const updatedCourses = [...student.courses];
      updatedCourses[index] = {
        ...updatedCourses[index],
        classNumber: newClassNumber,
      };
      const studentsRef = collection(db, "students");
      const q = query(studentsRef, where("PrnNumber", "==", student.PrnNumber));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const studentDocRef = doc(db, "students", querySnapshot.docs[0].id);
        await updateDoc(studentDocRef, { courses: updatedCourses });
        setStudent({ ...student, courses: updatedCourses });
        setEditingIndex(null);
        setNewClassNumber("");
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (index: number) => {
    setDeletingIndex(index);
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    if (!student || deletingIndex === null) return;
    setLoading(true);
    try {
      const updatedCourses = [...student.courses];
      updatedCourses.splice(deletingIndex, 1);
      const studentsRef = collection(db, "students");
      const q = query(studentsRef, where("PrnNumber", "==", student.PrnNumber));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const studentDocRef = doc(db, "students", querySnapshot.docs[0].id);
        await updateDoc(studentDocRef, { courses: updatedCourses });
        setStudent({ ...student, courses: updatedCourses });
      }
      setDeletingIndex(null);
      setShowDeleteConfirmation(false);
    } catch (error) {
      console.error("Error deleting course:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingIndex(null);
    setShowDeleteConfirmation(false);
  };

  if (student === null) return null;

  if (!student) {
    return (
      <main
        role="main"
        aria-label="Student Not Found"
        className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4"
      >
        <div className="max-w-md w-full text-center">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 bg-red-50">
              <AlertTriangle className="w-8 h-8 text-[#A81B1E]" />
            </div>
            <h2
              className="text-2xl font-bold mb-2 text-gray-900"
              style={{ fontFamily: "Syne, sans-serif" }}
            >
              Student Not Found
            </h2>
            <p className="text-gray-500 mb-6">
              No student found with PRN:{" "}
              <code className="font-mono font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                {prn}
              </code>
            </p>
            <Link href="/student-list">
              <button className="px-6 py-2.5 bg-[#A81B1E] text-white text-sm font-semibold rounded-xl hover:bg-[#8a1518] transition-colors">
                Back to Student List
              </button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const statusConfig = getStatusConfig(student.status);
  const completedCount =
    student.courses?.filter((c) => c.completed).length || 0;
  const certCount = student.courses?.filter((c) => c.certificate).length || 0;

  return (
    <>
      {/* Page */}
      <main
        role="main"
        aria-label="Student Dashboard"
        className="min-h-screen bg-[#fafafa]"
      >
        {/* Top Header Bar */}
        <div className="bg-white border-b border-gray-100">
          <div className="container mx-auto px-4 py-4 max-w-7xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#A81B1E] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-400 leading-none mb-0.5">
                  Student Dashboard
                </p>
                <h1
                  className="text-base font-bold text-gray-900 leading-none"
                  style={{ fontFamily: "Syne, sans-serif" }}
                >
                  {student.username}
                </h1>
              </div>
            </div>
            <Link href="/student-list">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#A81B1E] text-white text-sm font-semibold rounded-xl hover:bg-[#8a1518] transition-colors">
                <Calendar className="w-4 h-4" />
                Student Record
              </button>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Student Profile Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl bg-[#A81B1E]/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {student.profileimage ? (
                    <Image
                      src={student.profileimage}
                      alt={student.username}
                      width={56}
                      height={56}
                      className="w-full h-full object-cover rounded-2xl"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = "/assets/logo1.png";
                      }}
                    />
                  ) : (
                    <span
                      className="text-xl font-bold text-[#A81B1E]"
                      style={{ fontFamily: "Syne, sans-serif" }}
                    >
                      {student.username?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2
                      className="text-xl font-bold text-gray-900"
                      style={{ fontFamily: "Syne, sans-serif" }}
                    >
                      {student.username}
                    </h2>
                    {/* Status badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
                      />
                      {statusConfig.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>
                      PRN:{" "}
                      <span className="font-mono font-semibold text-gray-700">
                        {student.PrnNumber}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-3">
                <div className="text-center px-4 py-2.5 bg-gray-50 rounded-xl border border-gray-100">
                  <p
                    className="text-2xl font-bold text-gray-900"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    {student.courses?.length || 0}
                  </p>
                  <p className="text-xs text-gray-500">Enrolled</p>
                </div>
                <div className="text-center px-4 py-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p
                    className="text-2xl font-bold text-emerald-700"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    {completedCount}
                  </p>
                  <p className="text-xs text-emerald-600">Completed</p>
                </div>
                <div className="text-center px-4 py-2.5 bg-amber-50 rounded-xl border border-amber-100">
                  <p
                    className="text-2xl font-bold text-amber-700"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    {certCount}
                  </p>
                  <p className="text-xs text-amber-600">Certificates</p>
                </div>
              </div>
            </div>
          </div>

          {/* Courses Section */}
          {!student.courses || student.courses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#A81B1E]/10 flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-[#A81B1E]" />
              </div>
              <h3
                className="text-xl font-bold text-gray-900 mb-2"
                style={{ fontFamily: "Syne, sans-serif" }}
              >
                No Courses Enrolled
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                This student is not currently enrolled in any courses.
              </p>
              <Link href="/all-courses">
                <button className="px-5 py-2.5 bg-[#A81B1E] text-white text-sm font-semibold rounded-xl hover:bg-[#8a1518] transition-colors">
                  Browse Courses
                </button>
              </Link>
            </div>
          ) : (
            <>
              {/* Section Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2
                    className="text-lg font-bold text-gray-900"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    Enrolled Courses
                  </h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {student.courses.length} course
                    {student.courses.length !== 1 ? "s" : ""} total
                  </p>
                </div>
                {userChecked && isAdmin && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#A81B1E]/10 rounded-lg">
                    <Shield className="w-3.5 h-3.5 text-[#A81B1E]" />
                    <span className="text-xs font-semibold text-[#A81B1E]">
                      Admin Mode
                    </span>
                  </div>
                )}
              </div>

              {/* Course Cards Grid */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...(student.courses || [])].reverse().map((course, index) => {
                  const realIndex = (student.courses?.length || 0) - 1 - index;
                  const levelConfig = getLevelConfig(course.level);
                  const courseNumber = (student.courses?.length || 0) - index;

                  return (
                    <div
                      key={`${course.name}-${index}`}
                      className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-[#A81B1E]/30 transition-all duration-300 overflow-hidden group"
                    >
                      {/* Completed overlay */}
                      {course.completed && (
                        <div className="absolute inset-0 z-20 bg-black/5 rounded-2xl flex items-center justify-center pointer-events-none">
                          <Image
                            src="/completed.png"
                            alt="Course Completed"
                            width={240}
                            height={240}
                            className="object-contain drop-shadow-xl"
                          />
                        </div>
                      )}

                      {/* Certificate badge */}
                      {course.certificate && (
                        <div className="absolute top-3 right-3 z-20">
                          <Image
                            src="/assets/certificate.png"
                            alt="Certificate"
                            width={48}
                            height={48}
                            className="object-contain drop-shadow-md"
                          />
                        </div>
                      )}

                      {/* Top accent stripe */}
                      <div className="h-1 w-full bg-gradient-to-r from-[#A81B1E] to-[#C73E1D]" />

                      <div className="p-5">
                        {/* Course header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-10 h-10 rounded-xl bg-[#A81B1E]/10 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-[#A81B1E]" />
                          </div>
                          <span className="text-xs font-mono font-bold text-gray-300">
                            #{String(courseNumber).padStart(2, "0")}
                          </span>
                        </div>

                        {/* Level badge */}
                        <div className="mb-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${levelConfig.bg} ${levelConfig.text} ${levelConfig.border}`}
                          >
                            <Trophy className="w-3 h-3" />
                            {levelConfig.label}
                          </span>
                        </div>

                        {/* Course name */}
                        <Link
                          href={`/${student.PrnNumber}/${toSlug(course.name, course.level)}`}
                          className="block mb-4"
                        >
                          <h3
                            className="text-base font-bold text-gray-900 line-clamp-2 group-hover:text-[#A81B1E] group-hover:underline transition-colors"
                            style={{ fontFamily: "Syne, sans-serif" }}
                          >
                            {course.name}
                          </h3>
                        </Link>

                        {/* Class number + edit */}
                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-xs text-gray-400 mb-1">
                                Class Number
                              </p>

                              {userChecked &&
                              isAdmin &&
                              editingIndex === realIndex ? (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      className={`w-20 border rounded-lg px-2.5 py-1.5 text-sm font-mono focus:ring-2 focus:ring-[#A81B1E]/30 focus:border-[#A81B1E] outline-none transition-all ${classNumberError ? "border-red-400 bg-red-50" : "border-gray-200"}`}
                                      value={newClassNumber}
                                      onChange={(e) => {
                                        setNewClassNumber(e.target.value);
                                        if (classNumberError)
                                          setClassNumberError(null);
                                      }}
                                      disabled={loading}
                                    />
                                    <button
                                      className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleSave(realIndex);
                                      }}
                                      disabled={loading}
                                    >
                                      <Check className="w-3 h-3" />
                                      {loading ? "Saving…" : "Save"}
                                    </button>
                                    <button
                                      className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 text-gray-600 text-xs font-semibold rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        handleCancel();
                                      }}
                                      disabled={loading}
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                  {classNumberError && (
                                    <p className="text-red-500 text-xs">
                                      {classNumberError}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold font-mono text-gray-900">
                                    {course.classNumber || "—"}
                                  </span>
                                  {userChecked &&
                                    isAdmin &&
                                    editingIndex !== realIndex && (
                                      <button
                                        className="flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleEditClick(
                                            realIndex,
                                            course.classNumber,
                                          );
                                        }}
                                      >
                                        <Pencil className="w-3 h-3" />
                                        Edit
                                      </button>
                                    )}
                                </div>
                              )}
                            </div>

                            {/* View course arrow */}
                            <Link
                              href={`/${student.PrnNumber}/${toSlug(course.name, course.level)}`}
                              className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-50 hover:bg-[#A81B1E] hover:text-white text-gray-400 transition-all duration-200 group/arrow"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </Link>
                          </div>

                          {/* Delete — admin only, bottom of card */}
                          {userChecked && isAdmin && (
                            <button
                              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-red-600 text-xs font-semibold rounded-xl border border-red-100 bg-red-50 hover:bg-red-100 transition-colors"
                              onClick={(e) => {
                                e.preventDefault();
                                handleDeleteClick(realIndex);
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete Course
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirmation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <h3
                    className="text-base font-bold text-gray-900"
                    style={{ fontFamily: "Syne, sans-serif" }}
                  >
                    Delete Course
                  </h3>
                </div>
                <button
                  onClick={handleDeleteCancel}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Are you sure you want to remove this course? This action{" "}
                <span className="font-semibold text-gray-800">
                  cannot be undone
                </span>
                .
              </p>
              <div className="flex gap-3">
                <button
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                  onClick={handleDeleteCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                  onClick={handleDeleteConfirm}
                  disabled={loading}
                >
                  {loading ? (
                    <span>Deleting…</span>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
