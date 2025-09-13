"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Eye,
  TrendingUp,
  TrendingDown,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  Chrome,
  Safari,
  Firefox,
  RefreshCw,
  Download,
  Calendar,
  BarChart3,
} from "lucide-react";

interface MonthlyAnalyticsData {
  month: string;
  pageviews: number;
  visitors: number;
  pageviewGrowth: number;
  visitorGrowth: number;
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
  dailyData: Array<{
    date: string;
    pageviews: number;
    visitors: number;
  }>;
  lastUpdated: string;
}

const MonthlyAnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] =
    useState<MonthlyAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().substring(0, 7)
  );

  const fetchMonthlyAnalytics = async (month: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/monthly-analytics?month=${month}`);
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        throw new Error("Failed to fetch monthly analytics data");
      }
    } catch (err) {
      console.error("Error fetching monthly analytics:", err);
      setError("Failed to load monthly analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyAnalytics(selectedMonth);
  }, [selectedMonth]);

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

  const formatMonth = (monthString: string): string => {
    const [year, month] = monthString.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const exportMonthlyData = () => {
    if (!analyticsData) return;

    const csvContent = [
      [
        "Month",
        "Pageviews",
        "Visitors",
        "Pageview Growth %",
        "Visitor Growth %",
      ],
      [
        analyticsData.month,
        analyticsData.pageviews.toString(),
        analyticsData.visitors.toString(),
        analyticsData.pageviewGrowth.toString(),
        analyticsData.visitorGrowth.toString(),
      ],
      ["", "", "", "", ""],
      ["Top Pages", "", "", "", ""],
      ...analyticsData.topPages.map((page) => [
        page.page,
        page.visitors.toString(),
        "",
        "",
        "",
      ]),
      ["", "", "", "", ""],
      ["Daily Data", "", "", "", ""],
      ["Date", "Pageviews", "Visitors", "", ""],
      ...analyticsData.dailyData.map((day) => [
        day.date,
        day.pageviews.toString(),
        day.visitors.toString(),
        "",
        "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `monthly-analytics-${analyticsData.month}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (growth < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    }
    return <BarChart3 className="w-4 h-4 text-gray-500" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-green-600";
    if (growth < 0) return "text-red-600";
    return "text-gray-600";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading monthly analytics...</p>
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
            onClick={() => fetchMonthlyAnalytics(selectedMonth)}
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
          <p className="text-gray-600">No monthly analytics data available</p>
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
              Monthly Analytics
            </h1>
            <p className="text-gray-600 mt-2">
              Detailed monthly insights and trends
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Last updated: {formatDate(analyticsData.lastUpdated)}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-500" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() - i);
                  const monthValue = date.toISOString().substring(0, 7);
                  const monthLabel = date.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  });
                  return (
                    <option key={monthValue} value={monthValue}>
                      {monthLabel}
                    </option>
                  );
                })}
              </select>
            </div>
            <motion.button
              onClick={() => fetchMonthlyAnalytics(selectedMonth)}
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
              onClick={exportMonthlyData}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download size={16} />
              Export CSV
            </motion.button>
          </div>
        </div>

        {/* Month Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-6 rounded-xl shadow-sm border mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {formatMonth(analyticsData.month)} Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">
                Total Pageviews
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {formatNumber(analyticsData.pageviews)}
              </p>
              <div className="flex items-center justify-center gap-1 mt-2">
                {getGrowthIcon(analyticsData.pageviewGrowth)}
                <span
                  className={`text-sm font-medium ${getGrowthColor(
                    analyticsData.pageviewGrowth
                  )}`}
                >
                  {analyticsData.pageviewGrowth > 0 ? "+" : ""}
                  {analyticsData.pageviewGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">
                Unique Visitors
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {formatNumber(analyticsData.visitors)}
              </p>
              <div className="flex items-center justify-center gap-1 mt-2">
                {getGrowthIcon(analyticsData.visitorGrowth)}
                <span
                  className={`text-sm font-medium ${getGrowthColor(
                    analyticsData.visitorGrowth
                  )}`}
                >
                  {analyticsData.visitorGrowth > 0 ? "+" : ""}
                  {analyticsData.visitorGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">
                Avg. Daily Pageviews
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {formatNumber(
                  Math.round(
                    analyticsData.pageviews / analyticsData.dailyData.length
                  )
                )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">
                Avg. Daily Visitors
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {formatNumber(
                  Math.round(
                    analyticsData.visitors / analyticsData.dailyData.length
                  )
                )}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Daily Trends Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm border overflow-hidden mb-8"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Daily Trends
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analyticsData.dailyData.map((day, index) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-500 w-16">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            (day.pageviews /
                              Math.max(
                                ...analyticsData.dailyData.map(
                                  (d) => d.pageviews
                                )
                              )) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">
                      {formatNumber(day.pageviews)} views
                    </span>
                    <span className="text-gray-600">
                      {formatNumber(day.visitors)} visitors
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

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

          {/* Countries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
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
        </div>

        {/* Devices and Browsers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Devices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
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
                      {device.device.toLowerCase() === "desktop" ? (
                        <Monitor className="w-5 h-5" />
                      ) : device.device.toLowerCase() === "mobile" ? (
                        <Smartphone className="w-5 h-5" />
                      ) : (
                        <Tablet className="w-5 h-5" />
                      )}
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
            transition={{ duration: 0.5, delay: 0.5 }}
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
                      {browser.browser.toLowerCase() === "chrome" ? (
                        <Chrome className="w-5 h-5" />
                      ) : browser.browser.toLowerCase() === "safari" ? (
                        <Safari className="w-5 h-5" />
                      ) : browser.browser.toLowerCase() === "firefox" ? (
                        <Firefox className="w-5 h-5" />
                      ) : (
                        <Globe className="w-5 h-5" />
                      )}
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

export default MonthlyAnalyticsPage;
