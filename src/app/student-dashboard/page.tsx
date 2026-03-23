"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc,
  onSnapshot,
  DocumentData,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { ClipboardList, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";

// Define interfaces to match the data structure
interface Trainer {
  id: string;
  name: string;
  profileimage?: string;
  email?: string;
}

interface CourseTrainer {
  courseId: string;
  courseName: string;
  trainerId: string;
  trainerName: string;
  trainerImage?: string;
}

interface Course {
  name: string;
  level: string;
  classNumber: string;
  status: string;
  trainerId?: string;
  trainerName?: string;
  trainerImage?: string;
  completed?: boolean;
  certificate?: boolean;
}

interface Student {
  id: string;
  PrnNumber: string;
  fullName: string;
  name?: string;
  username?: string;
  email: string;
  profileimage?: string;
  imageUrl?: string;
  imageUrls?: string[];
  courses: Course[];
  courseTrainers: CourseTrainer[];
  status?: string;
  trainerId?: string;
  trainerName?: string;
  trainerImage?: string;
}

const getInitials = (name?: string) =>
  (name || "T")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2);

const StudentDashboard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [trainerData, setTrainerData] = useState<Record<string, Trainer>>({});
  const [prnMatch, setPrnMatch] = useState<boolean | null>(null);
  const { user, userRole, loading: authLoading } = useAuth();

  const resolveTrainerImage = (
    courseTrainerInfo?: CourseTrainer | null,
    detailedTrainer?: Trainer | null,
    fallbackImage?: string,
  ) =>
    fallbackImage ||
    detailedTrainer?.profileimage ||
    courseTrainerInfo?.trainerImage ||
    "";

  const getPrimaryTrainer = () => Object.values(trainerData)[0] || null;

  const getHeaderTrainer = () => {
    const fetchedTrainer = getPrimaryTrainer();
    const courseTrainer = studentData?.courseTrainers?.find((ct) => ct.trainerImage);
    const courseTrainerImage =
      courseTrainer?.trainerImage ||
      studentData?.courses?.find((course) => course.trainerImage)?.trainerImage ||
      studentData?.trainerImage ||
      "";

    return {
      name:
        fetchedTrainer?.name ||
        courseTrainer?.trainerName ||
        studentData?.trainerName ||
        "Unknown Trainer",
      image:
        fetchedTrainer?.profileimage ||
        courseTrainerImage ||
        (fetchedTrainer as any)?.imageUrl ||
        (fetchedTrainer as any)?.imageUrls?.[0] ||
        "",
    };
  };

  // Function to fetch trainer data
  const fetchTrainerData = async (
    trainerId: string,
    expectedTrainerName?: string,
  ) => {
    if (!trainerId) {
      setTrainerData((prev) => {
        const newState = { ...prev };
        delete newState[trainerId];
        return newState;
      });
      return;
    }
    try {
      const trainerDocRef = doc(db, "trainers", trainerId);
      const trainerDocSnap = await getDoc(trainerDocRef);

      if (trainerDocSnap.exists()) {
        const trainerInfo = trainerDocSnap.data();
        // Verify that the fetched trainer ID matches the expected ID
        if (trainerDocSnap.id === trainerId) {
          // Additional verification: check if the name matches what's in the student record
          const actualName =
            trainerInfo.name || trainerInfo.fullName || trainerInfo.username;

          if (
            expectedTrainerName &&
            actualName &&
            expectedTrainerName !== actualName
          ) {
            // We'll still set the trainer data since the ID matches, but log the warning
          }

          const trainer: Trainer = {
            id: trainerDocSnap.id,
            name: actualName || "Unknown Trainer",
            profileimage:
              trainerInfo.profileimage || trainerInfo.imageUrls?.[0],
            email: trainerInfo.email,
          };
          setTrainerData((prev) => ({
            ...prev,
            [trainerId]: trainer,
          }));
        } else {
          console.error(
            "Trainer ID mismatch: expected",
            trainerId,
            "but got",
            trainerDocSnap.id,
          );
          setTrainerData((prev) => {
            const newState = { ...prev };
            delete newState[trainerId];
            return newState;
          });
        }
      } else {
        console.error("No trainer document found with ID:", trainerId);
        setTrainerData((prev) => {
          const newState = { ...prev };
          delete newState[trainerId];
          return newState;
        });
      }
    } catch (error) {
      console.error("Error fetching trainer data:", error);
      setTrainerData((prev) => {
        const newState = { ...prev };
        delete newState[trainerId];
        return newState;
      });
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user || userRole !== "student") {
      router.push("/login");
      return;
    }

    // Set up real-time listener for student data using UID
    const studentDocRef = doc(db, "students", user.uid);
    const unsubscribeDoc = onSnapshot(
      studentDocRef,
      (doc) => {
        if (!doc.exists()) {
          setPrnMatch(false);
          setLoading(false);
          return;
        }

        const studentData = doc.data();

        // Check if courseTrainers exist and fetch individual trainer data if needed
        if (
          studentData.courseTrainers &&
          Array.isArray(studentData.courseTrainers)
        ) {
          // For now, we'll just log this data, but we could enhance to fetch detailed trainer info
        }

        // Ensure that the courseTrainers data is properly structured for display
        if (!studentData.courseTrainers) {
          // If there's no courseTrainers but there are courses with trainer info, we might need to migrate
        }

        // Check if courseTrainers exist and fetch individual trainer data if needed
        if (
          studentData.courseTrainers &&
          Array.isArray(studentData.courseTrainers)
        ) {
          // For now, we'll just log this data, but we could enhance to fetch detailed trainer info
        }

        // Check if PRN matches (optional validation)
        const prnToCheck = user.email?.split("@")[0] || user.uid;
        if (studentData.PrnNumber && studentData.PrnNumber !== prnToCheck) {
        }

        setPrnMatch(true);

        // Transform the student data to match our interface
        const transformedStudent: Student = {
          id: doc.id,
          PrnNumber: studentData.PrnNumber || "",
          fullName:
            studentData.fullName ||
            studentData.name ||
            studentData.username ||
            "Unknown Student",
          email: studentData.email || "",
          profileimage:
            studentData.profileimage ||
            studentData.imageUrl ||
            studentData.imageUrls?.[0] ||
            "",
          imageUrl: studentData.imageUrl || "",
          imageUrls: studentData.imageUrls || [],
          courses: studentData.courses || [],
          courseTrainers: studentData.courseTrainers || [],
        };

        setStudentData(transformedStudent);

        // Fetch trainer data if trainerId exists
        if (studentData.trainerId) {
          fetchTrainerData(studentData.trainerId, studentData.trainerName);
        } else {
          setTrainerData({});
        }

        // If there are courseTrainers, fetch detailed trainer data for each
        if (
          studentData.courseTrainers &&
          Array.isArray(studentData.courseTrainers)
        ) {
          // Fetch detailed trainer data for each course trainer
          const fetchAllTrainers = async () => {
            for (const courseTrainer of studentData.courseTrainers) {
              if (courseTrainer.trainerId) {
                await fetchTrainerData(
                  courseTrainer.trainerId,
                  courseTrainer.trainerName,
                );
              }
            }
          };

          fetchAllTrainers();
        }

        setLoading(false);
      },
      (error) => {
        console.error("Document listener error:", error);
        setPrnMatch(false);
        setLoading(false);
      },
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden ">
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
    <div className="min-h-[calc(100vh-6rem)] bg-white pt-4">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 ">
        {/* Header with Student and Trainer Information */}
        <div className="mb-6 bg-gradient-to-r from-[#991b1b] to-[#991b1b] p-4 rounded-2xl shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Student Info */}
              <div className="flex items-center gap-3">
                <div className="md:w-20 md:h-20 w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center overflow-hidden border-2 border-white border-opacity-50">
                  {studentData?.profileimage ? (
                    <img
                      src={studentData.profileimage}
                      alt={
                        studentData?.fullName ||
                        studentData?.name ||
                        studentData?.username ||
                        "Student Avatar"
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : studentData?.imageUrl ? (
                    <img
                      src={studentData.imageUrl}
                      alt={
                        studentData?.fullName ||
                        studentData?.name ||
                        studentData?.username ||
                        "Student Avatar"
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : studentData?.imageUrls &&
                    Array.isArray(studentData.imageUrls) &&
                    studentData.imageUrls[0] ? (
                    <img
                      src={studentData.imageUrls[0]}
                      alt={
                        studentData?.fullName ||
                        studentData?.name ||
                        studentData?.username ||
                        "Student Avatar"
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-black font-bold text-lg">
                      {(
                        studentData?.fullName ||
                        studentData?.name ||
                        studentData?.username ||
                        "S"
                      )
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  )}
                </div>
                <div>
                  <h1 className="md:text-2xl text-xl font-bold text-white">
                    Welcome ,
                    {studentData?.fullName ||
                      studentData?.name ||
                      studentData?.username ||
                      "Student"}
                  </h1>
                  {studentData?.PrnNumber && (
                    <p className="text-red-100 text-sm mt-1">
                      PRN: {studentData.PrnNumber}
                    </p>
                  )}
                  {studentData?.status && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        studentData.status === "active"
                          ? "bg-green-100 text-green-800 border w-32 text-center border-green-200"
                          : studentData.status === "inactive"
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      }`}
                    >
                      Status:
                      {studentData.status.charAt(0).toUpperCase() +
                        studentData.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* General Trainer Info */}
              {(Object.keys(trainerData).length > 0 ||
                studentData?.trainerName ||
                studentData?.trainerImage ||
                studentData?.courseTrainers?.some((ct) => ct.trainerImage) ||
                studentData?.courses?.some((course) => course.trainerImage)) && (
                <div className="flex items-center gap-3 bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden">
                    {(() => {
                      const headerTrainer = getHeaderTrainer();

                      return headerTrainer.image ? (
                        <img
                          src={headerTrainer.image}
                          alt={headerTrainer.name || "Trainer Avatar"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-black text-xl font-bold">
                          {getInitials(headerTrainer.name)}
                        </span>
                      );
                    })()}
                  </div>
                  <div>
                    <p className="text-black font-semibold">Trainer:</p>
                    <p className="text-black text-sm">
                      {getHeaderTrainer().name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ongoing Courses Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Ongoing Courses
          </h2>
          {studentData?.courses && studentData.courses.length > 0 ? (
            (() => {
              const ongoingCourses = studentData.courses.filter(
                (course: any) => !course.completed,
              );
              return ongoingCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {ongoingCourses.map(
                    (
                      course: {
                        name: string;
                        level: string;
                        classNumber: string;
                        completed?: boolean;
                        certificate?: boolean;
                        trainerId?: string;
                        trainerName?: string;
                        trainerImage?: string;
                      },
                      idx: number,
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

                      // Find trainer for this specific course
                      let courseTrainerInfo = null;
                      if (
                        studentData.courseTrainers &&
                        Array.isArray(studentData.courseTrainers)
                      ) {
                        courseTrainerInfo = studentData.courseTrainers.find(
                          (ct) =>
                            ct.courseName === course.name ||
                            ct.courseId === course.name,
                        );
                      }
                      // Fallback to general trainer info if no specific trainer for this course
                      if (!courseTrainerInfo && course.trainerName) {
                        courseTrainerInfo = {
                          trainerName: course.trainerName,
                          trainerId: course.trainerId || "",
                          courseName: course.name,
                          courseId: course.name,
                        };
                      }

                      // Get detailed trainer info if available
                      let detailedTrainer = null;
                      if (courseTrainerInfo && courseTrainerInfo.trainerId) {
                        detailedTrainer =
                          trainerData[courseTrainerInfo.trainerId];
                      }

                      return (
                        <Link key={idx} href={courseUrl}>
                          <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 border-l-8 border-[#991b1b] cursor-pointer group relative overflow-hidden">
                            {/* Certificate Badge */}
                            {course.certificate && (
                              <Image
                                src="/assets/certificate.png"
                                alt="Certificate"
                                width={64}
                                height={64}
                                className="absolute top-2 right-2 object-contain z-20"
                                style={{
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

                            {/* Course Trainer Info */}
                            {(courseTrainerInfo ||
                              detailedTrainer ||
                              course.trainerImage) && (
                              <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 rounded-lg">
                                <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden relative">
                                  {(() => {
                                    const trainerName =
                                      course.trainerName ||
                                      detailedTrainer?.name ||
                                      courseTrainerInfo?.trainerName ||
                                      "Trainer";
                                    const trainerImage = resolveTrainerImage(
                                      courseTrainerInfo,
                                      detailedTrainer,
                                      course.trainerImage,
                                    );

                                    return trainerImage ? (
                                      <>
                                        <img
                                          src={trainerImage}
                                          alt={trainerName}
                                          className="w-full h-full object-cover"
                                          onError={(e) => {
                                            e.currentTarget.style.display =
                                              "none";
                                            const initialsSpan =
                                              e.currentTarget
                                                .nextSibling as HTMLElement;
                                            if (initialsSpan) {
                                              initialsSpan.style.display =
                                                "block";
                                            }
                                          }}
                                          onLoad={(e) => {
                                            const initialsSpan =
                                              e.currentTarget
                                                .nextSibling as HTMLElement;
                                            if (initialsSpan) {
                                              initialsSpan.style.display =
                                                "none";
                                            }
                                          }}
                                        />
                                        <span className="text-white text-xs font-bold initials-display absolute inset-0 hidden flex items-center justify-center">
                                          {getInitials(trainerName)}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-white text-xs font-bold initials-display absolute inset-0 flex items-center justify-center">
                                        {getInitials(trainerName)}
                                      </span>
                                    );
                                  })()}
                                </div>
                                <div>
                                  <p className="text-xs text-gray-700 font-medium">
                                    Trainer:
                                  </p>
                                  <p className="text-xs text-gray-900">
                                    {course.trainerName ||
                                      detailedTrainer?.name ||
                                      courseTrainerInfo?.trainerName}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* Status Indicators */}
                            <div className="flex items-center gap-2 mt-3">
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
                    },
                  )}
                </div>
              ) : (
                <div className="text-gray-500">
                  No ongoing courses at the moment.
                </div>
              );
            })()
          ) : (
            <div className="text-gray-500">No courses assigned yet.</div>
          )}
        </div>

        {/* Completed Courses Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Completed Courses
          </h2>
          {studentData?.courses && studentData.courses.length > 0 ? (
            (() => {
              const completedCourses = studentData.courses.filter(
                (course: any) => course.completed,
              );
              return completedCourses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {completedCourses.map(
                    (
                      course: {
                        name: string;
                        level: string;
                        classNumber: string;
                        completed?: boolean;
                        certificate?: boolean;
                        trainerId?: string;
                        trainerName?: string;
                        trainerImage?: string;
                      },
                      idx: number,
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

                      // Find trainer for this specific course
                      let courseTrainerInfo = null;
                      if (
                        studentData.courseTrainers &&
                        Array.isArray(studentData.courseTrainers)
                      ) {
                        courseTrainerInfo = studentData.courseTrainers.find(
                          (ct) =>
                            ct.courseName === course.name ||
                            ct.courseId === course.name,
                        );
                      }
                      // Fallback to general trainer info if no specific trainer for this course
                      if (!courseTrainerInfo && course.trainerName) {
                        courseTrainerInfo = {
                          trainerName: course.trainerName,
                          trainerId: course.trainerId || "",
                          courseName: course.name,
                          courseId: course.name,
                        };
                      }

                      // Get detailed trainer info if available
                      let detailedTrainer = null;
                      if (courseTrainerInfo && courseTrainerInfo.trainerId) {
                        detailedTrainer =
                          trainerData[courseTrainerInfo.trainerId];
                      }

                      return (
                        <Link key={idx} href={courseUrl}>
                          <div className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 border-l-8 border-green-500 cursor-pointer group relative overflow-hidden">
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

                            {/* Course Trainer Info */}
                            {(courseTrainerInfo ||
                              detailedTrainer ||
                              course.trainerImage) && (
                              <div className="flex items-center gap-2 mt-2 p-2 bg-blue-50 rounded-lg">
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center overflow-hidden relative">
                                  {course.trainerImage ? (
                                    <Image
                                      src={course.trainerImage}
                                      alt={course.trainerName || "Trainer"}
                                      width={24}
                                      height={24}
                                      className="w-full h-full object-cover"
                                      unoptimized={true}
                                      onError={(e) => {
                                        // On error, hide the image element
                                        e.currentTarget.style.display = "none";
                                        // Show the initials span
                                        const initialsSpan = e.currentTarget
                                          .nextSibling as HTMLElement;
                                        if (
                                          initialsSpan &&
                                          initialsSpan.classList.contains(
                                            "initials-display",
                                          )
                                        ) {
                                          initialsSpan.style.display = "block";
                                        }
                                      }}
                                      onLoad={(e) => {
                                        // On load, hide the initials span
                                        const initialsSpan = e.currentTarget
                                          .nextSibling as HTMLElement;
                                        if (
                                          initialsSpan &&
                                          initialsSpan.classList.contains(
                                            "initials-display",
                                          )
                                        ) {
                                          initialsSpan.style.display = "none";
                                        }
                                      }}
                                    />
                                  ) : detailedTrainer?.profileimage ? (
                                    <Image
                                      src={detailedTrainer.profileimage}
                                      alt={
                                        detailedTrainer.name ||
                                        courseTrainerInfo?.trainerName ||
                                        "Trainer"
                                      }
                                      width={24}
                                      height={24}
                                      className="w-full h-full object-cover"
                                      unoptimized={true}
                                      onError={(e) => {
                                        // On error, hide the image element
                                        e.currentTarget.style.display = "none";
                                        // Show the initials span
                                        const initialsSpan = e.currentTarget
                                          .nextSibling as HTMLElement;
                                        if (
                                          initialsSpan &&
                                          initialsSpan.classList.contains(
                                            "initials-display",
                                          )
                                        ) {
                                          initialsSpan.style.display = "block";
                                        }
                                      }}
                                      onLoad={(e) => {
                                        // On load, hide the initials span
                                        const initialsSpan = e.currentTarget
                                          .nextSibling as HTMLElement;
                                        if (
                                          initialsSpan &&
                                          initialsSpan.classList.contains(
                                            "initials-display",
                                          )
                                        ) {
                                          initialsSpan.style.display = "none";
                                        }
                                      }}
                                    />
                                  ) : (
                                    <span className="text-white text-xs font-bold initials-display absolute inset-0 flex items-center justify-center">
                                      {(
                                        course.trainerName ||
                                        detailedTrainer?.name ||
                                        courseTrainerInfo?.trainerName ||
                                        ""
                                      )
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")
                                        .slice(0, 2)}
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="text-xs text-gray-700 font-medium">
                                    Trainer:
                                  </p>
                                  <p className="text-xs text-gray-900">
                                    {course.trainerName ||
                                      detailedTrainer?.name ||
                                      courseTrainerInfo?.trainerName}
                                  </p>
                                </div>
                              </div>
                            )}

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
                    },
                  )}
                </div>
              ) : (
                <div className="text-gray-500">No completed courses yet.</div>
              );
            })()
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
