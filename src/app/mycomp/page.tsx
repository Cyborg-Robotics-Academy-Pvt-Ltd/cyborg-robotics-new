"use client";

import { useState } from "react";
import ActiveTabs from "@/components/ui/active-tabs";
import Link from "next/link";

export default function ActiveTabsDemo() {
  const [activeTab, setActiveTab] = useState("overview");

  // Demo tabs data
  const mainTabs = [
    { id: "overview", label: "Overview" },
    { id: "features", label: "Features" },
    { id: "pricing", label: "Pricing" },
    { id: "reviews", label: "Reviews" },
  ];

  const compactTabs = [
    { id: "all", label: "All" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
    { id: "pending", label: "Pending" },
  ];

  const fullWidthTabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "analytics", label: "Analytics" },
    { id: "settings", label: "Settings" },
  ];

  const verticalTabs = [
    { id: "profile", label: "Profile" },
    { id: "account", label: "Account" },
    { id: "security", label: "Security" },
    { id: "notifications", label: "Notifications" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Active Tabs Component
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A customizable tab component with smooth animations and active state
            highlighting
          </p>
        </div>

        {/* Default variant */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Default Tabs
          </h2>
          <div className="mb-4">
            <ActiveTabs
              tabs={mainTabs}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
          <div className="mt-6 p-4 bg-gray-50 rounded-lg min-h-[100px] flex items-center justify-center">
            <p className="text-gray-600">
              {activeTab === "overview" && "Showing overview content..."}
              {activeTab === "features" && "Showing features content..."}
              {activeTab === "pricing" && "Showing pricing content..."}
              {activeTab === "reviews" && "Showing reviews content..."}
            </p>
          </div>
        </div>

        {/* Compact variant */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Compact Tabs
          </h2>
          <div className="w-fit">
            <ActiveTabs tabs={compactTabs} variant="compact" />
          </div>
        </div>

        {/* Full-width variant */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Full Width Tabs
          </h2>
          <ActiveTabs tabs={fullWidthTabs} variant="full-width" />
        </div>

        {/* Vertical tabs */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Vertical Tabs
          </h2>
          <div className="flex">
            <div className="w-48 mr-6">
              <ActiveTabs tabs={verticalTabs} orientation="vertical" />
            </div>
            <div className="flex-1 p-4 bg-gray-50 rounded-lg min-h-[200px] flex items-center justify-center">
              <p className="text-gray-600">Vertical tab navigation demo</p>
            </div>
          </div>
        </div>

        {/* Integration with header navigation */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Integration with Header Navigation
          </h2>
          <p className="text-gray-600 mb-4">
            This component follows the same active state patterns used in the
            header navigation.
          </p>
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-4 py-2 bg-red-800 text-white rounded-lg"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
