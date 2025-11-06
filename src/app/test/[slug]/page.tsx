// Server Component - no "use client" directive needed
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Mock data with slugs as keys
const mockData: Record<
  string,
  {
    id: string;
    title: string;
    description: string;
    content: string;
  }
> = {
  "python-language": {
    id: "python",
    title: "Python Programming",
    description: "Learn Python from basics to advanced concepts",
    content:
      "Python is a high-level programming language known for its simplicity and versatility. It&apos;s widely used in web development, data science, artificial intelligence, and more. In this course, you&apos;ll learn everything from basic syntax to advanced concepts like decorators, generators, and asynchronous programming.",
  },
  "web-designing": {
    id: "webDesigning",
    title: "Web Designing",
    description: "Create beautiful websites with modern tools",
    content:
      "Web designing involves creating visually appealing and user-friendly websites. This course covers HTML, CSS, JavaScript, and modern frameworks. You&apos;ll learn responsive design, accessibility, performance optimization, and user experience principles to create stunning websites that work on all devices.",
  },
  "app-designing": {
    id: "appDesigning",
    title: "App Designing",
    description: "Design mobile applications with great UX",
    content:
      "App designing focuses on creating intuitive and engaging mobile experiences. You&apos;ll learn about mobile-first design principles, user interface patterns, prototyping tools, and platform-specific guidelines for both iOS and Android. This course emphasizes usability, accessibility, and creating delightful user experiences.",
  },
  "machine-learning": {
    id: "machineLearning",
    title: "Machine Learning",
    description: "Build intelligent systems with ML algorithms",
    content:
      "Machine learning is a subset of artificial intelligence that enables computers to learn and make decisions from data. This course covers supervised and unsupervised learning, neural networks, deep learning, and practical applications. You&apos;ll gain hands-on experience with popular frameworks like TensorFlow and PyTorch.",
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full mb-4">
              SUCCESS: Dynamic Route Working
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {data.title}
            </h1>
            <p className="text-xl text-gray-600 mb-6">{data.description}</p>

            <div className="prose max-w-none text-gray-700 mb-8">
              <p>{data.content}</p>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-3">Route Information</h2>
              <div className="space-y-2">
                <p className="flex items-center">
                  <span className="font-medium w-24">Slug:</span>
                  <span className="font-mono bg-blue-100 px-2 py-1 rounded text-sm">
                    {slug}
                  </span>
                </p>
                <p className="flex items-center">
                  <span className="font-medium w-24">Data ID:</span>
                  <span className="font-mono bg-blue-100 px-2 py-1 rounded text-sm">
                    {data.id}
                  </span>
                </p>
                <p className="flex items-center">
                  <span className="font-medium w-24">URL:</span>
                  <span className="font-mono bg-blue-100 px-2 py-1 rounded text-sm">
                    /test/{slug}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> The console log &quot;Slug received:{" "}
                {slug}&quot; is normal behavior showing that the dynamic route
                is working correctly. This is not an error.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/test"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            ← Back to Test Home
          </Link>
        </div>
      </div>
    </div>
  );
}
