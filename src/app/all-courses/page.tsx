"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import CourseCategoryCarousel from "@/components/CourseCategoryCarousel";
import CourseCarouselCard from "@/components/CourseCarouselCard";
import {
  enhancedCourseData,
  COURSE_CATEGORIES,
} from "@/data/enhancedCourseData";
import { useScrollToSection } from "@/hooks/useScrollToSection";

// Convert the enhanced course data to an array for easier manipulation
const courseList = Object.entries(enhancedCourseData).map(([slug, course]) => ({
  slug,
  ...course,
}));

// Get unique age ranges
const uniqueAgeRanges = [...new Set(courseList.map((c) => c.ageRange))];

const AllCoursesPage = () => {
  // State for search and filter
  const [search, setSearch] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // Scroll to section hook
  const { scrollToSection } = useScrollToSection();

  // Filter logic
  const filteredCourses = useMemo(() => {
    return courseList.filter(
      (course) =>
        (search === "" ||
          course.title.toLowerCase().includes(search.toLowerCase()) ||
          course.description.toLowerCase().includes(search.toLowerCase())) &&
        (ageFilter === "" || course.ageRange === ageFilter) &&
        (categoryFilter === "" || course.category === categoryFilter)
    );
  }, [search, ageFilter, categoryFilter]);

  // Group courses by category
  const coursesByCategory = useMemo(() => {
    const grouped: Record<string, typeof courseList> = {};

    filteredCourses.forEach((course) => {
      if (!grouped[course.category]) {
        grouped[course.category] = [];
      }
      grouped[course.category].push(course);
    });

    return grouped;
  }, [filteredCourses]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {Object.keys(coursesByCategory).length > 0 ? (
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Our Courses
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our comprehensive range of courses designed to spark
              creativity and build technical skills.
            </p>
          </div>
        ) : null}

        {/* Search + Filter bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-12 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="relative">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Search Courses
              </label>
              <div className="relative">
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by title or description..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
            </div>

            <div>
              <label
                htmlFor="age-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Age Group
              </label>
              <Select
                value={ageFilter || "all"}
                onValueChange={(value) =>
                  setAgeFilter(value === "all" ? "" : value)
                }
              >
                <SelectTrigger id="age-filter" className="rounded-lg">
                  <SelectValue placeholder="All Ages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  {uniqueAgeRanges.map((age) => (
                    <SelectItem key={age} value={age}>
                      {age}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label
                htmlFor="category-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Category
              </label>
              <Select
                value={categoryFilter || "all"}
                onValueChange={(value) =>
                  setCategoryFilter(value === "all" ? "" : value)
                }
              >
                <SelectTrigger id="category-filter" className="rounded-lg">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {COURSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Active filters display */}
          {(search || ageFilter || categoryFilter) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Active filters:
                </span>
                {search && (
                  <Badge
                    variant="secondary"
                    className="text-xs py-1 px-3 rounded-full flex items-center"
                  >
                    Search: {search}
                    <button
                      onClick={() => setSearch("")}
                      className="ml-2 hover:text-gray-900"
                      aria-label="Remove search filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {ageFilter && (
                  <Badge
                    variant="secondary"
                    className="text-xs py-1 px-3 rounded-full flex items-center"
                  >
                    Age: {ageFilter}
                    <button
                      onClick={() => setAgeFilter("")}
                      className="ml-2 hover:text-gray-900"
                      aria-label="Remove age filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {categoryFilter && (
                  <Badge
                    variant="secondary"
                    className="text-xs py-1 px-3 rounded-full flex items-center"
                  >
                    Category: {categoryFilter}
                    <button
                      onClick={() => setCategoryFilter("")}
                      className="ml-2 hover:text-gray-900"
                      aria-label="Remove category filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  onClick={() => {
                    setSearch("");
                    setAgeFilter("");
                    setCategoryFilter("");
                  }}
                  variant="ghost"
                  className="text-sm text-red-600 hover:text-red-800 hover:bg-red-50 py-1 px-2 h-auto"
                >
                  Clear all
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="mb-8">
          <p className="text-gray-600">
            Showing{" "}
            <span className="font-semibold">{filteredCourses.length}</span> of{" "}
            <span className="font-semibold">{courseList.length}</span> courses
          </p>
        </div>

        {/* Category carousels */}
        {Object.keys(coursesByCategory).length > 0 ? (
          Object.entries(coursesByCategory).map(([category, courses]) => (
            <div key={category} id={category}>
              <CourseCategoryCarousel title={`${category} Courses`}>
                {courses.map((course) => (
                  <div key={course.slug} className="flex-shrink-0 mb-4">
                    <CourseCarouselCard
                      slug={course.slug}
                      title={course.title}
                      description={course.description}
                      ageRange={course.ageRange}
                      category={course.category}
                      imagePath={course.imagePath}
                    />
                  </div>
                ))}
              </CourseCategoryCarousel>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
            <div className="mx-auto w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mb-6">
              <Search className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No courses found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Try adjusting your search or filter criteria to find what you're
              looking for.
            </p>
            <Button
              onClick={() => {
                setSearch("");
                setAgeFilter("");
                setCategoryFilter("");
              }}
              className="bg-red-700 hover:bg-red-800 text-white px-6 py-3 rounded-lg font-medium"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCoursesPage;
