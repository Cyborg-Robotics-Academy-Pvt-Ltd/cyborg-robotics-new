"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, useParams } from "next/navigation";
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
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import Link from "next/link";

interface StudentData {
  id: string;
  prn: string;
  username?: string;
  fullName?: string;
  email?: string;
  courses: any[];
  createdAt?: any;
  createdBy?: string;
  createdByRole?: string;
  lastLogin?: any;
  role?: string;
  status?: string;
  tasks?: any[];
  nextCourse?: string;
  profileimage?: string;
}

const StudentDetailsPage = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [student, setStudent] = useState<StudentData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user || userRole !== "admin") {
      router.push("/login");
      return;
    }

    const fetchStudent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Get the PRN from the URL parameter
        const prn = Array.isArray(params?.prn) ? params.prn[0] : params?.prn;

        if (!prn) {
          setError("PRN number not provided");
          setIsLoading(false);
          return;
        }

        // Query the students collection for the specific PRN
        const studentsRef = collection(db, "students");
        const q = query(studentsRef, where("PrnNumber", "==", prn));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          setError("No student found with this PRN number.");
          setIsLoading(false);
          return;
        }

        const studentDoc = querySnapshot.docs[0];
        const data = studentDoc.data();

        // Format the student data
        const studentData: StudentData = {
          id: studentDoc.id,
          prn: data.PrnNumber || "",
          username: data.username || "",
          fullName: data.fullName || "",
          email: data.email || "",
          courses: data.courses || [],
          createdAt: data.createdAt || null,
          createdBy: data.createdBy || "",
          createdByRole: data.createdByRole || "",
          lastLogin: data.lastLogin || null,
          role: data.role || "",
          status: data.status || "active", // Default to active if no status provided
          tasks: data.tasks || [],
          nextCourse: data.nextCourse || "",
          profileimage: data.profileimage || "",
        };

        setStudent(studentData);
      } catch (err) {
        console.error("Error fetching student:", err);
        setError("Failed to fetch student data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudent();
  }, [user, userRole, authLoading, router, params]);

  if (authLoading || isLoading) {
    return <AuthLoadingSpinner />;
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="w-full">
          <CardHeader className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-t-2xl">
            <CardTitle className="text-2xl font-bold">
              Student Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <p className="text-red-500 text-lg">{error}</p>
              <Link
                href="/admin-dashboard/student-class-management"
                className="mt-4 inline-block text-blue-600 hover:underline"
              >
                Back to Student Class Management
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <Card className="w-full">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-2xl">
            <CardTitle className="text-2xl font-bold">
              Student Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-8">
              <p className="text-gray-500">No student data available.</p>
              <Link
                href="/admin-dashboard/student-class-management"
                className="mt-4 inline-block text-blue-600 hover:underline"
              >
                Back to Student Class Management
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="w-full">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-2xl">
          <CardTitle className="text-2xl font-bold">Student Details</CardTitle>
          <p className="opacity-90">PRN: {student.prn}</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Personal Information</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {student.fullName || student.username || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  {student.email || "N/A"}
                </p>
                <p>
                  <span className="font-medium">PRN:</span> {student.prn}
                </p>
                <p>
                  <span className="font-medium">Role:</span>{" "}
                  {student.role || "N/A"}
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Account Information</h2>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Created By:</span>{" "}
                  {student.createdBy || "N/A"}
                </p>
                <p>
                  <span className="font-medium">Created By Role:</span>{" "}
                  {student.createdByRole || "N/A"}
                </p>
                {student.createdAt && (
                  <p>
                    <span className="font-medium">Created At:</span>{" "}
                    {student.createdAt.toDate
                      ? student.createdAt.toDate().toLocaleDateString()
                      : "N/A"}
                  </p>
                )}
                {student.lastLogin && (
                  <p>
                    <span className="font-medium">Last Login:</span>{" "}
                    {student.lastLogin.toDate
                      ? student.lastLogin.toDate().toLocaleDateString()
                      : "N/A"}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Enrolled Courses</h2>
            {student.courses && student.courses.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Name</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Class Number</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.courses.map((course: any, index: number) => {
                    // Handle different course data formats
                    const courseName =
                      typeof course === "string"
                        ? course
                        : course.name || course.courseName || "Unknown Course";
                    const level =
                      typeof course === "string"
                        ? "N/A"
                        : course.level || "N/A";
                    const classNumber =
                      typeof course === "string"
                        ? "N/A"
                        : course.classNumber || "N/A";
                    const status =
                      typeof course === "string"
                        ? "Enrolled"
                        : course.status || "Enrolled";

                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {courseName}
                        </TableCell>
                        <TableCell>{level}</TableCell>
                        <TableCell>{classNumber}</TableCell>
                        <TableCell>{status}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p>No courses enrolled.</p>
            )}
          </div>

          <div className="flex justify-between">
            <Link
              href="/admin-dashboard/student-class-management"
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              Back to Student List
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDetailsPage;
