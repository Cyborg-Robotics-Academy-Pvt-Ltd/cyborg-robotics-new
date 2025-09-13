"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Eye,
  TrendingUp,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Chrome,
  Safari,
  Firefox,
  RefreshCw,
  Download,
  ExternalLink,
  Calendar,
} from "lucide-react";

interface VercelAnalyticsData {
  pageviews: number;
  visitors: number;
  topPages: Array<{
    page: string;
    visitors: number;
  }>;
  referrers: Array<{
    referrer: string;
    visitors: number;
  }>;
  countries: Array<{
    country: string;
    visitors: number;
  }>;
  devices: Array<{
    device: string;
    visitors: number;
  }>;
  browsers: Array<{
    browser: string;
    visitors: number;
  }>;
  lastUpdated: string;
}

const VercelAnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] =
    useState<VercelAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/vercel-analytics");
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        throw new Error("Failed to fetch analytics data");
      }
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const exportData = () => {
    if (!analyticsData) return;

    const csvContent = [
      ["Metric", "Value"],
      ["Total Pageviews", analyticsData.pageviews.toString()],
      ["Total Visitors", analyticsData.visitors.toString()],
      ["", ""],
      ["Top Pages", ""],
      ...analyticsData.topPages.map((page) => [
        page.page,
        page.visitors.toString(),
      ]),
      ["", ""],
      ["Referrers", ""],
      ...analyticsData.referrers.map((ref) => [
        ref.referrer,
        ref.visitors.toString(),
      ]),
      ["", ""],
      ["Countries", ""],
      ...analyticsData.countries.map((country) => [
        country.country,
        country.visitors.toString(),
      ]),
      ["", ""],
      ["Devices", ""],
      ...analyticsData.devices.map((device) => [
        device.device,
        device.visitors.toString(),
      ]),
      ["", ""],
      ["Browsers", ""],
      ...analyticsData.browsers.map((browser) => [
        browser.browser,
        browser.visitors.toString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vercel-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "desktop":
        return <Monitor className="w-5 h-5" />;
      case "mobile":
        return <Smartphone className="w-5 h-5" />;
      case "tablet":
        return <Tablet className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const getBrowserIcon = (browser: string) => {
    switch (browser.toLowerCase()) {
      case "chrome":
        return <Chrome className="w-5 h-5" />;
      case "safari":
        return <Safari className="w-5 h-5" />;
      case "firefox":
        return <Firefox className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Vercel Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-4">
            {error}
          </div>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Vercel Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Real-time website analytics powered by Vercel
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {formatDate(analyticsData.lastUpdated)}
            </p>
          </div>
          <div className="flex gap-3">
            <motion.a
              href="/admin-dashboard/monthly-analytics"
              className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Calendar size={16} />
              Monthly View
            </motion.a>
            <motion.button
              onClick={fetchAnalytics}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw
                size={16}
                className={isLoading ? "animate-spin" : ""}
              />
              Refresh
            </motion.button>
            <motion.button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={16} />
              Export CSV
            </motion.button>
            <motion.a
              href="https://vercel.com/analytics"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ExternalLink size={16} />
              Vercel Dashboard
            </motion.a>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 rounded-xl shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Pageviews
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(analyticsData.pageviews)}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <Eye className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-sm border"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Unique Visitors
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatNumber(analyticsData.visitors)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Detailed Analytics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Pages */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Top Pages</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analyticsData.topPages.map((page, index) => (
                  <div
                    key={page.page}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 w-6">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-900 truncate">
                        {page.page}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatNumber(page.visitors)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Referrers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Top Referrers
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analyticsData.referrers.map((referrer, index) => (
                  <div
                    key={referrer.referrer}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-500 w-6">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-900 truncate">
                        {referrer.referrer}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatNumber(referrer.visitors)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Countries, Devices, and Browsers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Countries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm border overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Countries</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analyticsData.countries.map((country, index) => (
                  <div
                    key={country.country}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <span className="text-sm text-gray-900 truncate">
                        {country.country}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatNumber(country.visitors)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Devices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm border overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Devices</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analyticsData.devices.map((device, index) => (
                  <div
                    key={device.device}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {getDeviceIcon(device.device)}
                      <span className="text-sm text-gray-900">
                        {device.device}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatNumber(device.visitors)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Browsers */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="bg-white rounded-xl shadow-sm border overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Browsers</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analyticsData.browsers.map((browser, index) => (
                  <div
                    key={browser.browser}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {getBrowserIcon(browser.browser)}
                      <span className="text-sm text-gray-900">
                        {browser.browser}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatNumber(browser.visitors)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VercelAnalyticsPage;
