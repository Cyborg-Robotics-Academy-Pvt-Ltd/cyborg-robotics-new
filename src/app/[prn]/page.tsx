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
  Award,
  Calendar,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import Head from "next/head";
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
  courses: CourseData[];
  courseClassNumbers?: {
    [key: string]: string;
  };
}

async function getStudentData(prn: string) {
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
  const [student, setStudent] = React.useState<Student | null>(null);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [userChecked, setUserChecked] = React.useState(false);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);
  const [newClassNumber, setNewClassNumber] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [classNumberError, setClassNumberError] = React.useState<string | null>(
    null
  );

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

    // Validate class number is between 1 and 30
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

  if (student === null) {
    return null;
  }

  if (!student) {
    return (
      <>
        <Head>
          <title>Student Not Found | Cyborg Robotics Academy</title>
          <meta
            name="description"
            content="No student found with the provided PRN."
          />
          <meta
            property="og:title"
            content="Student Not Found | Cyborg Robotics Academy"
          />
          <meta
            property="og:description"
            content="No student found with the provided PRN."
          />
          <meta property="og:type" content="website" />
        </Head>
        <main
          role="main"
          aria-label="Student Not Found"
          className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 relative overflow-hidden"
        >
          {/* Animated background elements */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-800/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-800/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative max-w-md w-full text-center">
            <RoboticsCard className="p-10 bg-white/80 backdrop-blur-sm border-2 border-dashed border-red-200">
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg bg-gradient-to-br from-red-700 to-red-800">
                <AlertTriangle className="w-12 h-12 text-white animate-bounce" />
              </div>
              <h2 className="text-3xl font-bold mb-3 text-red-800">
                Student Not Found
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                No student found with PRN:{" "}
                <span className="font-mono font-bold">{prn}</span>
              </p>
              <Link href="/student-list">
                <button className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-800 text-white font-semibold rounded-lg shadow-md hover:from-red-800 hover:to-red-900 transition-all duration-300 transform hover:-translate-y-0.5">
                  Back to Student List
                </button>
              </Link>
            </RoboticsCard>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{student.username} | Student Dashboard</title>
        <meta
          name="description"
          content={`Dashboard for ${student.username} at Cyborg Robotics Academy.`}
        />
        <meta
          property="og:title"
          content={`${student.username} | Student Dashboard`}
        />
        <meta
          property="og:description"
          content={`Dashboard for ${student.username} at Cyborg Robotics Academy.`}
        />
        <meta property="og:type" content="website" />
      </Head>
      <main
        role="main"
        aria-label="Student Dashboard"
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100  relative overflow-hidden"
      >
        <div className="relative container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Welcome,{" "}
                <span className="text-red-800">{student.username}</span>
              </h1>
              <p className="text-gray-600 flex items-center">
                <UserCheck className="w-4 h-4 mr-2" />
                PRN: {student.PrnNumber}
              </p>
            </div>
            <Link
              href="/student-list"
              className="w-full sm:w-auto mt-4 sm:mt-0"
            >
              <button className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-700 to-red-800 text-white text-base font-semibold rounded-xl shadow-lg hover:from-red-800 hover:to-red-900 hover:shadow-xl transition-all duration-300 flex items-center justify-center transform hover:-translate-y-0.5">
                <Calendar className="w-5 h-5 mr-2" />
                Student List
              </button>
            </Link>
          </div>

          {/* Enrolled Courses Section */}
          {student.courses.length === 0 ? (
            <RoboticsCard className="p-12 text-center border-2 border-dashed border-red-200 bg-gradient-to-br from-white to-red-50">
              <div className="py-8">
                <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg bg-gradient-to-br from-red-700 to-red-800">
                  <BookOpen className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-red-800">
                  No Courses Enrolled
                </h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto mb-6">
                  This student is not currently enrolled in any courses.
                </p>
                <Link href="/all-courses">
                  <button className="px-6 py-3 bg-gradient-to-r from-red-700 to-red-800 text-white font-semibold rounded-lg shadow-md hover:from-red-800 hover:to-red-900 transition-all duration-300 transform hover:-translate-y-0.5">
                    Browse Courses
                  </button>
                </Link>
              </div>
            </RoboticsCard>
          ) : (
            <RoboticsCard className="p-8 bg-white/80 backdrop-blur-sm">
              <div className="mb-8 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold text-red-800 mb-2">
                      Enrolled Courses
                    </h2>
                    <p className="text-gray-600 flex items-center">
                      <BookOpen className="w-5 h-5 mr-2 text-red-700" />
                      Currently enrolled in
                      <span className="font-bold mx-1 text-red-800">
                        {student.courses.length}
                      </span>
                      course{student.courses.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="bg-red-100 text-red-800 px-4 py-2 rounded-full flex items-center">
                    <Award className="w-5 h-5 mr-2" />
                    <span className="font-semibold">Active</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...student.courses].reverse().map((course, index) => {
                  // Reverse index for correct mapping
                  const realIndex = student.courses.length - 1 - index;
                  return (
                    <RoboticsCard
                      key={`${course.name}-${index}`}
                      className="group relative overflow-hidden border-2 border-gray-200 hover:border-red-700 transition-all duration-500"
                      variant="elevated"
                      interactive
                    >
                      {/* Completed Overlay */}
                      {course && course.completed && (
                        <div
                          className="absolute inset-0 z-20 bg-black/10 rounded-2xl flex items-center justify-center"
                          style={{ pointerEvents: "none" }}
                        >
                          <div className="relative">
                            <Image
                              src="/completed.png"
                              alt="Course Completed"
                              width={300}
                              height={300}
                              className="object-contain drop-shadow-2xl "
                            />
                          </div>
                        </div>
                      )}
                      {/* Certificate Badge */}
                      {course.certificate && (
                        <div className="absolute top-4 right-4 z-20 animate-bounce">
                          <Image
                            src="/assets/certificate.png"
                            alt="Certificate"
                            width={60}
                            height={60}
                            className="object-contain drop-shadow-lg"
                          />
                        </div>
                      )}
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br from-red-700 to-red-800 shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <BookOpen className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-800 font-bold text-sm">
                            {student.courses.length - index}
                          </div>
                        </div>

                        <div className="mb-4">
                          <div
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getLevelColor(course.level)}`}
                          >
                            <Trophy className="w-3 h-3 mr-1" />
                            {getLevelLabel(course.level)}
                          </div>
                        </div>

                        <Link
                          href={`/${student.PrnNumber}/${toSlug(course.name, course.level)}`}
                          className="text-xl font-bold mb-3 line-clamp-2 transition-colors duration-300 block text-red-800 hover:text-red-900 hover:underline"
                        >
                          {course.name}
                        </Link>

                        <div className="mt-6 pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">
                                Class Number
                              </p>
                              {userChecked &&
                              isAdmin &&
                              editingIndex === realIndex ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    className={`border rounded px-2 py-1 text-sm w-20 focus:ring-2 focus:ring-red-300 focus:outline-none ${classNumberError ? "border-red-500" : ""}`}
                                    value={newClassNumber}
                                    onChange={(e) => {
                                      setNewClassNumber(e.target.value);
                                      // Clear error when user starts typing
                                      if (classNumberError) {
                                        setClassNumberError(null);
                                      }
                                    }}
                                    disabled={loading}
                                  />
                                  {classNumberError && (
                                    <div className="text-red-500 text-xs mt-1">
                                      {classNumberError}
                                    </div>
                                  )}
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
                                <div className="flex items-center">
                                  <p className="text-lg font-bold font-mono text-red-800">
                                    {course.classNumber || "N/A"}
                                  </p>
                                  {/* Show Edit button only for admin */}
                                  {userChecked &&
                                    isAdmin &&
                                    editingIndex !== realIndex && (
                                      <button
                                        className="ml-3 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 border border-yellow-300 transition-all duration-200"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          handleEditClick(
                                            realIndex,
                                            course.classNumber
                                          );
                                        }}
                                      >
                                        Edit
                                      </button>
                                    )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </RoboticsCard>
                  );
                })}
              </div>
            </RoboticsCard>
          )}
        </div>
      </main>
    </>
  );
}
