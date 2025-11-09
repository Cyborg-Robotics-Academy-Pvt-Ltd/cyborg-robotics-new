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
    outlined: "bg-transparent border-2 border-gray-300 ",
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
