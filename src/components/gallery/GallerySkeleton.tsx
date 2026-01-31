"use client";

import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import "@/components/lightswind.css";

interface GallerySkeletonProps {
  itemsPerPage?: number;
  showTabs?: boolean;
  showHeader?: boolean;
}

const GallerySkeleton = ({
  itemsPerPage = 9,
  showTabs = true,
  showHeader = true,
}: GallerySkeletonProps) => {
  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      {showHeader && (
        <div className="max-w-7xl mx-auto mt-10">
          <motion.div
            className="text-center mb-8 md:mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </motion.div>
        </div>
      )}

      {showTabs && (
        <div className="max-w-7xl mx-auto mb-12">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-10 w-32 rounded-full bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl p-4 md:p-6">
          {/* Image Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {Array.from({ length: itemsPerPage }).map((_, index) => (
              <motion.div
                key={index}
                className="overflow-hidden rounded-2xl shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="aspect-square overflow-hidden">
                  <div className="w-full h-full bg-gray-200 animate-pulse rounded-none" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination Skeleton */}
          <div className="flex justify-center items-center mt-8 space-x-2">
            <Skeleton className="w-10 h-10 rounded-full" shimmer />
            <div className="flex space-x-1">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton
                  key={index}
                  className="w-10 h-10 rounded-full"
                  shimmer
                />
              ))}
            </div>
            <Skeleton className="w-10 h-10 rounded-full" shimmer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GallerySkeleton;
