// Server Component - no "use client" directive needed
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

import Image from "next/image";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/home/Footer";

// Define the type for key features
interface KeyFeature {
  title: string;
  description: string;
  iconName: string;
}

// Define the type for our mock data
interface CourseData {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  mode: string;
  duration: string;
  syllabusPath: string;
  syllabusFileName: string;
  imagePath: string;
  imageAlt: string;
  price: number;
  originalPrice: number;
  currency: string;
  locale: string;
  keyFeatures: KeyFeature[];
  content?: string;
}

// Mock data with slugs as keys
const mockData: Record<string, CourseData> = {
  "python-language": {
    id: "python",
    title: "Python Programming",
    subtitle:
      "Learn the world's fastest-growing programming language for web development, data science, AI and more",
    badge: "Most Popular Course",
    description:
      "Learn the world's fastest-growing programming language for web development, data science, AI and more",
    mode: "Online & Offline",
    duration: "16 CLASSES(x6 LEVELS) (1 HOUR PER CLASS)",
    syllabusPath: "/assets/pdf/PYTHON.pdf",
    syllabusFileName: "PYTHON.pdf",
    imagePath: "/assets/online-course/python.webp",
    imageAlt: "Python Programming Course",
    price: 14999,
    originalPrice: 24999,
    currency: "INR",
    locale: "en-IN",
    keyFeatures: [
      {
        title: "Core Programming",
        description:
          "Master fundamental programming concepts and Python syntax",
        iconName: "Code",
      },
      {
        title: "Web Development",
        description:
          "Build websites and web applications using Python frameworks",
        iconName: "Globe",
      },
      {
        title: "Data Analysis",
        description:
          "Process, analyze and visualize data with Python libraries",
        iconName: "LineChart",
      },
      {
        title: "AI & Machine Learning",
        description:
          "Create intelligent applications with Python ML frameworks",
        iconName: "BrainCircuit",
      },
    ],
  },
};

