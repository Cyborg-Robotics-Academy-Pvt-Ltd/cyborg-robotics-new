import React, { useState, useRef, useCallback, useMemo } from "react";
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
  const [imgSrc, setImgSrc] = useState(
    imagePath && imagePath.trim() !== ""
      ? imagePath
      : "/assets/placeholder-image.png"
  );

  const [hasError, setHasError] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleImageError = useCallback(() => {
    if (!hasError) {
      setHasError(true);
      setImgSrc("/assets/placeholder-image.png");
      setIsImageLoading(false);
    }
  }, [hasError]);

  const handleImageLoad = useCallback(() => {
    setIsImageLoading(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe || isRightSwipe) {
      if (cardRef.current) {
        const swipeEvent = new CustomEvent("cardSwipe", {
          bubbles: true,
          detail: { direction: isLeftSwipe ? "left" : "right", title },
        });
        cardRef.current.dispatchEvent(swipeEvent);
      }

      setTouchStart(0);
      setTouchEnd(0);
    }
  }, [touchStart, touchEnd, title]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      return;
    }

    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const link = cardRef.current?.querySelector("a");
      if (link) {
        link.click();
      }
    }
  }, []);

  const imageProps = useMemo(
    () => ({
      src: imgSrc,
      alt: `${title} course image`,
      fill: true,
      className: `object-cover transition-all duration-500 ease-out  ${isImageLoading ? "blur-sm" : "blur-0"}`,
      sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
      onError: handleImageError,
      onLoad: handleImageLoad,
      unoptimized: hasError,
    }),
    [imgSrc, title, isImageLoading, handleImageError, handleImageLoad, hasError]
  );

  return (
    <div
      ref={cardRef}
      className="bg-white mx-2 md:mx-1 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500  group min-w-[240px] max-w-[280px] h-full flex flex-col overflow-hidden hover:-translate-y-2 backdrop-blur-sm"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="article"
      aria-label={`${title} course card`}
    >
      <div className="mb-3">
        <div className="relative w-full h-36 rounded-tr-2xl rounded-tl-2xl overflow-hidden  transition-all duration-300">
          <Image {...imageProps} />
          {isImageLoading && (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200  rounded-2xl" />
          )}
        </div>
      </div>
      <div className="p-2 ">
        <h3 className="text-base font-bold mb-2 text-gray-900 group-hover:text-red-600 line-clamp-2 transition-colors duration-300">
          {title}
        </h3>

        <p className="text-gray-600 text-sm mb-3 flex-grow line-clamp-2 leading-relaxed">
          {description}
        </p>

        <div className="flex flex-wrap gap-1 mb-3">
          <Badge
            variant="secondary"
            className="text-xs py-1 px-3 rounded-full bg-gradient-to-r from-red-50 to-red-100 text-red-700 hover:from-red-100 hover:to-red-200 transition-all duration-300 border border-red-100 font-medium shadow-sm"
          >
            Age: {ageRange}
          </Badge>
          <Badge
            variant="outline"
            className="text-xs py-1 px-3 rounded-full border-red-200 text-red-700 hover:bg-red-50 transition-all duration-300 font-medium shadow-sm"
          >
            {category}
          </Badge>
        </div>

        <Link
          href={`/all-courses/${slug}`}
          className="mt-4 inline-block mx-auto  w-full bg-gradient-to-r from-red-800 to-red-700 text-white px-5 py-2 rounded-full hover:from-red-800 hover:to-red-900 transition-all duration-300 text-center text-sm font-semibold shadow-md hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transform  active:scale-95"
          aria-label={`View details for ${title} course`}
        >
          Explore Course
        </Link>
      </div>
    </div>
  );
};

export default React.memo(CourseCarouselCard);
