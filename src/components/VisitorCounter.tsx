"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Eye, TrendingUp, ExternalLink } from "lucide-react";

interface VercelAnalyticsData {
  pageviews: number;
  visitors: number;
  topPages: Array<{
    page: string;
    visitors: number;
  }>;
}

const VisitorCounter: React.FC = () => {
  const [stats, setStats] = useState<VercelAnalyticsData>({
    pageviews: 0,
    visitors: 0,
    topPages: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVercelAnalytics = async () => {
      try {
        const response = await fetch("/api/vercel-analytics");
        if (response.ok) {
          const data = await response.json();
          setStats({
            pageviews: data.pageviews,
            visitors: data.visitors,
            topPages: data.topPages,
          });
        }
      } catch (error) {
        console.error("Failed to fetch Vercel Analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Fetch data immediately
    fetchVercelAnalytics();

    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchVercelAnalytics, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <span>Loading analytics...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center gap-3"
    >
      <div className="flex items-center gap-4 text-sm">
        <motion.div
          className="flex items-center gap-1 text-gray-700"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Eye size={16} className="text-red-500" />
          <span className="font-medium">{formatNumber(stats.pageviews)}</span>
          <span className="text-gray-500">pageviews</span>
        </motion.div>

        <motion.div
          className="flex items-center gap-1 text-gray-700"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <Users size={16} className="text-blue-500" />
          <span className="font-medium">{formatNumber(stats.visitors)}</span>
          <span className="text-gray-500">visitors</span>
        </motion.div>

        <motion.div
          className="flex items-center gap-1 text-gray-700"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <div className="relative">
            <TrendingUp size={16} className="text-green-500" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <span className="text-gray-500">live</span>
        </motion.div>
      </div>

      <motion.a
        href="https://vercel.com/analytics"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-600 transition-colors"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <span>Powered by Vercel Analytics</span>
        <ExternalLink size={12} />
      </motion.a>
    </motion.div>
  );
};

export default VisitorCounter;