// Server Component - properly handle params according to Next.js docs
export default async function SlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // In Next.js App Router, params is a Promise that needs to be awaited
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // Log for debugging - this is normal behavior, not an error
  console.log("Slug received:", slug);

  // Get data by slug
  const data = mockData[slug];

  // If no data found, show 404
  if (!data) {
    console.log("No data found for slug:", slug);
    notFound();
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const fadeInUpVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const scaleInVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  };

  // Icon component mapping
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Code":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        );
      case "Globe":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        );
      case "LineChart":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        );
      case "BrainCircuit":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4.5 4.5 0 1 0 12 18" />
            <path d="M12 5a3 3 0 1 1 5.997.125" />
            <path d="M12 19a3 3 0 1 0-5.997-.125 4 4 0 0 0-2.526-5.77 4 4 0 0 0 .556-6.588" />
            <path d="M12 19a3 3 0 1 1 5.997.125" />
            <path d="M15 12h-3" />
            <path d="M12 9v6" />
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          </svg>
        );
    }
  };

  // Curriculum data
  const curriculumData = [
    {
      id: "level1",
      title: "Foundation",
      subtitle: [
        "Introduction to programming concepts",
        "Variables, data types, and operators",
        "Control structures (if/else, loops)",
        "Functions and modules",
      ],
    },
    {
      id: "level2",
      title: "Intermediate",
      subtitle: [
        "Object-oriented programming",
        "Error handling and debugging",
        "File handling and data persistence",
        "Working with external libraries",
      ],
    },
    {
      id: "level3",
      title: "Advanced",
      subtitle: [
        "Database integration",
        "API development and consumption",
        "Testing and quality assurance",
        "Deployment and DevOps basics",
      ],
    },
  ];

  // Handle syllabus download
  const handleDownloadSyllabus = () => {
    // In a real app, this would trigger a download
    console.log("Downloading syllabus...");
    window.open(data.syllabusPath, "_blank");
  };

  // Format price with currency
  const formatPrice = (price: number, currency: string, locale: string) => {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  return (
    <div className="mx-auto max-w-7xl mt-2 md:mt-24 overflow-hidden px-2 sm:px-4 lg:px-8">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-100 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-100 rounded-full opacity-20 blur-3xl" />
      </div>

      {/* Hero Section */}
      <div className="lg:mt-16 mt-4 px-2 sm:px-4 lg:px-0 relative">
        <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
          <div className="w-full md:w-10/12 lg:w-1/2 space-y-4 md:space-y-6">
            <div>
              <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-red-100 to-red-200 text-red-800 hover:from-red-200 hover:to-red-300 border-0 shadow-xl backdrop-blur-sm font-medium text-sm">
                ✨ {data.badge}
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-800 via-red-600 to-red-800 leading-tight">
              {data.title}
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed max-w-lg">
              {data.subtitle}
            </p>

            <div className="flex flex-wrap gap-2 md:gap-4">
              <Badge
                variant="outline"
                className="px-4 py-2 border-2 border-red-200 text-red-700 bg-red-50 hover:bg-red-100 transition-colors font-medium"
              >
                🎯 {data.mode}
              </Badge>
              <Badge
                variant="outline"
                className="px-4 py-2 border-2 border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors font-medium"
              >
                ⏰ {data.duration}
              </Badge>
            </div>

            <div>
              <Link
                href="https://wa.me/917028511161?text=Hello%20Cyborg,%20I%20am%20looking%20for%20some%20help!%20(Enquiry)"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="bg-gradient-to-r from-red-700 to-red-800 hover:from-red-800 hover:to-red-900 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-2">
                  <span>🚀 Enroll Now</span>
                </button>
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-1/2 mt-8 lg:mt-0">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-red-500/10 to-blue-500/10 z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/10 z-10"></div>

              <Image
                src={data.imagePath}
                alt={data.imageAlt}
                width={600}
                height={400}
                unoptimized
                className="object-cover w-full h-auto max-h-80 sm:max-h-[400px] transition-transform duration-700 hover:scale-110"
              />

              {/* Floating elements */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-3 shadow-xl z-20">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Overview */}
      <div className="mt-16 sm:mt-20 mx-2 sm:mx-4 lg:mx-8">
        <div className="relative p-4 bg-gradient-to-br from-gray-50 to-white rounded-3xl shadow-xl border border-gray-100">
          <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-red-400 to-red-600 rounded-full opacity-20 blur-xl" />

          <h2 className="md:text-3xl text-xl font-bold  text-gray-800 mb-6 flex items-center gap-3">
            <span className="md:text-4xl text-xl ">📚</span>
            Course Overview
          </h2>
          <p className="text-gray-700 text-sm md:text-lg leading-relaxed">
            {data.description}
          </p>
        </div>
      </div>

      {/* Key Features */}
      <div className="mt-16 sm:mt-20 mx-2 sm:mx-4 lg:mx-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8 sm:mb-12">
          <span className=" mr-3 md:text-3xl text-2xl">🎯</span>
          <span className=" mr-3 md:text-3xl text-2xl">
            {" "}
            What You&apos;ll Master
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {data.keyFeatures.map((feature, index) => (
            <div key={index} className="h-full">
              <Card className="border-0 shadow-xl hover:shadow-xl transition-all duration-300 h-full bg-gradient-to-br from-white to-gray-50 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <CardContent className="p-8 relative z-10">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-gradient-to-br from-red-100 to-red-200 rounded-xl mr-4 shadow-md">
                      {getIconComponent(feature.iconName)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-base">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Learning Journey Timeline */}
      <div className="mt-16 sm:mt-20 mx-2 sm:mx-4 lg:mx-8">
        <div className="p-6 sm:p-10 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl shadow-xl relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, #f43f5e 0%, transparent 50%), 
                               radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 50%)`,
              }}
            />
          </div>

          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8 sm:mb-12 relative z-10">
            <span className="md:text-5xl text-2xl mr-3">🗺️</span>
            <span className="md:text-5xl text-xl mr-3">
              Your Learning Adventure
            </span>
          </h2>

          <div className="relative flex flex-col gap-6 sm:gap-8 pl-4 sm:pl-4">
            {/* Enhanced vertical line */}
            <div
              className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-red-300 via-blue-300 to-purple-300 rounded-full shadow-xl"
              style={{ transformOrigin: "top" }}
            />

            {curriculumData.map((level, index) => (
              <div key={level.id} className="relative flex items-start z-10">
                {/* Enhanced numbered circle */}
                <div className="flex flex-col items-center mr-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-700 text-white text-lg sm:text-xl font-bold shadow-xl border-4 border-white relative">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-400 to-red-600 opacity-0" />
                    <span className="relative z-10">{index + 1}</span>
                  </div>
                </div>

                {/* Enhanced step box */}
                <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-8 border border-white/50 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <h3 className="text-xl sm:text-2xl font-bold text-red-700 mb-2 sm:mb-3 relative z-10">
                    {level.title}
                  </h3>
                  <p className="text-gray-700 text-base sm:text-lg mb-2 sm:mb-3 relative z-10">
                    {level.subtitle[0]}
                  </p>
                  {level.subtitle.length > 1 && (
                    <ul className="space-y-1 sm:space-y-2 relative z-10">
                      {level.subtitle
                        .slice(1)
                        .map((item: string, itemIndex: number) => (
                          <li
                            key={itemIndex}
                            className="text-gray-600 text-sm sm:text-base flex items-start gap-2"
                          >
                            <span className="text-red-500 mt-1">•</span>
                            {item}
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NEW: Additional CTA Section for Course Journey */}
      <div className="mt-12 sm:mt-16 mx-2 sm:mx-4 lg:mx-8 p-4 sm:p-8 bg-red-50 rounded-2xl text-center relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-red-200 rounded-full opacity-20 blur-2xl" />
        <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-red-100 rounded-full opacity-30 blur-2xl" />

        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-red-800 mb-2 sm:mb-4 relative z-10">
          Ready to Start Your Development Journey?
        </h2>

        <p className="text-gray-700 mb-4 sm:mb-6 max-w-2xl mx-auto relative z-10">
          Join our sscomprehensive course and transform yourself into a skilled
          developer with industry-relevant skills.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center relative z-10">
          <div>
            <Link
              href="https://wa.me/917028511161?text=Hello%20Cyborg,%20I%20am%20looking%20for%20some%20help!%20(Enquiry)"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="bg-red-800 hover:bg-red-700 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-0.5">
                Enroll Now
              </button>
            </Link>
          </div>

          <button
            className="bg-white hover:bg-gray-100 text-red-800 font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg border border-red-300 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
            // onClick={handleDownloadSyllabus}
          >
            Download Syllabus
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
