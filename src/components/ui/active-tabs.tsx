"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface TabItem {
  id: string;
  label: string;
  href?: string;
}

interface ActiveTabsProps {
  tabs: TabItem[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  variant?: "default" | "compact" | "full-width";
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export default function ActiveTabs({
  tabs,
  activeTab,
  onTabChange,
  variant = "default",
  orientation = "horizontal",
  className = "",
}: ActiveTabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(
    activeTab || tabs[0]?.id || ""
  );

  useEffect(() => {
    if (activeTab) {
      setInternalActiveTab(activeTab);
    }
  }, [activeTab]);

  const handleTabClick = (tabId: string) => {
    setInternalActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  // Base classes
  const containerClasses = [
    "flex",
    orientation === "vertical" ? "flex-col" : "flex-row",
    variant === "full-width" ? "w-full" : "",
    "relative",
    className,
  ].join(" ");

  const tabClasses = (tabId: string) => {
    const base = [
      "relative",
      "px-4",
      "py-2",
      "text-sm",
      "font-medium",
      "transition-colors",
      "duration-200",
      "cursor-pointer",
      "z-10",
      "flex",
      "items-center",
      "justify-center",
    ];

    // Variant-specific classes
    switch (variant) {
      case "compact":
        base.push("px-3", "py-1.5", "text-xs");
        break;
      case "full-width":
        base.push("flex-1", "text-center");
        break;
      default:
        base.push("px-4", "py-2");
    }

    // Active state
    if (tabId === internalActiveTab) {
      base.push("text-white");
    } else {
      base.push("text-gray-700", "hover:text-[#b92423]");
    }

    return base.join(" ");
  };

  const activeTabClasses = [
    "absolute",
    "bg-red-800",
    "rounded-lg",
    "transition-all",
    "duration-300",
    "ease-in-out",
  ];

  // Calculate active tab position for animation
  const activeTabStyle = () => {
    const activeIndex = tabs.findIndex((tab) => tab.id === internalActiveTab);
    if (activeIndex === -1) return {};

    if (orientation === "vertical") {
      return {
        height: `${100 / tabs.length}%`,
        top: `${(100 / tabs.length) * activeIndex}%`,
      };
    } else {
      return {
        width: `${100 / tabs.length}%`,
        left: `${(100 / tabs.length) * activeIndex}%`,
      };
    }
  };

  return (
    <div className={containerClasses}>
      {/* Active tab indicator */}
      <motion.div
        className={activeTabClasses.join(" ")}
        layout
        initial={false}
        animate={activeTabStyle()}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
      />

      {/* Tab items */}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={tabClasses(tab.id)}
          onClick={() => handleTabClick(tab.id)}
        >
          {tab.href ? (
            <Link
              href={tab.href}
              className="w-full h-full flex items-center justify-center"
            >
              {tab.label}
            </Link>
          ) : (
            <span>{tab.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}
