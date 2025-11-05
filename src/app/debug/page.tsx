// Debug page to check routing and data
import React from "react";
import { slugToCourseId, getAllCourseIds } from "@/lib/courseData";

export default function DebugPage() {
  const slugs = Object.keys(slugToCourseId);
  const courseIds = getAllCourseIds();

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Debug Information</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Course Slugs</h2>
        <ul className="list-disc pl-6">
          {slugs.map((slug) => (
            <li key={slug} className="mb-2">
              <a
                href={`/courses/${slug}`}
                className="text-blue-600 hover:underline"
              >
                {slug}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Course IDs</h2>
        <ul className="list-disc pl-6">
          {courseIds.map((id) => (
            <li key={id} className="mb-2">
              {id}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">
          Slug to Course ID Mapping
        </h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(slugToCourseId, null, 2)}
        </pre>
      </div>
    </div>
  );
}
