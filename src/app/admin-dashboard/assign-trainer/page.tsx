"use client";

import { useState, useEffect, useMemo } from "react";
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

interface Student {
  id: string;
  prn: string;
  username?: string;
  fullName?: string;
  email?: string;
  trainerId?: string;
  trainerName?: string;
}

interface Trainer {
  id: string;
  name?: string;
  email?: string;
  username?: string;
}

const AssignTrainerPage = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTrainer, setFilterTrainer] = useState<string>("");

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
            trainerId: data.trainerId || "",
            trainerName: data.trainerName || "",
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

  const handleAssignTrainer = async (studentId: string, trainerId: string) => {
    try {
      // Find the trainer to get their name
      const trainer = trainers.find((t) => t.id === trainerId);
      const trainerName = trainer
        ? trainer.name || trainer.username || trainer.email
        : "";

      // Update student document with trainer assignment
      const studentDocRef = doc(db, "students", studentId);
      await updateDoc(studentDocRef, {
        trainerId: trainerId,
        trainerName: trainerName,
      });

      // Update local state
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.id === studentId
            ? { ...student, trainerId: trainerId, trainerName: trainerName }
            : student
        )
      );
    } catch (err) {
      console.error("Error assigning trainer:", err);
      setError("Failed to assign trainer. Please try again.");
    }
  };

  const handleRemoveTrainer = async (studentId: string) => {
    try {
      // Update student document to remove trainer assignment
      const studentDocRef = doc(db, "students", studentId);
      await updateDoc(studentDocRef, {
        trainerId: null,
        trainerName: null,
      });

      // Update local state
      setStudents((prevStudents) =>
        prevStudents.map((student) =>
          student.id === studentId
            ? { ...student, trainerId: undefined, trainerName: undefined }
            : student
        )
      );
    } catch (err) {
      console.error("Error removing trainer:", err);
      setError("Failed to remove trainer. Please try again.");
    }
  };

  // Filter and search logic
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.prn.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.fullName &&
          student.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.username &&
          student.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.email &&
          student.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (student.trainerName &&
          student.trainerName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesFilter =
        filterTrainer === "" || student.trainerId === filterTrainer;

      return matchesSearch && matchesFilter;
    });
  }, [students, searchTerm, filterTrainer]);

  if (authLoading || isLoading) {
    return <AuthLoadingSpinner />;
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <Card className="w-full">
        <CardHeader className="bg-gradient-to-r from-red-800 to-red-700 text-white rounded-t-2xl">
          <CardTitle className="text-2xl font-bold text-white">
            Assign Trainers to Students
          </CardTitle>
          <p className="opacity-90 text-white">
            Manage trainer assignments for students
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
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
              <select
                id="filterTrainer"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                value={filterTrainer}
                onChange={(e) => setFilterTrainer(e.target.value)}
              >
                <option value="">All Trainers</option>
                {trainers.map((trainer) => (
                  <option key={trainer.id} value={trainer.id}>
                    {trainer.name || trainer.username || trainer.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Students</h2>
              <span className="text-sm text-gray-500">
                Showing {filteredStudents.length} of {students.length} students
              </span>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PRN</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Trainer</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.prn}
                      </TableCell>
                      <TableCell>
                        {student.fullName || student.username || "N/A"}
                      </TableCell>
                      <TableCell>{student.email || "N/A"}</TableCell>
                      <TableCell>
                        {student.trainerName || "No Trainer Assigned"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Select
                            value={student.trainerId || ""}
                            onValueChange={(value) =>
                              handleAssignTrainer(student.id, value)
                            }
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Assign Trainer" />
                            </SelectTrigger>
                            <SelectContent>
                              {trainers.map((trainer) => (
                                <SelectItem key={trainer.id} value={trainer.id}>
                                  {trainer.name ||
                                    trainer.username ||
                                    trainer.email}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {student.trainerId && (
                            <Button
                              variant="outline"
                              onClick={() => handleRemoveTrainer(student.id)}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      No students found matching your search criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between">
            <Button
              onClick={() => router.push("/admin-dashboard")}
              variant="outline"
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
