"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { Student } from "./types";

type Props = {
  students: Student[];
  activeTab: string;
  sortColumn: "PrnNumber" | "username" | "completedTasks";
  sortDirection: "asc" | "desc";
  onSort: (column: "PrnNumber" | "username" | "completedTasks") => void;
  onStudentClick: (student: Student) => void;
  renderActions: (student: Student) => ReactNode;
};

const isCourseActive = (course: Student["courses"][number]) =>
  !course.completed && (!course.status || course.status.toLowerCase() !== "complete");

export function StudentListTable({
  students,
  activeTab,
  sortColumn,
  sortDirection,
  onSort,
  onStudentClick,
  renderActions,
}: Props) {
  return (
    <div className="overflow-x-auto overflow-visible rounded-xl shadow-lg border border-gray-200">
      <Table className="min-w-full divide-y divide-gray-200">
        <TableHeader>
          <TableRow className="bg-red-800 border-b border-gray-200">
            <TableHead className="font-semibold text-white py-3 px-3 md:px-4 cursor-pointer text-xs md:text-sm" onClick={() => onSort("PrnNumber")}>
              <div className="flex items-center">
                PRN Number
                {sortColumn === "PrnNumber" && (
                  <ChevronDown className={`ml-2 h-4 w-4 transform transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                )}
              </div>
            </TableHead>
            <TableHead className="font-semibold text-white py-3 px-3 md:px-4 cursor-pointer text-xs md:text-sm" onClick={() => onSort("username")}>
              <div className="flex items-center">
                Student Name
                {sortColumn === "username" && (
                  <ChevronDown className={`ml-2 h-4 w-4 transform transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                )}
              </div>
            </TableHead>
            <TableHead className="font-semibold text-white py-3 px-3 md:px-4 text-xs md:text-sm">Courses</TableHead>
            <TableHead className="font-semibold text-white py-3 px-3 md:px-4 text-xs md:text-sm">Assigned Trainer</TableHead>
            {activeTab === "hold" && (
              <TableHead className="font-semibold text-white py-3 px-3 md:px-4 text-xs md:text-sm">Next Course</TableHead>
            )}
            <TableHead className="font-semibold text-white py-3 px-3 md:px-4 cursor-pointer text-xs md:text-sm" onClick={() => onSort("completedTasks")}>
              <div className="flex items-center">
                Classes
                {sortColumn === "completedTasks" && (
                  <ChevronDown className={`ml-2 h-4 w-4 transform transition-transform ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                )}
              </div>
            </TableHead>
            <TableHead className="font-semibold text-white py-3 px-3 md:px-4 text-right text-xs md:text-sm sticky right-0 bg-red-800 z-10 border-l border-gray-200">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {students.map((student, idx) => (
            <TableRow
              key={student.id}
              className={`transition-colors duration-200 cursor-pointer ${idx % 2 === 0 ? "bg-white" : "bg-red-50"} hover:bg-red-50`}
              onClick={() => onStudentClick(student)}
            >
              <TableCell className="font-mono text-gray-900 py-3 px-3 md:px-4 text-xs md:text-sm">{student.PrnNumber || <span className="text-red-600 font-semibold">Assign PRN</span>}</TableCell>
              <TableCell className="font-medium text-gray-900 py-3 px-3 md:px-4 text-xs md:text-sm">{student.username}</TableCell>
              <TableCell className="text-gray-600 py-3 px-3 md:px-4 text-xs md:text-sm">
                {student.courses.length > 0 ? student.courses.map((course) => course.name ? `${course.name}${course.level ? ` (Lvl ${course.level})` : ""}` : "").filter(Boolean).slice(0, 2).join(", ") + (student.courses.length > 2 ? "..." : "") : <span className="text-red-600 font-semibold">No courses</span>}
              </TableCell>
              <TableCell className="text-gray-600 py-3 px-3 md:px-4 text-xs md:text-sm">
                {student.courses.some(isCourseActive)
                  ? student.courses.filter(isCourseActive).map((course) => course.trainerName || "No Trainer").slice(0, 2).join(", ")
                  : <span className="text-red-600 font-semibold">None Assigned</span>}
              </TableCell>
              {activeTab === "hold" && (
                <TableCell className="text-gray-600 py-3 px-3 md:px-4 text-xs md:text-sm">
                  {student.nextCourse ? (
                    student.nextCourse.startsWith("Not Enrolling: ") ? (
                      <div className="flex items-center gap-1">
                        <span className="inline-block px-2 py-0.5 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Not Enrolling</span>
                        <span className="text-xs text-gray-600 ml-1">{student.nextCourse.substring("Not Enrolling: ".length)}</span>
                      </div>
                    ) : student.nextCourse.startsWith("Join Soon: ") ? (
                      <div className="flex items-center gap-1">
                        <span className="inline-block px-2 py-0.5 text-xs font-semibold text-blue-800 bg-blue-100 rounded-full">Join Soon</span>
                        <span className="text-xs text-gray-600 ml-1">{student.nextCourse.substring("Join Soon: ".length)}</span>
                      </div>
                    ) : (
                      <span className="text-xs">{student.nextCourse}</span>
                    )
                  ) : (
                    <span>-</span>
                  )}
                </TableCell>
              )}
              <TableCell className="text-gray-600 py-4 px-3 md:px-4 text-xs md:text-sm">
                {student.tasks.filter((t) => t.status.toLowerCase() === "complete").slice(0, 1).length > 0 ? (
                  student.tasks.filter((t) => t.status.toLowerCase() === "complete").slice(0, 1).map((task, i) => (
                    <div key={i} className="text-xs text-gray-500 max-w-md">{task.course}: {task.task}</div>
                  ))
                ) : (
                  <div className="text-xs text-red-600 font-semibold max-w-md">No latest classes</div>
                )}
              </TableCell>
              <TableCell className="text-right py-3 px-3 md:px-4 sticky right-0 bg-white z-10">
                {renderActions(student)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
