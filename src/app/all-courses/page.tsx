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
import CourseCategoryCarousel from "@/components/CourseCategoryCarousel";
import CourseCarouselCard from "@/components/CourseCarouselCard";
import {
  enhancedCourseData,
  COURSE_CATEGORIES,
} from "@/data/enhancedCourseData";

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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Courses</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our comprehensive range of courses designed to spark
            creativity and build technical skills.
          </p>
        </div>

        {/* Search + Filter bar */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Search Courses
              </label>
              <Input
                id="search"
                type="text"
                placeholder="Search by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
              />
            </div>

            <div>
              <label
                htmlFor="age-filter"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Age Group
              </label>
              <Select
                value={ageFilter || "all"}
                onValueChange={(value) =>
                  setAgeFilter(value === "all" ? "" : value)
                }
              >
                <SelectTrigger id="age-filter">
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
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category
              </label>
              <Select
                value={categoryFilter || "all"}
                onValueChange={(value) =>
                  setCategoryFilter(value === "all" ? "" : value)
                }
              >
                <SelectTrigger id="category-filter">
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
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {search && (
                  <Badge variant="secondary" className="text-xs">
                    Search: {search}
                    <button
                      onClick={() => setSearch("")}
                      className="ml-2 hover:text-gray-900"
                      aria-label="Remove search filter"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {ageFilter && (
                  <Badge variant="secondary" className="text-xs">
                    Age: {ageFilter}
                    <button
                      onClick={() => setAgeFilter("")}
                      className="ml-2 hover:text-gray-900"
                      aria-label="Remove age filter"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {categoryFilter && (
                  <Badge variant="secondary" className="text-xs">
                    Category: {categoryFilter}
                    <button
                      onClick={() => setCategoryFilter("")}
                      className="ml-2 hover:text-gray-900"
                      aria-label="Remove category filter"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                <button
                  onClick={() => {
                    setSearch("");
                    setAgeFilter("");
                    setCategoryFilter("");
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredCourses.length} of {courseList.length} courses
          </p>
        </div>

        {/* Category carousels */}
        {Object.keys(coursesByCategory).length > 0 ? (
          Object.entries(coursesByCategory).map(([category, courses]) => (
            <CourseCategoryCarousel
              key={category}
              title={`${category} Courses`}
            >
              {courses.map((course) => (
                <div key={course.slug} className="flex-shrink-0">
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
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No courses found
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search or filter criteria
            </p>
            <button
              onClick={() => {
                setSearch("");
                setAgeFilter("");
                setCategoryFilter("");
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* All courses grid view (alternative to carousels) */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">All Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.slug}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-blue-300 group"
              >
                <div className="mb-4">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-40 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Course Image</span>
                  </div>
                </div>

                <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-blue-600 line-clamp-2">
                  {course.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {course.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="text-xs">
                    {course.ageRange}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {course.category}
                  </Badge>
                </div>

                <Link
                  href={`/all-courses/${course.slug}`}
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm font-medium w-full"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllCoursesPage;
