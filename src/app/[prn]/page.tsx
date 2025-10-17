"use client";
import React, { use } from "react";
import { notFound } from "next/navigation";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { AlertTriangle, BookOpen, Trophy } from "lucide-react";
import Link from "next/link";

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
  courses: CourseData[];
  courseClassNumbers?: {
    [key: string]: string;
  };
}

// Add a function to validate if a string is a valid PRN (numeric)
function isValidPrn(prn: string): boolean {
  return /^\d+$/.test(prn);
}

// Early validation to prevent conflicts with static routes
export function generateMetadata({
  params,
}: {
  params: Promise<{ prn: string }>;
}) {
  const { prn } = React.use(params);
  // If it's not a valid PRN, return null to let Next.js handle it as a 404
  if (!isValidPrn(prn)) {
    return notFound();
  }
  return {
    title: `Student Profile - ${prn}`,
  };
}

async function getStudentData(prn: string) {
  // Only attempt to fetch data for valid numeric PRNs
  if (!isValidPrn(prn)) {
    return null;
  }

  const studentsRef = collection(db, "students");
  const q = query(studentsRef, where("PrnNumber", "==", prn));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  return querySnapshot.docs[0].data() as Student;
}

function toSlug(courseName: string, level?: string) {
  if (typeof courseName !== "string" || !courseName) {
    return "";
  }
  let slug = courseName
    .toLowerCase()
    .replace(/ & /g, "-and-")
    .replace(/ \+ /g, "-plus-")
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");

  // Add level to the slug if provided
  if (level) {
    // Convert numeric level to text if needed
    let levelText = level;
    if (level === "1") levelText = "beginner";
    else if (level === "2") levelText = "intermediate";
    else if (level === "3") levelText = "advanced";
    else if (level === "4") levelText = "expert";

    slug += `-level-${levelText}`;
  }

  return slug;
}

