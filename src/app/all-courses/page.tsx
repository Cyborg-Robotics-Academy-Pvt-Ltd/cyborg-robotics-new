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
import { Search, X, Filter } from "lucide-react";
import CourseCategoryCarousel from "@/components/course/CourseCategoryCarousel";
import CourseCarouselCard from "@/components/course/CourseCarouselCard";
import {
  enhancedCourseData,
  COURSE_CATEGORIES,
} from "@/data/enhancedCourseData";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import Footer from "@/components/home/Footer";

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

  // Check if any filters are active
  const hasActiveFilters = search || ageFilter || categoryFilter;

  // Clear all filters function
  const clearAllFilters = () => {
    setSearch("");
    setAgeFilter("");
    setCategoryFilter("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="px-4 sm:px-6 lg:px-8">
        {/* Header section */}
        <div className="text-center mb-10 mt-4">
          <h1 className="text-4xl md:text-5xl gradient-text font-bold text-gray-900 mb-4">
            Our Courses
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Discover courses that ignite creativity and build tech skills for
            the future.
          </p>
        </div>

        {/* Search + Filter bar - Enhanced */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Find Your Perfect Course
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search Input */}
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
                  placeholder="e.g., Python, Robotics, Arduino"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Age Filter */}
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
                <SelectTrigger
                  id="age-filter"
                  className="rounded-lg border-2 h-[42px]"
                >
                  <SelectValue placeholder="All Ages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ages</SelectItem>
                  {uniqueAgeRanges.map((age) => (
                    <SelectItem key={age} value={age}>
                      Age {age}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
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
                <SelectTrigger
                  id="category-filter"
                  className="rounded-lg border-2 h-[42px]"
                >
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

          {/* Active filters display - Improved */}
          {hasActiveFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  Active filters:
                </span>
                {search && (
                  <Badge
                    variant="secondary"
                    className="text-xs py-1.5 px-3 rounded-full flex items-center gap-2 bg-red-50 text-red-700 border border-red-200"
                  >
                    <Search className="h-3 w-3" />
                    {search}
                    <button
                      onClick={() => setSearch("")}
                      className="hover:text-red-900"
                      aria-label="Remove search filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {ageFilter && (
                  <Badge
                    variant="secondary"
                    className="text-xs py-1.5 px-3 rounded-full flex items-center gap-2 bg-blue-50 text-blue-700 border border-blue-200"
                  >
                    Age: {ageFilter}
                    <button
                      onClick={() => setAgeFilter("")}
                      className="hover:text-blue-900"
                      aria-label="Remove age filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {categoryFilter && (
                  <Badge
                    variant="secondary"
                    className="text-xs py-1.5 px-3 rounded-full flex items-center gap-2 bg-purple-50 text-purple-700 border border-purple-200"
                  >
                    {categoryFilter}
                    <button
                      onClick={() => setCategoryFilter("")}
                      className="hover:text-purple-900"
                      aria-label="Remove category filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                <Button
                  onClick={clearAllFilters}
                  variant="ghost"
                  className="text-sm text-red-600 hover:text-red-800 hover:bg-red-50 py-1 px-3 h-auto rounded-full border border-red-200"
                >
                  Clear all
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Results count - Enhanced */}
        <div className="mb-8 flex items-center justify-between">
          <p className="text-base text-gray-600">
            Showing{" "}
            <span className="font-bold text-gray-900">
              {filteredCourses.length}
            </span>{" "}
            of{" "}
            <span className="font-bold text-gray-900">{courseList.length}</span>{" "}
            courses
          </p>

          {filteredCourses.length > 0 &&
            filteredCourses.length < courseList.length && (
              <p className="text-sm text-gray-500 italic">
                {courseList.length - filteredCourses.length} courses hidden by
                filters
              </p>
            )}
        </div>

        {/* Category carousels */}
        {Object.keys(coursesByCategory).length > 0 ? (
          Object.entries(coursesByCategory).map(([category, courses]) => (
            <div key={category} id={category} className="mb-12">
              <CourseCategoryCarousel
                title={
                  <div className="flex items-center gap-3">
                    <span>{category} Courses</span>
                    <Badge
                      variant="secondary"
                      className="text-xs px-2 py-1 bg-red-800 text-white border border-red-200 rounded-full"
                    >
                      {courses.length}
                    </Badge>
                  </div>
                }
              >
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
          // Enhanced empty state
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-200">
            <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center mb-6">
              <Search className="w-12 h-12 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No courses found
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
              We couldn't find any courses matching your criteria. Try adjusting
              your filters or search terms.
            </p>
            <Button
              onClick={clearAllFilters}
              className="bg-red-700 hover:bg-red-800 text-white px-8 py-3 rounded-lg font-medium text-base shadow-md hover:shadow-lg transition-all"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default AllCoursesPage;
