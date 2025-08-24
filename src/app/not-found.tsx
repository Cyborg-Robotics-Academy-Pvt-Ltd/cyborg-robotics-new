"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home } from "lucide-react";

const NotFound = () => {
  return (
    <main
      role="main"
      aria-label="404 Page Not Found"
      className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md w-full mx-auto bg-white p-8 rounded-xl shadow-lg"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.2,
          }}
        >
          <h1 className="text-6xl font-bold text-red-800 mb-2">404</h1>
          <div className="w-16 h-1 bg-red-800 mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-600 mb-8">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has
            been moved.
          </p>
        </motion.div>

        <Link href="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-red-800 text-white py-3 px-6 rounded-full inline-flex items-center font-medium transition-colors"
            aria-label="Back to Home"
          >
            <Home size={18} className="mr-2" />
            Back to Home
          </motion.button>
        </Link>
      </motion.div>
    </main>
  );
};

export default NotFound;
