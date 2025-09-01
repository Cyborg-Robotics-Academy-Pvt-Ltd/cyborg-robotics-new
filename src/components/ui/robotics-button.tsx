"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface RoboticsButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const RoboticsButton: React.FC<RoboticsButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  className,
  onClick,
  disabled = false,
  type = "button",
}) => {
  const baseClasses = "relative inline-flex items-center justify-center font-medium transition-all duration-500 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group";
  
  const sizeClasses = {
    sm: "px-3 py-2 text-sm rounded-lg",
    md: "px-4 py-2 text-base rounded-xl",
    lg: "px-6 py-3 text-lg rounded-2xl",
  };
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-red-600 to-red-700 text-white border border-red-600 hover:from-red-700 hover:to-red-800 focus:ring-red-500",
    secondary: "bg-gradient-to-r from-blue-600 to-blue-700 text-white border border-blue-600 hover:from-blue-700 hover:to-blue-800 focus:ring-blue-500",
    outline: "bg-transparent text-red-600 border-2 border-red-600 hover:bg-red-600 hover:text-white focus:ring-red-500",
    ghost: "bg-transparent text-gray-700 hover:text-red-600 hover:bg-red-50 focus:ring-red-500",
  };

  return (
    <button
      type={type}
      className={cn(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {/* Robotics-themed animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-transparent to-blue-50/30 opacity-0 group-hover:opacity-100 transition-all duration-700"></div>
      
      {/* Circuit pattern overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none">
        <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-red-400 rounded-tl-lg"></div>
        <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-blue-400 rounded-br-lg"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-red-400 rounded-full"></div>
      </div>
      
      {/* Animated border effect */}
      <div className="absolute inset-0 rounded-inherit border-2 border-transparent group-hover:border-red-400/50 transition-all duration-500"></div>
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-inherit bg-gradient-to-br from-red-500/20 via-transparent to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10 blur-xl"></div>
      
      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
      
      {/* Hover scale effect */}
      <div className="absolute inset-0 rounded-inherit bg-gradient-to-br from-red-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-0 group-hover:scale-100"></div>
    </button>
  );
};

export default RoboticsButton;
