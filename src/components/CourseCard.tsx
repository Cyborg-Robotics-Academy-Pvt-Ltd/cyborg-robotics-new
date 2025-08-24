import React from "react";
import { BookOpen, Trophy } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface CourseData {
  classNumber: string;
  level: string;
  name: string;
  certificate?: boolean;
  completed?: boolean;
}

interface Student {
  PrnNumber: string;
  username: string;
  courses: CourseData[];
  courseClassNumbers?: {
    [key: string]: string;
  };
}

// Memoized utility functions
const toSlug = React.memo((courseName: string) => {
  if (typeof courseName !== "string" || !courseName) {
    return "";
  }
  return courseName
    .toLowerCase()
    .replace(/ & /g, "-and-")
    .replace(/ \+ /g, "-plus-")
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
});

toSlug.displayName = "toSlug";

const getLevelColor = React.memo((level: string) => {
  switch (level.toLowerCase()) {
    case "1":
    case "beginner":
      return "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 shadow-green-100";
    case "2":
    case "intermediate":
      return "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200 shadow-blue-100";
    case "3":
    case "advanced":
      return "bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border-purple-200 shadow-purple-100";
    case "4":
    case "expert":
      return "bg-gradient-to-r from-orange-50 to-amber-50 text-orange-700 border-orange-200 shadow-orange-100";
    default:
      return "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200 shadow-gray-100";
  }
});

getLevelColor.displayName = "getLevelColor";

const getLevelLabel = React.memo((level: string) => {
  switch (level.toLowerCase()) {
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
});

getLevelLabel.displayName = "getLevelLabel";

interface CourseCardProps {
  course: CourseData;
  index: number;
  student: Student;
  isAdmin: boolean;
  userChecked: boolean;
  editingIndex: number | null;
  newClassNumber: string;
  loading: boolean;
  onEditClick: (index: number, classNumber: string) => void;
  onSave: (index: number) => void;
  onCancel: () => void;
  onNewClassNumberChange: (value: string) => void;
}

const CourseCard = React.memo<CourseCardProps>(
  ({
    course,
    index,
    student,
    isAdmin,
    userChecked,
    editingIndex,
    newClassNumber,
    loading,
    onEditClick,
    onSave,
    onCancel,
    onNewClassNumberChange,
  }) => {
    return (
      <div className="group relative bg-gradient-to-br from-white via-gray-50/50 to-white border border-gray-200/60 rounded-3xl p-6 hover:border-red-800/20 hover:bg-gradient-to-br hover:from-white hover:via-red-50/30 hover:to-white hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-500 hover:-translate-y-2 block cursor-pointer overflow-hidden backdrop-blur-sm">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-800/5 via-transparent to-red-800/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>

        {/* Completed Overlay */}
        {course && course.completed && (
          <div className="absolute inset-0 z-40 bg-black/10 rounded-3xl flex items-center justify-center">
            <div className="relative">
              <Image
                src="/completed.png"
                alt="Course Completed"
                width={200}
                height={200}
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        )}

        {/* Certificate Badge */}
        {course.certificate && (
          <div className="absolute top-4 right-4 z-20">
            <div className="relative">
              <Image
                src="/assets/certificate.png"
                alt="Certificate"
                width={70}
                height={70}
                className="object-contain drop-shadow-lg"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-amber-500/20 rounded-full animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Course number badge */}
        <div className="absolute top-4 left-4 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg bg-gradient-to-br from-red-800 to-red-900">
          <span className="text-white font-bold text-sm">{index + 1}</span>
        </div>

        <div className="relative z-10 mb-6 mt-8">
          {/* Course icon */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-xl bg-gradient-to-br from-red-800 to-red-900">
            <BookOpen className="w-8 h-8 text-white" />
          </div>

          {/* Level Badge */}
          <div className="flex items-center mb-4">
            <div
              className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-medium border shadow-sm ${getLevelColor(course.level)}`}
            >
              <Trophy className="w-3 h-3 mr-2" />
              {getLevelLabel(course.level)}
            </div>
          </div>

          {/* Course title */}
          <Link
            href={`/${student.PrnNumber}/${toSlug(course.name)}?level=${course.level}`}
            className="text-xl font-bold mb-4 line-clamp-2 transition-colors duration-300 block hover:underline text-gray-900 group-hover:text-red-800"
          >
            {course.name}
          </Link>
        </div>

        {/* Class number section */}
        <div className="relative z-10 bg-gradient-to-r from-gray-50/80 to-white/80 rounded-2xl p-4 group-hover:bg-gradient-to-r group-hover:from-red-50/50 group-hover:to-white/80 transition-all duration-300 border border-gray-200/60 backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-sm font-semibold text-gray-700 transition-colors">
              Class Number
            </span>
            {/* Show Edit button only for admin */}
            {userChecked && isAdmin && editingIndex !== index && (
              <button
                className="ml-2 px-3 py-1 text-xs bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-800 rounded-lg hover:from-yellow-200 hover:to-amber-200 border border-yellow-300 transition-all duration-200 shadow-sm"
                onClick={(e) => {
                  e.preventDefault();
                  onEditClick(index, course.classNumber);
                }}
              >
                Edit
              </button>
            )}
          </div>

          {userChecked && isAdmin && editingIndex === index ? (
            <div className="flex items-center space-x-2">
              <input
                type="text"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                value={newClassNumber}
                onChange={(e) => onNewClassNumberChange(e.target.value)}
                disabled={loading}
              />
              <button
                className="px-3 py-1 text-xs bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 rounded-lg hover:from-green-200 hover:to-emerald-200 border border-green-300 transition-all duration-200 shadow-sm"
                onClick={(e) => {
                  e.preventDefault();
                  onSave(index);
                }}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                className="px-3 py-1 text-xs bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 rounded-lg hover:from-gray-200 hover:to-slate-200 border border-gray-300 transition-all duration-200 shadow-sm"
                onClick={(e) => {
                  e.preventDefault();
                  onCancel();
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          ) : (
            <p className="text-xl font-bold transition-colors duration-300 font-mono text-red-800">
              {course.classNumber || "N/A"}
            </p>
          )}
        </div>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-red-800/5 via-transparent to-red-800/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-xl"></div>
      </div>
    );
  }
);

CourseCard.displayName = "CourseCard";

export default CourseCard;
