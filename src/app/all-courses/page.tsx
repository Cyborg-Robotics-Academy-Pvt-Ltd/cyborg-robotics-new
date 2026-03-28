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
import {
  enhancedCourseData,
  COURSE_CATEGORIES,
} from "@/data/enhancedCourseData";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import Header from "@/components/layout/header";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";

// Helper function to extract levels from duration string
const extractLevels = (duration: string): string => {
  const match = duration.toLowerCase().match(/x(\d+)\s*levels?/);
  if (match) {
    const levelCount = match[1];
    return `${levelCount} Level${levelCount === "1" ? "" : "s"}`;
  }
  // Fallback for courses without explicit levels
  return "Multiple Levels";
};

// Convert the enhanced course data to an array for easier manipulation
const courseList = Object.entries(enhancedCourseData).map(([slug, course]) => ({
  slug,
  ...course,
  levels: extractLevels(course.duration),
}));

// Get unique age ranges and sort them
const uniqueAgeRanges = [...new Set(courseList.map((c) => c.ageRange))].sort(
  (a, b) => {
    // Extract the first number from each age range for comparison
    const firstNumA = parseInt(a.match(/\d+/)?.[0] || "0");
    const firstNumB = parseInt(b.match(/\d+/)?.[0] || "0");

    // If first numbers are equal, compare the second number (if exists)
    if (firstNumA === firstNumB) {
      const secondNumA = parseInt(
        a.match(/\d+-(\d+)/)?.[1] || a.match(/\d+/g)?.[1] || "0",
      );
      const secondNumB = parseInt(
        b.match(/\d+-(\d+)/)?.[1] || b.match(/\d+/g)?.[1] || "0",
      );
      return secondNumA - secondNumB;
    }

    return firstNumA - firstNumB;
  },
);

