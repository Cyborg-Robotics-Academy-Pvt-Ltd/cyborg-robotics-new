"use client";

import { motion } from "framer-motion";

interface LoadingSkeletonProps {
  height?: string;
  width?: string;
  message?: string;
  className?: string;
}

export function LoadingSkeleton({
  height = "h-32",
  width = "w-full",
  message = "Loading...",
  className = "",
}: LoadingSkeletonProps) {
  return (
    <motion.div
      className={`${width} ${height} bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg flex items-center justify-center ${className}`}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{
        backgroundSize: "200% 200%",
      }}
    >
      <div className="flex items-center space-x-2 text-gray-600">
        <motion.div
          className="w-2 h-2 bg-red-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: 0,
          }}
        />
        <motion.div
          className="w-2 h-2 bg-red-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: 0.2,
          }}
        />
        <motion.div
          className="w-2 h-2 bg-red-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: 0.4,
          }}
        />
        <span className="ml-2 text-sm font-medium">{message}</span>
      </div>
    </motion.div>
  );
}
