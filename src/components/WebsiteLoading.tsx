"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Image from "next/image";

interface WebsiteLoadingContextType {
  isLoading: boolean;
  showLoading: () => void;
  hideLoading: () => void;
}

const WebsiteLoadingContext = createContext<
  WebsiteLoadingContextType | undefined
>(undefined);

export const useWebsiteLoading = () => {
  const context = useContext(WebsiteLoadingContext);
  if (!context) {
    throw new Error(
      "useWebsiteLoading must be used within a WebsiteLoadingProvider"
    );
  }
  return context;
};

export const WebsiteLoadingProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);

  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  // Hide loading after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 200); // Reduced loading time to 800ms

    return () => clearTimeout(timer);
  }, []);

  return (
    <WebsiteLoadingContext.Provider
      value={{ isLoading, showLoading, hideLoading }}
    >
      {isLoading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
          <div className="flex flex-col items-center">
            <div className="mb-3">
              <Image
                src="/assets/Cyborg-logo.png"
                alt="Cyborg Logo"
                width={400}
                height={400}
                priority
              />
            </div>
            <div className="flex space-x-2">
              <div
                className="w-4 h-4 bg-red-600 rounded-full animate-pulse"
                style={{ animationDelay: "0ms", animationDuration: "1.5s" }}
              ></div>
              <div
                className="w-4 h-4 bg-red-500 rounded-full animate-pulse"
                style={{ animationDelay: "300ms", animationDuration: "1.5s" }}
              ></div>
              <div
                className="w-4 h-4 bg-red-400 rounded-full animate-pulse"
                style={{ animationDelay: "600ms", animationDuration: "1.5s" }}
              ></div>
              <div
                className="w-4 h-4 bg-red-300 rounded-full animate-pulse"
                style={{ animationDelay: "900ms", animationDuration: "1.5s" }}
              ></div>
            </div>
          </div>
        </div>
      )}
      {children}
    </WebsiteLoadingContext.Provider>
  );
};

const WebsiteLoading: React.FC = () => {
  const { isLoading } = useWebsiteLoading();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <div className="mb-6">
          <Image
            src="/assets/Cyborg-logo.png"
            alt="Cyborg Logo"
            width={120}
            height={120}
            priority
          />
        </div>
        <div className="flex space-x-2">
          <div
            className="w-4 h-4 bg-red-600 rounded-full animate-pulse"
            style={{ animationDelay: "0ms", animationDuration: "1.5s" }}
          ></div>
          <div
            className="w-4 h-4 bg-red-500 rounded-full animate-pulse"
            style={{ animationDelay: "300ms", animationDuration: "1.5s" }}
          ></div>
          <div
            className="w-4 h-4 bg-red-400 rounded-full animate-pulse"
            style={{ animationDelay: "600ms", animationDuration: "1.5s" }}
          ></div>
          <div
            className="w-4 h-4 bg-red-300 rounded-full animate-pulse"
            style={{ animationDelay: "900ms", animationDuration: "1.5s" }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default WebsiteLoading;
