"use client";
import React from "react";
import Link from "next/link";

const TestPage = () => {
  // Simple test data
  const courseList = [
    {
      slug: "python-language",
      title: "Python Programming",
      description:
        "Learn Python for web development, data science, AI and more",
    },
    {
      slug: "arduino",
      title: "Arduino",
      description:
        "Build interactive electronics projects with Arduino programming and hardware integration",
    },
    {
      slug: "web-designing",
      title: "Web Designing",
      description:
        "Learn to build beautiful, responsive and interactive websites with HTML and CSS",
    },
    {
      slug: "java",
      title: "JAVA PROGRAMMING",
      description:
        "Master object-oriented programming with Java for enterprise applications and Android development",
    },
    {
      slug: "android-studio",
      title: "ANDROID STUDIO",
      description:
        "Build professional Android applications using Android Studio and modern development practices",
    },
    {
      slug: "machine-learning",
      title: "MACHINE LEARNING",
      description:
        "Master the fundamentals of machine learning and build intelligent applications",
    },
    {
      slug: "artificial-intelligence",
      title: "ARTIFICIAL INTELLIGENCE",
      description:
        "Explore the cutting-edge world of AI and build intelligent systems",
    },
    {
      slug: "robotics-ev3",
      title: "ROBOTICS EV3",
      description:
        "Build and program intelligent robots using LEGO Mindstorms EV3",
    },
    {
      slug: "spike-prime",
      title: "SPIKE PRIME",
      description: "Learn robotics and coding with LEGO Education SPIKE Prime",
    },
    {
      slug: "3d-printing",
      title: "3D PRINTING",
      description:
        "Learn to design and print 3D objects using modern 3D printing technology",
    },
    {
      slug: "bambino-coding",
      title: "BAMBINO CODING",
      description:
        "Introduce young minds to programming with fun, interactive coding activities",
    },
    {
      slug: "electronics",
      title: "ELECTRONICS",
      description:
        "Learn the fundamentals of electronic circuits and electronic components",
    },
    {
      slug: "animation-coding",
      title: "ANIMATION CODING",
      description:
        "Create stunning animations and visual effects through programming",
    },
    {
      slug: "app-designing",
      title: "APP DESIGNING",
      description:
        "Design beautiful and functional mobile applications with modern UI/UX principles",
    },
    {
      slug: "early-simple-machines",
      title: "EARLY SIMPLE MACHINES",
      description:
        "Explore basic mechanical principles through hands-on building and experimentation",
    },
    {
      slug: "iot",
      title: "INTERNET OF THINGS (IoT)",
      description:
        "Connect devices and create smart systems that communicate over the internet",
    },
    {
      slug: "spike-pneumatics",
      title: "SPIKE PNEUMATICS",
      description:
        "Learn pneumatic systems and air-powered mechanisms with LEGO Education SPIKE",
    },
    {
      slug: "simple-powered-machines",
      title: "SIMPLE POWERED MACHINES",
      description:
        "Explore powered mechanical systems and motor-driven mechanisms",
    },
    {
      slug: "app-lab",
      title: "APP LAB",
      description:
        "Create mobile applications using MIT App Inventor and block-based programming",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Slug Routing Test
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            This page demonstrates dynamic routing in Next.js App Router. Click
            on any card below to test the slug-based routing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {courseList.map((item, index) => (
            <Link
              key={index}
              href={`/all-courses/${item.slug}`}
              className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-blue-300 group"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-blue-600">
                {item.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{item.description}</p>
              <div className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded inline-block">
                {item.slug}
              </div>
            </Link>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">1.</span>
              <span>
                Each card above links to{" "}
                <code className="bg-gray-100 px-1 rounded">
                  /all-courses/[slug]
                </code>{" "}
                where <code className="bg-gray-100 px-1 rounded">[slug]</code>{" "}
                is a dynamic parameter
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">2.</span>
              <span>
                In Next.js 15, the{" "}
                <code className="bg-gray-100 px-1 rounded">params</code> prop is
                a Promise that must be awaited
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">3.</span>
              <span>
                The dynamic route component receives the slug as a parameter and
                uses it to display content
              </span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 font-bold mr-2">4.</span>
              <span>
                If no data matches the slug, Next.js automatically shows the
                not-found page
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