const AllCoursesPageContent = () => {
  // State for search and filter
  const [search, setSearch] = useState("");
  const [ageFilter, setAgeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [modeFilter, setModeFilter] = useState("");
  const [levelsFilter, setLevelsFilter] = useState("");

  // Get search params from URL
  const searchParams = useSearchParams();
  const urlSearchParam = searchParams.get("search");

  // Set initial search state from URL param and update when URL changes
  React.useEffect(() => {
    if (urlSearchParam !== null) {
      setSearch(urlSearchParam);
    }
  }, [urlSearchParam]);

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
        (categoryFilter === "" || course.category === categoryFilter) &&
        (modeFilter === "" ||
          (modeFilter === "online" &&
            course.mode.toLowerCase().includes("online")) ||
          (modeFilter === "offline" &&
            course.mode.toLowerCase().includes("offline")) ||
          (modeFilter === "online & offline" &&
            course.mode.toLowerCase().includes("online & offline"))) &&
        (levelsFilter === "" ||
          (levelsFilter === "1 level" &&
            course.duration.toLowerCase().includes("x1 level")) ||
          (levelsFilter === "2 levels" &&
            course.duration.toLowerCase().includes("x2 levels")) ||
          (levelsFilter === "3 levels" &&
            course.duration.toLowerCase().includes("x3 levels")) ||
          (levelsFilter === "4 levels" &&
            course.duration.toLowerCase().includes("x4 levels")) ||
          (levelsFilter === "6 levels" &&
            course.duration.toLowerCase().includes("x6 levels"))),
    );
  }, [search, ageFilter, categoryFilter, modeFilter, levelsFilter]);

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
  const hasActiveFilters =
    search || ageFilter || categoryFilter || modeFilter || levelsFilter;

  // Clear all filters function
  const clearAllFilters = () => {
    setSearch("");
    setAgeFilter("");
    setCategoryFilter("");
    setModeFilter("");
    setLevelsFilter("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="px-4 sm:px-6 lg:px-8 pt-8">
        {/* Hero section */}
        <div className="text-center mb-2 mt-10">
          <h1 className="text-4xl  md:text-5xl lg:text-6xl font-extrabold gradient-text mb-4 ">
            Learning Hub
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-medium">
            Hands-on Robotics & STEM programs for every age group
          </p>
        </div>

        {/* Search + Filter bar - Enhanced */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Find Your Perfect Course
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Search Input */}
            <div className="relative">
              <label
                htmlFor="search your courses"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Search Courses
              </label>
              <div className="relative">
                <Input
                  id="search your courses"
                  type="text"
                  placeholder="e.g., Python, Robotics, Arduino"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg focus:ring-2 focus:ring-red-500 transition-all border-0"
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
                htmlFor="age filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Age Group
              </label>
              <Select
                value={ageFilter || "all"}
                onValueChange={(value: string) =>
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
                      {age}
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
                onValueChange={(value: string) =>
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

            {/* Mode Filter */}
            <div>
              <label
                htmlFor="mode-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mode
              </label>
              <Select
                value={modeFilter || "all"}
                onValueChange={(value: string) =>
                  setModeFilter(value === "all" ? "" : value)
                }
              >
                <SelectTrigger
                  id="mode-filter"
                  className="rounded-lg border-2 h-[42px]"
                >
                  <SelectValue placeholder="All Modes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                  <SelectItem value="online & offline">
                    Online & Offline
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Levels Filter */}
            <div>
              <label
                htmlFor="levels-filter"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Levels
              </label>
              <Select
                value={levelsFilter || "all"}
                onValueChange={(value: string) =>
                  setLevelsFilter(value === "all" ? "" : value)
                }
              >
                <SelectTrigger
                  id="levels-filter"
                  className="rounded-lg border-2 h-[42px]"
                >
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="1 level">1 Level</SelectItem>
                  <SelectItem value="2 levels">2 Levels</SelectItem>
                  <SelectItem value="3 levels">3 Levels</SelectItem>
                  <SelectItem value="4 levels">4 Levels</SelectItem>
                  <SelectItem value="6 levels">6 Levels</SelectItem>
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
                {modeFilter && (
                  <Badge
                    variant="secondary"
                    className="text-xs py-1.5 px-3 rounded-full flex items-center gap-2 bg-green-50 text-green-700 border border-green-200"
                  >
                    Mode: {modeFilter}
                    <button
                      onClick={() => setModeFilter("")}
                      className="hover:text-green-900"
                      aria-label="Remove mode filter"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {levelsFilter && (
                  <Badge
                    variant="secondary"
                    className="text-xs py-1.5 px-3 rounded-full flex items-center gap-2 bg-yellow-50 text-yellow-700 border border-yellow-200"
                  >
                    Levels: {levelsFilter}
                    <button
                      onClick={() => setLevelsFilter("")}
                      className="hover:text-yellow-900"
                      aria-label="Remove levels filter"
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
        <div className="mb-6 flex items-center justify-between">
          <p className="text-base text-gray-600">
            Showing{" "}
            <span className="font-bold text-gray-900">
              {filteredCourses.length}
            </span>{" "}
            of{" "}
            <span className="font-bold text-gray-900">{courseList.length}</span>{" "}
            courses
          </p>
        </div>

        {/* Course Grid */}
        {Object.keys(coursesByCategory).length > 0 ? (
          <div className="space-y-12">
            {Object.entries(coursesByCategory).map(([category, courses]) => (
              <div key={category} id={category} className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    <span>{category} Courses</span>
                    <Badge
                      variant="secondary"
                      className="ml-3 text-xs px-2 py-1 bg-red-800 text-white rounded-full"
                    >
                      {courses.length}
                    </Badge>
                  </h2>
                </div>

                {/* Grid layout for courses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {courses.map((course) => (
                    <div
                      key={course.slug}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group relative"
                    >
                      {/* Brand Logo in Top Right Corner */}
                      <div className="absolute top-3 right-3 z-10">
                        <div className="bg-white/80 backdrop-blur-sm rounded-full p-[1px] shadow-md border border-red-100">
                          <Image
                            src="/assets/logo1.png"
                            width={100}
                            height={100}
                            alt="Cyborg Robotics"
                            className="w-8 h-8 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.style.display = "none";
                            }}
                          />
                        </div>
                      </div>

                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={course.imagePath}
                          width={500}
                          height={300}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.src = "/assets/placeholder-image.png";
                          }}
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-red-600 line-clamp-2">
                          {course.title}
                        </h3>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {course.description}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge
                            variant="secondary"
                            className="text-xs py-1 px-3 rounded-full bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200 font-medium"
                          >
                            Age: {course.ageRange}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs py-1 px-3 rounded-full border-red-200 text-red-700 font-medium"
                          >
                            {course.category}
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="text-xs py-1 px-3 rounded-full bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 font-medium"
                          >
                            {course.levels}
                          </Badge>
                        </div>

                        <Link
                          href={`/all-courses/${course.slug}`}
                          className="w-full bg-gradient-to-r from-red-800 to-red-700 text-white px-4 py-2.5 rounded-lg hover:from-red-800 hover:to-red-900 transition-all duration-300 text-center text-sm font-semibold shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 block"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Enhanced empty state
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
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

        {/* Inline CTA after courses */}
        <div className="mt-16 mb-12 bg-gradient-to-r from-red-800 to-red-700 rounded-3xl p-8 text-center text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-red-100 mb-6 max-w-2xl mx-auto">
            Join thousands of students who have transformed their future with
            our hands-on robotics and STEM programs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact-us"
              className="bg-white text-red-800 px-6 py-3 rounded-full font-semibold hover:bg-red-50 transition-colors shadow-lg"
            >
              Book Free Demo
            </Link>
            <Link
              href="/all-courses"
              className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white/10 transition-colors"
            >
              Browse All Courses
            </Link>
          </div>
        </div>

        {/* Trust Signals Section */}
        <div className="mt-16 mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">
              Why Choose Our Programs?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4">
                <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-red-800">10K+</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Students Trained
                </h3>
                <p className="text-gray-600 text-sm">
                  Across all our programs and courses
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-blue-800">4+</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Years Experience
                </h3>
                <p className="text-gray-600 text-sm">
                  Proven track record of success
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-green-800">98%</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Success Rate</h3>
                <p className="text-gray-600 text-sm">
                  Of our students pursue tech careers
                </p>
              </div>

              <div className="text-center p-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-purple-800">4+</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">Competitions</h3>
                <p className="text-gray-600 text-sm">
                  Our students participate in
                </p>
              </div>
            </div>
          </div>

          {/* Testimonials Section */}
          <div className="mt-12 bg-gradient-to-r from-gray-50 to-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900">
              What Parents Say
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center mb-4">
                  <Image
                    width={50}
                    height={50}
                    src="/assets/testimonials/parents/SarikaGemawat.jpeg"
                    alt="Sarika Gemawat"
                    className="w-12 h-12 rounded-full object-cover border-2 border-red-200"
                  />
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">Sarika Gemawat</h4>
                    <div className="flex text-yellow-400">{"★".repeat(5)}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "Divit had basic Lego knowledge before joining Cyborg, but his
                  robotics and AI skills have grown tremendously. His dream of
                  becoming a Robotics Engineer is now taking shape, thanks to
                  Team Cyborg."
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center mb-4">
                  <Image
                    width={50}
                    height={50}
                    src="/assets/testimonials/parents/IndraniGhoshChoudhary.png"
                    alt="Indrani Ghosh Choudhary"
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                  />
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">
                      Indrani Ghosh Choudhary
                    </h4>
                    <div className="flex text-yellow-400">{"★".repeat(5)}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "Aaryan enjoys his robotics sessions and is improving in
                  assembling and programming. Mrs. Shikha is an excellent and
                  patient teacher."
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center mb-4">
                  <Image
                    width={50}
                    height={50}
                    src="/assets/testimonials/parents/JishaAlex.jpeg"
                    alt="Jisha Alex"
                    className="w-12 h-12 rounded-full object-cover border-2 border-green-200"
                  />
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">Jisha Alex</h4>
                    <div className="flex text-yellow-400">{"★".repeat(5)}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "My kids love Cyborg's robotics classes! The instructors make
                  learning fun and connect concepts to real life for better
                  understanding."
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center mb-4">
                  <Image
                    width={50}
                    height={50}
                    src="/assets/testimonials/parents/SahilSankla.jpeg"
                    alt="Sahil Sankla"
                    className="w-12 h-12 rounded-full object-cover border-2 border-purple-200"
                  />
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">Sahil Sankla</h4>
                    <div className="flex text-yellow-400">{"★".repeat(5)}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "Our son has been with Cyborg for over two years and has
                  developed not just a passion for technology but also a love
                  for learning. The team's creativity and innovation truly
                  nurture each child's growth."
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center mb-4">
                  <Image
                    width={50}
                    height={50}
                    src="/assets/testimonials/parents/RuchikaOswal.jpeg"
                    alt="Ruchika Oswal"
                    className="w-12 h-12 rounded-full object-cover border-2 border-yellow-200"
                  />
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">Ruchika Oswal</h4>
                    <div className="flex text-yellow-400">{"★".repeat(5)}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "Cyborg has brought a positive change in my son Aadit. He's
                  grown to love robotics, learned teamwork and handled
                  challenges with confidence. Thank you, Team Cyborg, for your
                  encouragement and support."
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="flex items-center mb-4">
                  <Image
                    width={50}
                    height={50}
                    src="/assets/testimonials/parents/AkanshaGaur.png"
                    alt="Akansha Gaur"
                    className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200"
                  />
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900">Akansha Gaur</h4>
                    <div className="flex text-yellow-400">{"★".repeat(5)}</div>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "Cyborg Robotics Academy has been perfect for my son's
                  curiosity about how things work. The hands-on projects, clear
                  teaching and encouraging mentors have boosted his confidence
                  and creativity. Highly recommended!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function AllCoursesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <AllCoursesPageContent />
      </Suspense>
    </div>
  );
}
