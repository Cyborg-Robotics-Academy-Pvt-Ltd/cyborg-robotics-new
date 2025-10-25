"use client";

import { useState } from "react";
import ActiveTabs from "@/components/ui/active-tabs";

export default function ActiveTabsDemoWidget() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "profile", label: "Profile" },
    { id: "settings", label: "Settings" },
    { id: "help", label: "Help" },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Active Tabs Demo</h3>
      <ActiveTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="mt-4 p-4 bg-gray-50 rounded">
        <p>
          Current active tab: <span className="font-medium">{activeTab}</span>
        </p>
        <p className="mt-2 text-sm text-gray-600">
          {activeTab === "dashboard" && "Dashboard content would appear here."}
          {activeTab === "profile" && "Profile content would appear here."}
          {activeTab === "settings" && "Settings content would appear here."}
          {activeTab === "help" && "Help content would appear here."}
        </p>
      </div>
    </div>
  );
}