function getLevelColor(level: string) {
  switch (level.toLowerCase()) {
    case "1":
    case "beginner":
      return "bg-green-50 text-green-700 border-green-200";
    case "2":
    case "intermediate":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "3":
    case "advanced":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "4":
    case "expert":
      return "bg-orange-50 text-orange-700 border-orange-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}

function getLevelLabel(level: string) {
  switch (level.toLowerCase()) {
    case "1":
    case "beginner":
      return "Beginner";
    case "2":
    case "intermediate":
      return "Intermediate";
    case "3":
    case "advanced":
      return "Advanced";
    case "4":
    case "expert":
      return "Expert";
    default:
      return `Level ${level}`;
  }
}

export default function Page({ params }: { params: Promise<{ prn: string }> }) {
  const { prn } = use(params);

  // Move all hooks to the top level to ensure they're always called
  const [student, setStudent] = React.useState<Student | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [userChecked, setUserChecked] = React.useState(false);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [newClassNumber, setNewClassNumber] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    // For non-numeric PRNs, we should not fetch data
    // This prevents conflicts with other static routes like /about
    if (!isValidPrn(prn)) {
      setStudent(null);
      return;
    }

    getStudentData(prn).then(setStudent);
  }, [prn]);

  React.useEffect(() => {
    // For non-numeric PRNs, we should not check auth state
    if (!isValidPrn(prn)) {
      return;
    }

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
  }, [prn]); // Add prn as dependency

  const handleEditClick = (index: number, currentClassNumber: string) => {
    setEditingIndex(index);
    setNewClassNumber(currentClassNumber || "");
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setNewClassNumber("");
  };

  const handleSave = async (index: number) => {
    if (!student) return;
    setLoading(true);
    try {
      const updatedCourses = [...student.courses];
      updatedCourses[index] = {
        ...updatedCourses[index],
        classNumber: newClassNumber,
      };
      // Update Firestore
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
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  // Handle invalid PRNs by calling notFound() after hooks are initialized
  if (!isValidPrn(prn)) {
    notFound();
    return null;
  }

  if (student === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-800/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-800/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border border-gray-200">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            style={{
              background: "#991b1b",
            }}
          >
            <AlertTriangle className="w-12 h-12 text-white animate-bounce" />
          </div>
          <h2 className="text-3xl font-bold mb-3" style={{ color: "#991b1b" }}>
            Invalid PRN Format
          </h2>
          <p className="text-gray-600 text-lg">
            The PRN must be a numeric value. You entered: {prn}
          </p>
          <div className="mt-6">
            <Link href="/student-list">
              <button className="px-6 py-3 bg-red-700 text-white font-semibold rounded-xl hover:bg-red-800 transition-colors">
                Back to Student List
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-800/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-800/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center border border-gray-200">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
            style={{
              background: "#991b1b",
            }}
          >
            <AlertTriangle className="w-12 h-12 text-white animate-bounce" />
          </div>
          <h2 className="text-3xl font-bold mb-3" style={{ color: "#991b1b" }}>
            Student Not Found
          </h2>
          <p className="text-gray-600 text-lg">
            No student found with PRN: {prn}
          </p>
          <div className="mt-6">
            <Link href="/student-list">
              <button className="px-6 py-3 bg-red-700 text-white font-semibold rounded-xl hover:bg-red-800 transition-colors">
                Back to Student List
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 lg:mt-20 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-800/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-red-800/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-0 w-64 h-64 bg-red-800/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-end mb-4 sm:mb-6 mt-2 sm:mt-0">
          <Link href="/student-list" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto px-4 md:px-6 py-2.5 md:py-3 bg-red-700 text-white text-sm md:text-base font-semibold rounded-xl shadow-sm hover:bg-indigo-700 hover:shadow-md transition-all duration-300 flex items-center justify-center">
              Student List
            </button>
          </Link>
        </div>

        {/* Enrolled Courses Section */}
        {student.courses.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-200 text-center">
            <div className="py-12">
              <div
                className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl"
                style={{
                  background: "#991b1b",
                }}
              >
                <BookOpen className="w-16 h-16 text-white opacity-80" />
              </div>
              <h3
                className="text-2xl font-bold mb-4"
                style={{ color: "#991b1b" }}
              >
                No Courses Enrolled
              </h3>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                This student is not currently enrolled in any courses.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
            <div className="mb-8">
              <h2
                className="text-3xl font-bold mb-3"
                style={{ color: "#991b1b" }}
              >
                Enrolled Courses
              </h2>
              <p className="text-gray-600 text-lg">
                Currently enrolled in{" "}
                <span className="font-bold" style={{ color: "#991b1b" }}>
                  {student.courses.length}
                </span>{" "}
                course
                {student.courses.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...student.courses].reverse().map((course, index) => {
                // Reverse index for correct mapping
                const realIndex = student.courses.length - 1 - index;
                return (
                  <div
                    key={`${course.name}-${index}`}
                    className="group relative bg-gray-50 border-2 border-gray-200 rounded-2xl p-6 hover:border-red-800/5 hover:bg-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 block cursor-pointer overflow-hidden"
                  >
                    {/* Completed Overlay */}
                    {course && course.completed && (
                      <div
                        className="absolute inset-0 z-20 bg-black/10 rounded-2xl flex items-center justify-center"
                        style={{ pointerEvents: "none" }}
                      >
                        <div className="relative">
                          {/* Using div instead of Image for simplicity since we don't have the image import */}
                          <div className="w-48 h-48 bg-white/80 rounded-full flex items-center justify-center">
                            <span className="text-xl font-bold text-gray-700">
                              COMPLETED
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Certificate Badge */}
                    {course.certificate && (
                      <div className="absolute top-2 right-1 w-20 h-20 bg-yellow-400 rounded-full flex items-center justify-center z-20">
                        <Trophy className="w-10 h-10 text-yellow-700" />
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-red-800/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div
                      className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg"
                      style={{
                        background: "#991b1b",
                      }}
                    >
                      <span className="text-white font-bold text-sm">
                        {student.courses.length - index}
                      </span>
                    </div>
                    <div className="relative z-10 mb-6">
                      <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl"
                        style={{
                          background: "#991b1b",
                        }}
                      >
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>
                      {/* Level Badge */}
                      <div className="flex items-center mb-3">
                        <div
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getLevelColor(course.level)}`}
                        >
                          <Trophy className="w-3 h-3 mr-1" />
                          {getLevelLabel(course.level)}
                        </div>
                      </div>
                      {/* Only the course title is a link */}
                      <Link
                        href={`/${student.PrnNumber}/${toSlug(course.name, course.level)}`}
                        className="text-xl font-bold mb-3 z-50 line-clamp-2 transition-colors duration-300 block hover:underline"
                        style={{ color: "#991b1b", pointerEvents: "auto" }}
                      >
                        {course.name}
                      </Link>
                    </div>
                    <div className="relative z-10 bg-white rounded-xl p-4 group-hover:bg-gray-50 transition-all duration-300 border border-gray-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm font-medium text-gray-600 transition-colors">
                          Class Number
                        </span>
                        {/* Show Edit button only for admin */}
                        {userChecked &&
                          isAdmin &&
                          editingIndex !== realIndex && (
                            <button
                              className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 border border-yellow-300 transition-all duration-200"
                              onClick={(e) => {
                                e.preventDefault();
                                handleEditClick(realIndex, course.classNumber);
                              }}
                            >
                              Edit
                            </button>
                          )}
                      </div>
                      {userChecked && isAdmin && editingIndex === realIndex ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            className="border rounded px-2 py-1 text-sm w-24"
                            value={newClassNumber}
                            onChange={(e) => setNewClassNumber(e.target.value)}
                            disabled={loading}
                          />
                          <button
                            className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 border border-green-300 transition-all duration-200"
                            onClick={(e) => {
                              e.preventDefault();
                              handleSave(realIndex);
                            }}
                            disabled={loading}
                          >
                            {loading ? "Saving..." : "Save"}
                          </button>
                          <button
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 border border-gray-300 transition-all duration-200"
                            onClick={(e) => {
                              e.preventDefault();
                              handleCancel();
                            }}
                            disabled={loading}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <p
                          className="text-lg font-bold transition-colors duration-300 font-mono"
                          style={{ color: "#991b1b" }}
                        >
                          {course.classNumber || "N/A"}
                        </p>
                      )}
                    </div>
                    {/* Subtle animation border */}
                    <div className="absolute inset-0 rounded-2xl bg-red-800/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-sm"></div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
