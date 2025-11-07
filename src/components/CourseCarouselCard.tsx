import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface CourseCardProps {
  slug: string;
  title: string;
  description: string;
  ageRange: string;
  category: string;
  imagePath: string;
}

const CourseCarouselCard: React.FC<CourseCardProps> = ({
  slug,
  title,
  description,
  ageRange,
  category,
  imagePath,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-200 hover:border-blue-300 group min-w-[280px] max-w-[320px] h-full flex flex-col">
      <div className="mb-4">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-40 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Course Image</span>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-blue-600 line-clamp-2">
        {title}
      </h3>

      <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">
        {description}
      </p>

      <div className="flex flex-wrap gap-2 mt-auto pt-2">
        <Badge variant="secondary" className="text-xs">
          {ageRange}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {category}
        </Badge>
      </div>

      <Link
        href={`/all-courses/${slug}`}
        className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm font-medium"
      >
        View Details
      </Link>
    </div>
  );
};

export default CourseCarouselCard;
