"use client";
import React from "react";
import Link from "next/link";

const TestPage = () => {
  // Simple test data
  const testData = [
    {
      slug: "python-language",
      title: "Python Programming",
      description: "Learn Python from basics to advanced concepts",
    },
    {
      slug: "web-designing",
      title: "Web Designing",
      description: "Create beautiful websites with modern tools",
    },
    {
      slug: "app-designing",
      title: "App Designing",
      description: "Design mobile applications with great UX",
    },
    {
      slug: "machine-learning",
      title: "Machine Learning",
      description: "Build intelligent systems with ML algorithms",
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
          {testData.map((item, index) => (
            <Link
              key={index}
              href={`/test/${item.slug}`}
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
                <code className="bg-gray-100 px-1 rounded">/test/[slug]</code>{" "}
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
