"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface RoboticsCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "outlined";
  onClick?: () => void;
  interactive?: boolean;
}

const RoboticsCard: React.FC<RoboticsCardProps> = ({
  children,
  className,
  variant = "default",
  onClick,
  interactive = false,
}) => {
  const baseClasses =
    "relative rounded-2xl transition-all duration-500 overflow-hidden";

  const variantClasses = {
    default: "bg-white border border-gray-200 shadow-md hover:shadow-xl",
    elevated:
      "bg-white border border-gray-200 shadow-lg hover:shadow-2xl hover:-translate-y-1",
    outlined: "bg-transparent border-2 border-gray-300 hover:border-red-400",
  };

  const interactiveClasses = interactive
    ? "cursor-pointer hover:scale-[1.02]"
    : "";

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        interactiveClasses,
        "group",
        className
      )}
      onClick={onClick}
    >
      {/* Robotics-themed animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/20 via-transparent to-blue-50/20 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>

      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-700 pointer-events-none">
        {/* Top-left corner */}
        <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-red-400/60 rounded-tl-lg"></div>
        {/* Top-right corner */}
        <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-blue-400/60 rounded-tr-lg"></div>
        {/* Bottom-left corner */}
        <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-green-400/60 rounded-bl-lg"></div>
        {/* Bottom-right corner */}
        <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-yellow-400/60 rounded-br-lg"></div>

        {/* Central connection nodes */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-2 h-2 bg-red-400 rounded-full opacity-60"></div>
          <div className="absolute inset-0 w-2 h-2 border border-red-300 rounded-full animate-ping opacity-30"></div>
        </div>

        {/* Side nodes */}
        <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-60"></div>
        </div>
        <div className="absolute top-1/2 right-1/4 transform -translate-y-1/2">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full opacity-60"></div>
        </div>
      </div>

      {/* Animated border effect */}
      <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-red-400/30 transition-all duration-500"></div>

      {/* Glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-xl"></div>

      {/* Content */}
      <div className="relative z-10 p-6">{children}</div>

      {/* Hover scale effect for interactive cards */}
      {interactive && (
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-red-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-0 group-hover:scale-100"></div>
      )}
    </div>
  );
};

export default RoboticsCard;
