import React, { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
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
  // Use placeholder image if imagePath is not provided or is empty
  const [imgSrc, setImgSrc] = useState(
    imagePath && imagePath.trim() !== ""
      ? imagePath
      : "/assets/placeholder-image.png"
  );

  const [hasError, setHasError] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Handle image loading error
  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc("/assets/placeholder-image.png");
    }
  };

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50; // Minimum swipe distance
    const isRightSwipe = distance < -50;

    if (isLeftSwipe || isRightSwipe) {
      // Handle swipe navigation if this card is part of a carousel
      // For now, we'll just log the swipe direction
      console.log(`Swiped ${isLeftSwipe ? "left" : "right"} on card: ${title}`);

      // Reset touch positions
      setTouchStart(0);
      setTouchEnd(0);
    }
  };

  return (
    <div
      ref={cardRef}
      className="bg-white  mx-4 md:mx-2 rounded-3xl shadow-md hover:shadow-lg transition-all duration-300 p-5 border border-gray-100 hover:border-red-200 group min-w-[260px] max-w-[300px] h-full flex flex-col overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="mb-3">
        <div className="relative w-full h-36 rounded-lg overflow-hidden">
          <Image
            src={imgSrc}
            alt={`${title} course image`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={handleImageError}
            unoptimized={hasError} // Skip optimization for fallback image
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
      </div>

      <h3 className="text-lg font-bold mb-2 text-gray-900 group-hover:text-red-700 line-clamp-2">
        {title}
      </h3>

      <p className="text-gray-600 text-xs mb-3 flex-grow line-clamp-2">
        {description}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge
          variant="secondary"
          className="text-xs py-0.5 px-2 rounded-full bg-red-50 text-red-700 hover:bg-red-100"
        >
          Age: {ageRange}
        </Badge>
        <Badge
          variant="outline"
          className="text-xs py-0.5 px-2 rounded-full border-red-200 text-red-700"
        >
          {category}
        </Badge>
      </div>

      <Link
        href={`/all-courses/${slug}`}
        className="mt-auto inline-block bg-red-800 text-white px-4 py-[10px] rounded-full hover:bg-red-700 transition-colors text-center text-sm font-semibold shadow hover:shadow-md"
      >
        View Details
      </Link>
    </div>
  );
};

export default CourseCarouselCard;
