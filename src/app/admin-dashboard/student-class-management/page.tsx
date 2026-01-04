"use client";
import { useState, useEffect } from "react";
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
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface StudentClassData {
  id: string;
  prn: string;
  studentName: string;
  courseNames: string[];
}

const StudentClassManagement = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<StudentClassData[]>([]);

  useEffect(() => {
    if (authLoading) return;

    if (!user || userRole !== "admin") {
      router.push("/login");
      return;
    }

    const fetchStudentData = async () => {
      setIsLoading(true);
      try {
        // Fetch all students from the database
        const studentsCollection = collection(db, "students");
        const querySnapshot = await getDocs(studentsCollection);

        const studentList: StudentClassData[] = [];

        // Process each student document
        querySnapshot.forEach((doc) => {
          const studentData = doc.data();
          const prn = studentData.PrnNumber || "N/A";
          const studentName =
            studentData.username ||
            studentData.fullName ||
            studentData.email?.split("@")[0] ||
            "Unknown Student";

          // Collect all courses for this student
          let courseNames: string[] = [];

          if (
            studentData.courses &&
            Array.isArray(studentData.courses) &&
            studentData.courses.length > 0
          ) {
            courseNames = studentData.courses.map((course: any) => {
              return typeof course === "string"
                ? course
                : course.name || course.courseName || "Unknown Course";
            });
          } else {
            // If no courses, add "No Course" entry
            courseNames = ["No Course"];
          }

          // Add a single entry for this student with all their courses
          studentList.push({
            id: doc.id,
            prn,
            studentName,
            courseNames,
          });
        });

        setStudents(studentList);
      } catch (error) {
        console.error("Error fetching student data:", error);
        // Still set loading to false but keep any existing data
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [user, userRole, authLoading, router]);

  if (authLoading || isLoading) {
    return <AuthLoadingSpinner />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="w-full">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-t-2xl">
          <CardTitle className="text-2xl font-bold">
            Student Class Management
          </CardTitle>
          <p className="opacity-90">
            Manage student enrollments and class assignments
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <Table className="min-w-full divide-y divide-gray-200">
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PRN Number
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course Name
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-200">
                {students.map((student) => (
                  <TableRow key={student.id} className="hover:bg-gray-50">
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.prn}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.studentName}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.courseNames.join(", ")}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/admin-dashboard/student-class-management/${student.prn}`}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {students.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No student records found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentClassManagement;
