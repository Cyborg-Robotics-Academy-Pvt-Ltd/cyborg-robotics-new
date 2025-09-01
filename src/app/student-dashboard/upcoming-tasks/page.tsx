"use client";
import { collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import Head from "next/head";

// Define a type for the task
type Task = {
  course: string; // Assuming each task has a 'course' property
  task: string; // New property for task description
  dateTime: string; // New property for date and time
  status: string; // New property for task status
};

const Page = () => {
  // Changed from 'page' to 'Page' - component name starts with uppercase
  const [tasks, setTasks] = useState<Task[]>([]); // Step 1: State for tasks with type
  const auth = getAuth();
  const user = auth.currentUser; // Get the current user
  const loginEmail = user?.email; // Use optional chaining to safely access email
  const studentsRef = collection(db, "students");
  const q = loginEmail
    ? query(studentsRef, where("email", "==", loginEmail))
    : null; // Check if loginEmail is defined

  useEffect(() => {
    if (!user) {
      // Redirect to login page if user is not logged in
      window.location.href = "/login"; // Adjust the path as necessary
    }

    const fetchStudents = async () => {
      if (!q) return; // Exit if query is null
      const querySnapshot = await getDocs(q); // Await the promise
      const allTasks: Task[] = []; // Step 2: Array to hold all tasks with type
      querySnapshot.forEach((doc) => {
        const studentData = doc.data();
        allTasks.push(...studentData.tasks); // Collect tasks
      });
      setTasks(allTasks); // Update state with tasks
    };

    fetchStudents(); // Call the async function
  }, [q, user]); // Dependency array to re-run effect if 'q' or 'user' changes

  return (
    <>
      <Head>
        <title>Upcoming Tasks | Student Dashboard</title>
        <meta
          name="description"
          content="View your upcoming tasks and schedule at Cyborg Robotics Academy."
        />
        <meta
          property="og:title"
          content="Upcoming Tasks | Student Dashboard"
        />
        <meta
          property="og:description"
          content="View your upcoming tasks and schedule at Cyborg Robotics Academy."
        />
        <meta property="og:type" content="website" />
      </Head>
      <main
        role="main"
        aria-label="Upcoming Tasks"
        className="mt-32 flex justify-center"
      >
        <div className="w-full max-w-4xl">
          <Table>
            <TableHeader className="bg-indigo-50">
              <TableRow>
                <TableHead className="py-4 px-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                  Sr No
                </TableHead>
                <TableHead className="py-4 px-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                  Tasks
                </TableHead>
                <TableHead className="py-4 px-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                  Date and Time
                </TableHead>
                <TableHead className="py-4 px-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                  Status
                </TableHead>
                <TableHead className="py-4 px-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                  Course
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.length > 0 ? (
                tasks.map((task, index) => (
                  <TableRow
                    key={index}
                    className="hover:bg-indigo-50 transition-colors duration-150"
                  >
                    <TableCell className="py-4 px-4 text-sm text-gray-900 border-t">
                      {index + 1}
                    </TableCell>
                    <TableCell className="py-4 px-4 text-sm text-gray-900 border-t">
                      {task.task}
                    </TableCell>
                    <TableCell className="py-4 px-4 text-sm text-gray-900 border-t">
                      {new Date(task.dateTime).toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="py-4 px-4 text-sm text-gray-900 border-t">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          task.status === "complete"
                            ? "bg-green-100 text-green-800"
                            : task.status === "in progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {task.status}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 px-4 text-sm text-gray-900 border-t">
                      {task.course}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-16 text-center text-gray-500"
                  >
                    No upcoming tasks found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>
    </>
  );
};

export default Page;
