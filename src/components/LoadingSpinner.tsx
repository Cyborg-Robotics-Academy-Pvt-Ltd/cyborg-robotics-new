import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="text-center">
        <Loader2
          className={`${sizeClasses[size]} animate-spin mx-auto mb-4`}
          style={{ color: "#991b1b" }}
        />
        {message && <p className="text-gray-600 text-lg">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
