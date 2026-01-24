"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import Image from "next/image";

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
}

interface Course {
  name: string;
  level: string;
  classNumber: string;
  status: string;
  trainerId?: string;
  trainerName?: string;
  completed?: boolean;
  certificate?: boolean;
}

interface Student {
  id: string;
  PrnNumber: string;
  fullName: string;
  email: string;
  courses: Course[];
  courseTrainers: CourseTrainer[];
}

export default function FetchTrainerInfo() {
  const [student, setStudent] = useState<Student | null>(null);
  const [trainers, setTrainers] = useState<Record<string, Trainer>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch student data by PRN number
  const fetchStudentByPrn = async (prn: string) => {
    try {
      const studentsRef = collection(db, "students");
      const q = query(studentsRef, where("PrnNumber", "==", prn));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error(`No student found with PRN: ${prn}`);
      }

      const studentDoc = querySnapshot.docs[0];
      const studentData = studentDoc.data();

      const studentObj: Student = {
        id: studentDoc.id,
        PrnNumber: studentData.PrnNumber || "",
        fullName:
          studentData.fullName ||
          studentData.name ||
          studentData.username ||
          "Unknown Student",
        email: studentData.email || "",
        courses: studentData.courses || [],
        courseTrainers: studentData.courseTrainers || [],
      };

      setStudent(studentObj);
      return studentObj;
    } catch (err) {
      console.error("Error fetching student:", err);
      throw err;
    }
  };

  // Function to fetch trainer data by ID
  const fetchTrainerById = async (
    trainerId: string
  ): Promise<Trainer | null> => {
    try {
      const trainerDocRef = doc(db, "trainers", trainerId);
      const trainerDoc = await getDoc(trainerDocRef);

      if (!trainerDoc.exists()) {
        console.warn(`No trainer found with ID: ${trainerId}`);
        return null;
      }

      const trainerData = trainerDoc.data();

      const trainer: Trainer = {
        id: trainerDoc.id,
        name:
          trainerData.name ||
          trainerData.fullName ||
          trainerData.username ||
          "Unknown Trainer",
        profileimage: trainerData.profileimage || trainerData.imageUrls?.[0],
        email: trainerData.email,
      };

      return trainer;
    } catch (err) {
      console.error(`Error fetching trainer with ID ${trainerId}:`, err);
      return null;
    }
  };

  // Main function to fetch student and associated trainers
  const fetchStudentAndTrainers = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch student with PRN CRAKN1002
      const studentData = await fetchStudentByPrn("CRAKN1002");

      // Create a combined list of courses with trainer info
      // First, try to get trainer info from the courseTrainers array
      const courseTrainersMap: Record<
        string,
        { trainerId: string; trainerName: string }
      > = {};
      studentData.courseTrainers?.forEach((ct) => {
        // Map by courseName to trainer info
        courseTrainersMap[ct.courseName] = {
          trainerId: ct.trainerId,
          trainerName: ct.trainerName,
        };
      });

      // Enhance courses with trainer info from courseTrainers if not already present
      const enhancedCourses = studentData.courses.map((course) => {
        // Look for a match in courseTrainers using the course name
        const matchedCourseTrainer = courseTrainersMap[course.name];

        return {
          ...course,
          trainerId: course.trainerId || matchedCourseTrainer?.trainerId,
          trainerName: course.trainerName || matchedCourseTrainer?.trainerName,
        };
      });

      // Update student with enhanced courses
      setStudent((prev) =>
        prev ? { ...prev, courses: enhancedCourses } : null
      );

      // Fetch trainers for all unique trainer IDs
      const uniqueTrainerIds = Array.from(
        new Set(
          enhancedCourses
            .filter((course) => course.trainerId)
            .map((course) => course.trainerId)
        )
      ) as string[];

      const trainerPromises = uniqueTrainerIds.map(async (trainerId) => {
        const trainer = await fetchTrainerById(trainerId);
        return { trainerId, trainer };
      });

      const trainerResults = await Promise.all(trainerPromises);

      // Build trainers object
      const trainersMap: Record<string, Trainer> = {};
      trainerResults.forEach((result) => {
        if (result && result.trainer) {
          trainersMap[result.trainerId] = result.trainer;
        }
      });

      setTrainers(trainersMap);
    } catch (err: any) {
      setError(err.message || "An error occurred while fetching data");
      console.error("Error in fetchStudentAndTrainers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentAndTrainers();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">
            Fetching trainer information...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchStudentAndTrainers}
            className="mt-4 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Trainer Information for PRN: {student?.PrnNumber}
        </h1>

        {student && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Student: {student.fullName}
            </h2>

            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-3">
                Courses and Trainers
              </h3>

              {student.courses.length > 0 ? (
                <div className="space-y-4">
                  {student.courses.map((course, index) => {
                    const trainer = course.trainerId
                      ? trainers[course.trainerId]
                      : null;

                    return (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 flex items-start"
                      >
                        <div className="mr-4">
                          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            {trainer?.profileimage ? (
                              <Image
                                src={trainer.profileimage}
                                alt={trainer.name}
                                width={64}
                                height={64}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-gray-600 font-bold">
                                {trainer?.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .slice(0, 2)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {course.name} (Level {course.level})
                          </h4>
                          <p className="text-gray-600 text-sm">
                            Class: {course.classNumber} | Status:{" "}
                            {course.status}
                            {course.completed !== undefined &&
                              ` | Completed: ${course.completed}`}
                            {course.certificate !== undefined &&
                              ` | Certificate: ${course.certificate}`}
                          </p>

                          {trainer ? (
                            <div className="mt-2">
                              <p className="font-medium text-gray-800">
                                Trainer: {trainer.name}
                              </p>
                              {trainer.email && (
                                <p className="text-gray-600 text-sm">
                                  {trainer.email}
                                </p>
                              )}
                              {course.trainerName &&
                                course.trainerName !== trainer.name && (
                                  <p className="text-gray-500 text-sm italic">
                                    Recorded as: {course.trainerName}
                                  </p>
                                )}
                            </div>
                          ) : (
                            <div className="mt-2 text-red-600">
                              <p>No trainer assigned</p>
                              {course.trainerName && (
                                <p className="text-sm">
                                  Recorded trainer name: {course.trainerName}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-600">
                  No courses found for this student.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Display courseTrainers data if available */}
        {student?.courseTrainers && student.courseTrainers.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              Course Trainers Mapping
            </h3>

            <div className="space-y-3">
              {student.courseTrainers.map((ct, index) => {
                const trainer = ct.trainerId ? trainers[ct.trainerId] : null;

                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <p className="font-medium text-gray-800">
                      {ct.courseName} ({ct.courseId})
                    </p>
                    <p className="text-gray-600 text-sm">
                      Assigned to:{" "}
                      {trainer
                        ? trainer.name
                        : ct.trainerName || "No trainer assigned"}
                      {trainer && trainer.email && (
                        <span> ({trainer.email})</span>
                      )}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Display raw data for verification */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Raw Data</h3>

          <details className="mb-4">
            <summary className="cursor-pointer text-blue-600 font-medium">
              Show Student Data
            </summary>
            <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
              {JSON.stringify(student, null, 2)}
            </pre>
          </details>

          <details>
            <summary className="cursor-pointer text-blue-600 font-medium">
              Show Trainers Data
            </summary>
            <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
              {JSON.stringify(trainers, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    </div>
  );
}
