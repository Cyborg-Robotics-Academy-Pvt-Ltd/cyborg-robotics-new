// Test page to verify curriculum import works
import React from "react";

export default async function TestCurriculumPage() {
  let curriculumData = null;
  let error = null;

  try {
    console.log("Attempting to import curriculum...");
    const curriculumModule = await import("@/utils/curriculum.ts");
    console.log("Curriculum imported:", !!curriculumModule);

    curriculumData = {
      javaLevels: curriculumModule.javaCurriculum?.length || 0,
      pythonLevels: curriculumModule.pythonCourseData?.length || 0,
      hasJava: !!curriculumModule.javaCurriculum,
      hasPython: !!curriculumModule.pythonCourseData,
    };
  } catch (err) {
    error = err instanceof Error ? err.message : "Unknown error";
    console.error("Error importing curriculum:", error);
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Curriculum Import Test</h1>

      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      ) : (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <h2 className="text-xl font-semibold mb-2">Success</h2>
          <pre>{JSON.stringify(curriculumData, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
