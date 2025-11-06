import Link from "next/link";
import { courseData } from "@/data/courseData";

// Function to convert course IDs to URL-friendly slugs
const courseIdToSlug = (id: string) => {
  const slugMap: Record<string, string> = {
    python: "python-language",
    webDesigning: "web-designing",
    appDesigning: "app-designing",
    machineLearning: "machine-learning",
    artificialIntelligence: "artificial-intelligence",
    roboticsEv3: "robotics-ev3",
    spikePrime: "spike-prime",
    printing3d: "3d-printing",
    bambinoCoding: "bambino-coding",
    animationCoding: "animation-coding",
    appLab: "app-lab",
    simplePoweredMachines: "simple-powered-machines",
    spikePneumatics: "spike-pneumatics",
    earlySimpleMachines: "early-simple-machines",
  };

  return slugMap[id] || id;
};

export default function CoursesPage() {
  const courses = Object.values(courseData);

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-10">Our Courses</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${courseIdToSlug(course.id)}`}
            className="group border rounded-2xl overflow-hidden shadow hover:shadow-lg transition"
          >
            <img
              src={course.imagePath}
              alt={course.imageAlt}
              className="w-full h-48 object-cover"
            />
            <div className="p-5">
              <h2 className="text-xl font-semibold mb-2 group-hover:text-blue-600">
                {course.title}
              </h2>
              <p className="text-gray-600 text-sm line-clamp-3">
                {course.description}
              </p>
              <div className="mt-4 text-sm text-blue-500 font-medium">
                View Details →
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
