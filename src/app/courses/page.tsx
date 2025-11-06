import Link from "next/link";
import { courseData } from "@/data/courseData";

export default function CoursesPage() {
  const courses = Object.values(courseData);

  return (
    <section className="py-16 px-4 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-10">Our Courses</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
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
