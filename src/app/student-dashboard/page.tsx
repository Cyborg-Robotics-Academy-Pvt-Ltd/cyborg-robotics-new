"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../../firebaseConfig";
import { doc, onSnapshot, DocumentData } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { ClipboardList, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";

const StudentDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<DocumentData | null>(null);
  const [prnMatch, setPrnMatch] = useState<boolean | null>(null);
  const { user, userRole, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!user || userRole !== "student") {
      router.push("/login");
      return;
    }

    console.log("Setting up student dashboard for user:", user.uid);
    console.log("User email:", user.email);

    // Set up real-time listener for student data using UID
    const studentDocRef = doc(db, "students", user.uid);
    const unsubscribeDoc = onSnapshot(
      studentDocRef,
      (doc) => {
        if (!doc.exists()) {
          console.log("No student document found for UID:", user.uid);
          setPrnMatch(false);
          setLoading(false);
          return;
        }

        const studentData = doc.data();
        console.log("Found student data:", studentData);
        console.log("Student PRN:", studentData.PrnNumber);

        // Check if PRN matches (optional validation)
        const prnToCheck = user.email?.split("@")[0] || user.uid;
        if (studentData.PrnNumber && studentData.PrnNumber !== prnToCheck) {
          console.log(
            "PRN mismatch - Expected:",
            prnToCheck,
            "Found:",
            studentData.PrnNumber
          );
          console.log("But allowing access anyway for now...");
        }

        setPrnMatch(true);
        setStudentData(studentData);
        setLoading(false);
      },
      (error) => {
        console.error("Document listener error:", error);
        setPrnMatch(false);
        setLoading(false);
      }
    );

    // Clean up the document listener when component unmounts
    return () => unsubscribeDoc();
  }, [user, userRole, authLoading, router]);

  if (authLoading || loading) {
    return <AuthLoadingSpinner />;
  }

  // Show error if PRN doesn't match
  if (prnMatch === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 pointer-events-none">
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
            Access Denied
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            Your PRN number doesn&apos;t match the student records. Please
            contact your administrator.
          </p>
          <Link href="/login">
            <button className="px-6 py-3 bg-red-700 text-white font-semibold rounded-xl hover:bg-red-800 transition-colors duration-300">
              Back to Login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-white -mt-24 pt-24">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 ">
        {/* Welcome Section */}
        <div className="mb-8 bg-gradient-to-r from-[#991b1b] to-[#991b1b] p-6 rounded-xl shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-10 rounded-full -ml-10 -mb-10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center overflow-hidden border-2 border-white border-opacity-50">
                {studentData?.imageUrls &&
                Array.isArray(studentData.imageUrls) &&
                studentData.imageUrls[0] ? (
                  <Image
                    src={studentData.imageUrls[0]}
                    alt={studentData?.username || "Student Avatar"}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-lg">
                    {(studentData?.username || "S")
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-white">
                Welcome , {studentData?.username || "Student"}
              </h1>
            </div>

            {studentData?.PrnNumber && (
              <p className="mt-1 text-red-100 text-sm">
                PRN: {studentData.PrnNumber}
              </p>
            )}
          </div>
        </div>

        {/* Assigned Courses Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Assigned Courses
          </h2>
          {studentData?.courses && studentData.courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {studentData.courses.map(
                (
                  course: {
                    name: string;
                    level: string;
                    classNumber: string;
                    completed?: boolean;
                    certificate?: boolean;
                  },
                  idx: number
                ) => {
                  // Demo: course icon (use emoji or static image, or map to real icons if available)
                  const courseIcons: Record<string, string> = {
                    Python: "🐍",
                    Java: "☕",
                    Arduino: "🔌",
                    "3D Printing": "🖨️",
                    "Web Designing": "💻",
                    // Add more mappings as needed
                  };
                  const icon = courseIcons[course.name] || "📘";

                  // Create slug for course URL
                  const toSlug = (courseName: string, level?: string) => {
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
                  };

                  // Helper function to format level display
                  const formatLevel = (level: string | number) => {
                    if (!level) return "N/A";

                    const levelStr = String(level).toLowerCase();
                    switch (levelStr) {
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
                  };

                  const courseSlug = toSlug(course.name, course.level);
                  const courseUrl = `/${studentData.PrnNumber}/${courseSlug}`;

                  // Debug logging
                  console.log("Course data:", {
                    name: course.name,
                    level: course.level,
                    levelType: typeof course.level,
                    formattedLevel: formatLevel(course.level),
                  });

                  return (
                    <Link key={idx} href={courseUrl}>
                      <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 border-l-8 border-[#991b1b] cursor-pointer group relative overflow-hidden">
                        {/* Completed Badge */}
                        {course.completed && (
                          <div className="absolute top-3 right-3 z-30 flex items-center gap-2 bg-green-600 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg animate-pulse">
                            <svg
                              className="w-4 h-4 text-white"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Completed
                          </div>
                        )}

                        {/* Certificate Badge */}
                        {course.certificate && (
                          <Image
                            src="/assets/certificate.png"
                            alt="Certificate"
                            width={64}
                            height={64}
                            className="absolute top-2 right-2 object-contain z-20"
                            style={{
                              top: course.completed ? "2.5rem" : "0.5rem",
                              right: "0.5rem",
                            }}
                          />
                        )}

                        {/* Icon */}
                        <div className="absolute top-4 right-4 text-4xl opacity-20 group-hover:opacity-30 transition-opacity">
                          {icon}
                        </div>

                        <div className="flex items-center mb-2">
                          <span className="text-2xl mr-3">{icon}</span>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {course.name}
                          </h3>
                          <span className="ml-auto bg-[#f3d6d6] text-[#991b1b] text-xs font-bold px-2 py-1 rounded-full">
                            {formatLevel(course.level)}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-1">
                          Class: {course.classNumber}
                        </p>

                        {/* Status Indicators */}
                        <div className="flex items-center gap-2 mt-3">
                          {course.completed && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              <svg
                                className="w-3 h-3"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              Completed
                            </span>
                          )}
                          {course.certificate && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                              <svg
                                className="w-3 h-3"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Certificate
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 mt-2">
                          Click to view course details
                        </p>
                      </div>
                    </Link>
                  );
                }
              )}
            </div>
          ) : (
            <div className="text-gray-500">No courses assigned yet.</div>
          )}
        </div>

        {/* Media Card Only */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <Link href="/student-dashboard/media">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 h-full border-t-4 border-purple-500">
              <div className="flex items-center mb-4">
                <div className="p-3 rounded-lg bg-purple-100 text-purple-600 mr-4">
                  <ClipboardList className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Media</h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600">
                  Access course materials, videos and learning resources
                </p>
                <div className="mt-4 flex items-center text-sm font-medium text-purple-600">
                  Browse media
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
