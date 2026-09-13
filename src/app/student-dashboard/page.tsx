"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { ClipboardList, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import AuthLoadingSpinner from "@/components/AuthLoadingSpinner";

// =========================
// Interfaces
// =========================

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

// =========================
// Helpers
// =========================

const getInitials = (name?: string) =>
  (name || "T")
    .trim()
    .split(/\s+/)
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const LEVEL_BADGE_STYLES: Record<string, string> = {
  Beginner: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Intermediate: "bg-blue-50 text-blue-700 border-blue-200",
  Advanced: "bg-orange-50 text-orange-700 border-orange-200",
  Expert: "bg-purple-50 text-purple-700 border-purple-200",
};

// =========================
// Component
// =========================

const StudentDashboard = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<Student | null>(null);
  const [trainerData, setTrainerData] = useState<Record<string, Trainer>>({});
  const [prnMatch, setPrnMatch] = useState<boolean | null>(null);

  const { user, userRole, loading: authLoading } = useAuth();

  // =========================
  // Resolve trainer image
  // =========================

  const resolveTrainerImage = (
    courseTrainerInfo?: CourseTrainer | null,
    detailedTrainer?: Trainer | null,
    fallbackImage?: string,
  ) => {
    return (
      fallbackImage ||
      courseTrainerInfo?.trainerImage ||
      detailedTrainer?.profileimage ||
      ""
    );
  };

  // =========================
  // Get primary trainer
  // =========================

  const getPrimaryTrainer = () => {
    return Object.values(trainerData)[0] || null;
  };

  // =========================
  // Header trainer
  // =========================

  const getHeaderTrainer = () => {
    const fetchedTrainer = getPrimaryTrainer();

    const courseTrainer =
      studentData?.courseTrainers?.find((ct) => ct.trainerId) || null;

    const courseTrainerImage =
      courseTrainer?.trainerImage ||
      studentData?.courses?.find((course) => course.trainerImage)
        ?.trainerImage ||
      studentData?.trainerImage ||
      "";

    return {
      name:
        fetchedTrainer?.name ||
        courseTrainer?.trainerName ||
        studentData?.trainerName ||
        "Unknown Trainer",

      image: fetchedTrainer?.profileimage || courseTrainerImage || "",
    };
  };

  // =========================
  // Fetch trainer data
  // =========================

  const fetchTrainerData = async (
    trainerId: string,
    expectedTrainerName?: string,
  ) => {
    if (!trainerId) {
      return;
    }

    try {
      const trainerDocRef = doc(db, "trainers", trainerId);
      const trainerDocSnap = await getDoc(trainerDocRef);

      if (!trainerDocSnap.exists()) {
        console.error("No trainer document found with ID:", trainerId);

        setTrainerData((prev) => {
          const newState = { ...prev };
          delete newState[trainerId];
          return newState;
        });

        return;
      }

      const trainerInfo = trainerDocSnap.data();

      // =========================
      // Trainer name
      // =========================

      const actualName =
        trainerInfo.name ||
        trainerInfo.fullName ||
        trainerInfo.username ||
        expectedTrainerName ||
        "Unknown Trainer";

      // =========================
      // Trainer image
      //
      // Supports all common field names
      // =========================

      const trainerImage =
        trainerInfo.profileimage ||
        trainerInfo.profileImage ||
        trainerInfo.imageUrl ||
        trainerInfo.imageURL ||
        trainerInfo.profileImageUrl ||
        (Array.isArray(trainerInfo.imageUrls)
          ? trainerInfo.imageUrls[0]
          : "") ||
        "";

      const trainer: Trainer = {
        id: trainerDocSnap.id,
        name: actualName,
        profileimage: trainerImage,
        email: trainerInfo.email || "",
      };

      setTrainerData((prev) => ({
        ...prev,
        [trainerId]: trainer,
      }));
    } catch (error) {
      console.error("Error fetching trainer data:", error);

      setTrainerData((prev) => {
        const newState = { ...prev };
        delete newState[trainerId];
        return newState;
      });
    }
  };

  // =========================
  // Format level
  // =========================

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

  // =========================
  // Course slug
  // =========================

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

    if (level) {
      let levelText = level;

      if (level === "1") levelText = "beginner";
      else if (level === "2") levelText = "intermediate";
      else if (level === "3") levelText = "advanced";
      else if (level === "4") levelText = "expert";

      slug += `-level-${levelText}`;
    }

    return slug;
  };

  // =========================
  // Course icon
  // =========================

  const getCourseIcon = (courseName: string) => {
    const courseIcons: Record<string, string> = {
      Python: "🐍",
      Java: "☕",
      Arduino: "🔌",
      "3D Printing": "🖨️",
      "Web Designing": "💻",
    };

    return courseIcons[courseName] || "📘";
  };

  // =========================
  // Get course trainer
  // =========================

  const getCourseTrainerInfo = (course: Course): CourseTrainer | null => {
    if (!studentData) {
      return null;
    }

    let courseTrainerInfo: CourseTrainer | null = null;

    if (
      studentData.courseTrainers &&
      Array.isArray(studentData.courseTrainers)
    ) {
      // First priority:
      // Match using trainerId if course has one
      if (course.trainerId) {
        courseTrainerInfo =
          studentData.courseTrainers.find(
            (ct) => ct.trainerId === course.trainerId,
          ) || null;
      }

      // Second priority:
      // Match course name / course id
      if (!courseTrainerInfo) {
        courseTrainerInfo =
          studentData.courseTrainers.find(
            (ct) =>
              ct.courseName === course.name || ct.courseId === course.name,
          ) || null;
      }
    }

    // Fallback to trainer information stored directly on course
    if (!courseTrainerInfo && course.trainerName) {
      courseTrainerInfo = {
        trainerName: course.trainerName,
        trainerId: course.trainerId || "",
        courseName: course.name,
        courseId: course.name,
        trainerImage: course.trainerImage,
      };
    }

    return courseTrainerInfo;
  };

  // =========================
  // Auth + Firestore listener
  // =========================

  useEffect(() => {
    if (authLoading) return;

    if (!user || userRole !== "student") {
      router.push("/login");
      return;
    }

    const studentDocRef = doc(db, "students", user.uid);

    const unsubscribeDoc = onSnapshot(
      studentDocRef,
      (studentDoc) => {
        if (!studentDoc.exists()) {
          setPrnMatch(false);
          setLoading(false);
          return;
        }

        const firestoreStudentData = studentDoc.data();

        // =========================
        // PRN check
        // =========================

        const prnToCheck = user.email?.split("@")[0] || user.uid;

        if (
          firestoreStudentData.PrnNumber &&
          firestoreStudentData.PrnNumber !== prnToCheck
        ) {
          // Keeping original behavior.
          // PRN mismatch does not immediately block here.
        }

        setPrnMatch(true);

        // =========================
        // Transform student data
        // =========================

        const transformedStudent: Student = {
          id: studentDoc.id,

          PrnNumber: firestoreStudentData.PrnNumber || "",

          fullName:
            firestoreStudentData.fullName ||
            firestoreStudentData.name ||
            firestoreStudentData.username ||
            "Unknown Student",

          name: firestoreStudentData.name,

          username: firestoreStudentData.username,

          email: firestoreStudentData.email || "",

          profileimage:
            firestoreStudentData.profileimage ||
            firestoreStudentData.profileImage ||
            firestoreStudentData.imageUrl ||
            firestoreStudentData.imageURL ||
            (Array.isArray(firestoreStudentData.imageUrls)
              ? firestoreStudentData.imageUrls[0]
              : "") ||
            "",

          imageUrl:
            firestoreStudentData.imageUrl ||
            firestoreStudentData.imageURL ||
            "",

          imageUrls: Array.isArray(firestoreStudentData.imageUrls)
            ? firestoreStudentData.imageUrls
            : [],

          courses: Array.isArray(firestoreStudentData.courses)
            ? firestoreStudentData.courses
            : [],

          courseTrainers: Array.isArray(firestoreStudentData.courseTrainers)
            ? firestoreStudentData.courseTrainers
            : [],

          status: firestoreStudentData.status,

          trainerId: firestoreStudentData.trainerId,

          trainerName: firestoreStudentData.trainerName,

          trainerImage:
            firestoreStudentData.trainerImage ||
            firestoreStudentData.trainerimage ||
            "",
        };

        setStudentData(transformedStudent);

        // =========================
        // Reset trainer data
        // =========================

        setTrainerData({});

        // =========================
        // Fetch general trainer
        // =========================

        if (firestoreStudentData.trainerId) {
          fetchTrainerData(
            firestoreStudentData.trainerId,
            firestoreStudentData.trainerName,
          );
        }

        // =========================
        // Fetch course trainers
        // =========================

        if (Array.isArray(firestoreStudentData.courseTrainers)) {
          const trainerIds = new Set<string>();

          firestoreStudentData.courseTrainers.forEach(
            (courseTrainer: CourseTrainer) => {
              if (courseTrainer?.trainerId) {
                trainerIds.add(courseTrainer.trainerId);
              }
            },
          );

          trainerIds.forEach((trainerId) => {
            const trainerInfo = firestoreStudentData.courseTrainers.find(
              (ct: CourseTrainer) => ct.trainerId === trainerId,
            );

            fetchTrainerData(trainerId, trainerInfo?.trainerName);
          });
        }

        setLoading(false);
      },
      (error) => {
        console.error("Document listener error:", error);

        setPrnMatch(false);
        setLoading(false);
      },
    );

    return () => unsubscribeDoc();
  }, [user, userRole, authLoading, router]);

  // =========================
  // Loading
  // =========================

  if (authLoading || loading) {
    return <AuthLoadingSpinner />;
  }

  // =========================
  // Access denied
  // =========================

  if (prnMatch === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-800/5 rounded-full blur-3xl animate-pulse" />

          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-800/5 rounded-full blur-3xl animate-pulse delay-1000" />
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

          <h2
            className="text-3xl font-bold mb-3"
            style={{
              color: "#991b1b",
            }}
          >
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

  // =========================
  // Render course card
  // =========================

  const renderCourseCard = (
    course: Course,
    idx: number,
    completed: boolean,
  ) => {
    if (!studentData) {
      return null;
    }

    const icon = getCourseIcon(course.name);

    const courseLevel = formatLevel(course.level);

    const courseSlug = toSlug(course.name, course.level);

    const courseUrl = `/${studentData.PrnNumber}/${courseSlug}`;

    // =========================
    // Course trainer
    // =========================

    const courseTrainerInfo = getCourseTrainerInfo(course);

    // =========================
    // Detailed trainer
    // =========================

    const detailedTrainer = courseTrainerInfo?.trainerId
      ? trainerData[courseTrainerInfo.trainerId] || null
      : course.trainerId
        ? trainerData[course.trainerId] || null
        : null;

    // =========================
    // FINAL TRAINER IMAGE
    //
    // Priority:
    // 1. course.trainerImage
    // 2. courseTrainerInfo.trainerImage
    // 3. Firebase trainer profile image
    // =========================

    const trainerImage = resolveTrainerImage(
      courseTrainerInfo,
      detailedTrainer,
      course.trainerImage,
    );

    // =========================
    // FINAL TRAINER NAME
    // =========================

    const trainerName =
      course.trainerName ||
      detailedTrainer?.name ||
      courseTrainerInfo?.trainerName ||
      "Trainer";

    const hasTrainer =
      Boolean(courseTrainerInfo) ||
      Boolean(detailedTrainer) ||
      Boolean(trainerImage) ||
      Boolean(course.trainerName);

    return (
      <Link key={idx} href={courseUrl}>
        <div
          className={`bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer group relative overflow-hidden ${
            completed
              ? "border-l-8 border-green-500"
              : "border-l-8 border-[#991b1b]"
          }`}
        >
          {/* Certificate badge */}
          {!completed && course.certificate && (
            <Image
              src="/assets/certificate.png"
              alt="Certificate"
              width={64}
              height={64}
              className="absolute top-2 right-2 object-contain z-20"
            />
          )}

          {/* Course heading */}
          <div className="flex items-center mb-2 gap-2">
            <span className="text-2xl mr-1">{icon}</span>

            <h3 className="text-lg font-semibold text-gray-900">
              {course.name}
            </h3>

            <span
              className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full border ${
                LEVEL_BADGE_STYLES[courseLevel] ||
                "bg-gray-100 text-gray-700 border-gray-200"
              }`}
            >
              {courseLevel}
            </span>
          </div>

          {/* Class */}
          <p className="text-gray-600 mb-1">Class: {course.classNumber}</p>

          {/* =========================
              Trainer
          ========================= */}

          {hasTrainer && (
            <div className="flex items-center gap-2.5 mt-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
              {/* Trainer avatar */}
              <div
                className={`w-10 h-10 rounded-full ring-2 ring-white shadow-sm flex items-center justify-center overflow-hidden relative shrink-0 ${
                  completed
                    ? "bg-gradient-to-br from-emerald-600 to-emerald-800"
                    : "bg-gradient-to-br from-[#991b1b] to-[#6f1414]"
                }`}
              >
                {trainerImage ? (
                  <>
                    <Image
                      src={trainerImage}
                      alt={trainerName}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                      unoptimized
                      onError={(e) => {
                        e.currentTarget.style.display = "none";

                        const fallback = e.currentTarget
                          .nextElementSibling as HTMLElement | null;

                        if (fallback) {
                          fallback.style.display = "flex";
                        }
                      }}
                    />

                    {/* Fallback initials */}
                    <span className="absolute inset-0 hidden items-center justify-center text-white text-xs font-bold">
                      {getInitials(trainerName)}
                    </span>
                  </>
                ) : (
                  <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(trainerName)}
                  </span>
                )}
              </div>

              {/* Trainer information */}
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold leading-none mb-1">
                  Trainer
                </p>

                <p className="text-sm text-gray-800 font-medium truncate">
                  {trainerName}
                </p>
              </div>
            </div>
          )}

          {/* =========================
              Status
          ========================= */}

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {completed && course.completed && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                <svg
                  className="w-3 h-3"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  fill="none"
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
                  fill="none"
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
  };

  // =========================
  // Courses
  // =========================

  const ongoingCourses =
    studentData?.courses?.filter((course) => !course.completed) || [];

  const completedCourses =
    studentData?.courses?.filter((course) => course.completed) || [];

  // =========================
  // Header trainer
  // =========================

  const headerTrainer = getHeaderTrainer();

  const showHeaderTrainer =
    Object.keys(trainerData).length > 0 ||
    Boolean(studentData?.trainerName) ||
    Boolean(studentData?.trainerImage) ||
    Boolean(studentData?.courseTrainers?.some((ct) => ct.trainerImage)) ||
    Boolean(studentData?.courses?.some((course) => course.trainerImage));

  // =========================
  // Main UI
  // =========================

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-white pt-4">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        {/* =========================
            Header
        ========================= */}

        <div className="mb-6 bg-gradient-to-r from-[#991b1b] to-[#991b1b] p-4 rounded-2xl shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* Student information */}

              <div className="flex items-center gap-3">
                <div className="md:w-20 md:h-20 w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center overflow-hidden border-2 border-white border-opacity-50">
                  {studentData?.profileimage ? (
                    <Image
                      width={80}
                      height={80}
                      src={studentData.profileimage}
                      alt={studentData.fullName || "Student Avatar"}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : studentData?.imageUrl ? (
                    <Image
                      width={80}
                      height={80}
                      src={studentData.imageUrl}
                      alt={studentData.fullName || "Student Avatar"}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : studentData?.imageUrls?.[0] ? (
                    <Image
                      width={80}
                      height={80}
                      src={studentData.imageUrls[0]}
                      alt={studentData.fullName || "Student Avatar"}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-black font-bold text-lg">
                      {getInitials(
                        studentData?.fullName ||
                          studentData?.name ||
                          studentData?.username ||
                          "S",
                      )}
                    </span>
                  )}
                </div>

                <div>
                  <h1 className="md:text-2xl text-xl font-bold text-white">
                    Welcome,{" "}
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
                      className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-semibold ${
                        studentData.status === "active"
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : studentData.status === "inactive"
                            ? "bg-red-100 text-red-800 border border-red-200"
                            : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      }`}
                    >
                      Status:{" "}
                      {studentData.status.charAt(0).toUpperCase() +
                        studentData.status.slice(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* =========================
                  General Trainer
              ========================= */}

              {showHeaderTrainer && (
                <div className="flex items-center gap-3 bg-white bg-opacity-20 p-3 rounded-xl backdrop-blur-sm">
                  <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center overflow-hidden relative">
                    {headerTrainer.image ? (
                      <>
                        <Image
                          width={48}
                          height={48}
                          src={headerTrainer.image}
                          alt={headerTrainer.name || "Trainer Avatar"}
                          className="w-full h-full object-cover"
                          unoptimized
                          onError={(e) => {
                            e.currentTarget.style.display = "none";

                            const fallback = e.currentTarget
                              .nextElementSibling as HTMLElement | null;

                            if (fallback) {
                              fallback.style.display = "flex";
                            }
                          }}
                        />

                        <span className="absolute inset-0 hidden items-center justify-center text-black text-lg font-bold">
                          {getInitials(headerTrainer.name)}
                        </span>
                      </>
                    ) : (
                      <span className="text-black text-lg font-bold">
                        {getInitials(headerTrainer.name)}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-black font-semibold">Trainer:</p>

                    <p className="text-black text-sm">{headerTrainer.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* =========================
            Ongoing Courses
        ========================= */}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Ongoing Courses
          </h2>

          {studentData?.courses && studentData.courses.length > 0 ? (
            ongoingCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {ongoingCourses.map((course, idx) =>
                  renderCourseCard(course, idx, false),
                )}
              </div>
            ) : (
              <div className="text-gray-500">
                No ongoing courses at the moment.
              </div>
            )
          ) : (
            <div className="text-gray-500">No courses assigned yet.</div>
          )}
        </div>

        {/* =========================
            Completed Courses
        ========================= */}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Completed Courses
          </h2>

          {studentData?.courses && studentData.courses.length > 0 ? (
            completedCourses.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {completedCourses.map((course, idx) =>
                  renderCourseCard(course, idx, true),
                )}
              </div>
            ) : (
              <div className="text-gray-500">No completed courses yet.</div>
            )
          ) : (
            <div className="text-gray-500">No courses assigned yet.</div>
          )}
        </div>

        {/* =========================
            Media
        ========================= */}

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
