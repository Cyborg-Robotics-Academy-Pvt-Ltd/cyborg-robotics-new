import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";

interface AssignPrnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: () => void; // Callback to refresh the student list
}

const AssignPrnModal: React.FC<AssignPrnModalProps> = ({
  isOpen,
  onClose,
  onAssign,
}) => {
  const [searchTerm, setSearchTerm] = useState(""); // Changed to a general search term
  const [studentEmail, setStudentEmail] = useState("");
  const [prnNumber, setPrnNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [studentFound, setStudentFound] = useState(false);
  const [studentName, setStudentName] = useState("");
  interface StudentData {
    id: string;
    name?: string;
    fullName?: string;
    username?: string;
    email?: string;
    [key: string]: any; // Allow additional properties
  }

  const [suggestions, setSuggestions] = useState<StudentData[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  if (!isOpen) return null;

  const fetchSuggestions = async (term: string) => {
    if (!term.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const studentsRef = collection(db, "students");
      const allStudentsSnapshot = await getDocs(studentsRef);

      // Filter students based on the search term
      const filteredStudents = allStudentsSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as StudentData)
        .filter((student) => {
          const fullName = (student.fullName || "").toLowerCase();
          const username = (student.username || "").toLowerCase();
          const name = (student.name || "").toLowerCase();
          const email = (student.email || "").toLowerCase();
          const searchLower = term.toLowerCase();

          return (
            fullName.includes(searchLower) ||
            username.includes(searchLower) ||
            name.includes(searchLower) ||
            email.includes(searchLower)
          );
        })
        .slice(0, 5); // Limit to 5 suggestions

      setSuggestions(filteredStudents);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchTerm.length > 0) {
      const timeoutId = setTimeout(() => {
        fetchSuggestions(searchTerm);
      }, 300); // Debounce for 300ms

      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  const handleSuggestionClick = (student: StudentData) => {
    setStudentName(student.name || student.fullName || student.username || "");
    setStudentEmail(student.email || "");
    setStudentFound(true);
    setSearchTerm(
      student.name ||
        student.fullName ||
        student.username ||
        student.email ||
        ""
    );
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearchStudent = async () => {
    if (!searchTerm.trim()) {
      toast.error("Please enter a name or email address");
      return;
    }

    setIsLoading(true);
    try {
      const studentsRef = collection(db, "students");

      // First, try to find by email (exact match)
      let querySnapshot = null;
      let isEmailSearch = searchTerm.includes("@"); // Simple check if it looks like an email

      if (isEmailSearch) {
        const emailQuery = query(
          studentsRef,
          where("email", "==", searchTerm.trim().toLowerCase())
        );
        querySnapshot = await getDocs(emailQuery);
      }

      // If not found by email or not an email, try to find by name
      if (!querySnapshot || querySnapshot.empty) {
        // Search for students by name (full name, username, or name fields)
        querySnapshot = await getDocs(studentsRef);

        // Filter clientside since Firestore doesn't support OR queries easily
        const matchingDocs = querySnapshot.docs.filter((doc) => {
          const data = doc.data();
          const fullName = (data.fullName || "").toLowerCase();
          const username = (data.username || "").toLowerCase();
          const name = (data.name || "").toLowerCase();
          const searchLower = searchTerm.toLowerCase();

          return (
            fullName.includes(searchLower) ||
            username.includes(searchLower) ||
            name.includes(searchLower)
          );
        });

        // Convert back to a compatible format
        querySnapshot = {
          empty: matchingDocs.length === 0,
          docs: matchingDocs,
        };
      }

      if (!querySnapshot.empty) {
        const studentDoc = querySnapshot.docs[0];
        const studentData = studentDoc.data();

        setStudentName(
          studentData.name || studentData.fullName || studentData.username || ""
        );
        setStudentEmail(studentData.email || ""); // Automatically populate email
        setStudentFound(true);
        toast.success("Student found!");
        setSuggestions([]); // Clear suggestions after selection
        setShowSuggestions(false);
      } else {
        setStudentFound(false);
        setStudentName("");
        setStudentEmail("");
        toast.error("No student found with this name or email");
      }
    } catch (error) {
      console.error("Error searching student:", error);
      toast.error("Error searching for student");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignPrn = async () => {
    if (!studentEmail.trim()) {
      toast.error("Please search and select a student first");
      return;
    }

    if (!prnNumber.trim()) {
      toast.error("Please enter a PRN number");
      return;
    }

    // Add CRA prefix to PRN number if not already present
    let prnWithPrefix = prnNumber.trim();
    if (!prnWithPrefix.startsWith("CRA")) {
      prnWithPrefix = `CRA${prnWithPrefix}`;
    }

    setIsLoading(true);
    try {
      // Check if PRN already exists
      const studentsRef = collection(db, "students");
      const prnQuery = query(
        studentsRef,
        where("PrnNumber", "==", prnWithPrefix)
      );
      const prnSnapshot = await getDocs(prnQuery);

      if (!prnSnapshot.empty) {
        toast.error("This PRN number is already assigned to another student");
        setIsLoading(false);
        return;
      }

      // Find student by email
      const q = query(studentsRef, where("email", "==", studentEmail.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("Student not found");
        setIsLoading(false);
        return;
      }

      const studentDoc = querySnapshot.docs[0];
      const studentRef = doc(db, "students", studentDoc.id);

      // Update student with PRN number
      await updateDoc(studentRef, {
        PrnNumber: prnWithPrefix,
      });

      toast.success("PRN number assigned successfully!");
      setSearchTerm(""); // Clear search term
      setStudentEmail("");
      setPrnNumber("");
      setStudentFound(false);
      setStudentName("");
      onAssign(); // Refresh the student list
      onClose();
    } catch (error) {
      console.error("Error assigning PRN:", error);
      toast.error("Error assigning PRN number. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-xl font-bold text-gray-900">
            Assign PRN Number
          </CardTitle>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-search">Search Student</Label>
              <div className="relative">
                <Input
                  id="student-search"
                  type="text"
                  placeholder="Enter student name or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchTerm.trim()) {
                      handleSearchStudent();
                    }
                  }}
                  disabled={isLoading}
                  className="flex-1"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#991b1b]"></div>
                  </div>
                )}

                {/* Suggestions dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((student, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                        onClick={() => handleSuggestionClick(student)}
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {student.name ||
                              student.fullName ||
                              student.username ||
                              "N/A"}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {student.email || "No email"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {studentFound && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <p className="text-red-700 font-medium">
                  Student Found: {studentName}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="prn-number">PRN Number</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  CRA
                </div>
                <Input
                  id="prn-number"
                  type="text"
                  placeholder="Enter PRN number (e.g. CRAKN1001)"
                  value={prnNumber}
                  onChange={(e) => {
                    // Only allow capital letters and numbers
                    const inputValue = e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, "");
                    setPrnNumber(inputValue);
                  }}
                  disabled={isLoading || !studentFound}
                  className="pl-12" // Add padding to accommodate the prefix
                />
              </div>
              {prnNumber && (
                <p className="text-sm text-gray-500">
                  Final PRN:{" "}
                  <span className="font-semibold text-green-600">
                    CRA{prnNumber}
                  </span>
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignPrn}
                disabled={
                  isLoading ||
                  !studentFound ||
                  !prnNumber.trim() ||
                  !studentEmail.trim()
                }
                className="flex-1 bg-red-800 hover:bg-red-900 text-white"
              >
                {isLoading ? "Assigning..." : "Assign PRN"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignPrnModal;
