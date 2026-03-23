"use client";

import { MoreHorizontal, UserPlus, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { createPortal } from "react-dom";
import React, { useEffect, useRef, useState } from "react";
import { MdAdd } from "react-icons/md";
import type { Student } from "./types";

type Props = {
  student: Student;
  onAddClass: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onAddCourse: (student: Student) => void;
  onViewDetails: (student: Student) => void;
};

export function StudentRowActions({
  student,
  onAddClass,
  onEditStudent,
  onAddCourse,
  onViewDetails,
}: Props) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open && anchorRef.current && dropdownRef.current) {
      const anchorRect = anchorRef.current.getBoundingClientRect();
      dropdownRef.current.style.position = "absolute";
      dropdownRef.current.style.top = `${anchorRect.bottom + window.scrollY}px`;
      dropdownRef.current.style.left = `${anchorRect.left + window.scrollX - 150}px`;
      dropdownRef.current.style.zIndex = "9999";
    }
  }, [open]);

  if (typeof window === "undefined" || !document.body) return null;

  return (
    <>
      <button
        ref={anchorRef}
        className="text-white bg-red-800 focus:outline-none p-1.5 md:p-2 rounded-full transition-colors shadow-md"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        aria-label={`More actions for ${student.username}`}
      >
        <MoreHorizontal className="h-5 w-5 md:h-6 md:w-6" />
      </button>
      {open &&
        createPortal(
          <div ref={dropdownRef}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="mt-2 w-40 md:w-48 z-50 bg-white rounded-2xl shadow-2xl border border-[#991b1b]/20 py-1"
            >
              <button
                onClick={() => onAddClass(student)}
                className="flex items-center w-full text-left px-3 md:px-4 py-2 text-xs md:text-sm text-gray-700 hover:bg-[#991b1b] hover:bg-opacity-10 hover:text-white transition-colors rounded-xl"
              >
                <UserPlus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                Add Student Class
              </button>
              <button
                onClick={() => onEditStudent(student)}
                className="flex items-center w-full text-left px-3 md:px-4 py-2 text-xs md:text-sm text-gray-700 hover:bg-[#991b1b] hover:bg-opacity-10 hover:text-white transition-colors rounded-xl"
              >
                <UserPlus className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                Edit Student Profile
              </button>
              <button
                onClick={() => onAddCourse(student)}
                className="flex items-center w-full text-left px-3 md:px-4 py-2 text-xs md:text-sm text-blue-700 hover:bg-[#991b1b] hover:bg-opacity-10 hover:text-white transition-colors rounded-xl"
              >
                <MdAdd className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                Add New Course
              </button>
              <button
                onClick={() => onViewDetails(student)}
                className="flex items-center w-full text-left px-3 md:px-4 py-2 text-xs md:text-sm text-gray-700 hover:bg-[#991b1b] hover:bg-opacity-10 hover:text-white transition-colors rounded-xl"
              >
                <Eye className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                View Details
              </button>
            </motion.div>
          </div>,
          document.body,
        )}
    </>
  );
}
