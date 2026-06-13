"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Info, CheckCircle, AlertTriangle } from "lucide-react";

interface DashboardNotificationProps {
  title?: string;
  message: string;
  type?: "info" | "success" | "warning";
  duration?: number; // in milliseconds
  onClose?: () => void;
  showAutomatically?: boolean;
}

const DashboardNotification: React.FC<DashboardNotificationProps> = ({
  title = "Dashboard Update",
  message,
  type = "info",
  duration = 10000,
  onClose,
  showAutomatically = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showAutomatically) {
      const showTimer = setTimeout(() => setIsVisible(true), 1500); // Small delay for better UX
      return () => clearTimeout(showTimer);
    }
  }, [showAutomatically]);

  useEffect(() => {
    if (isVisible && duration > 0) {
      const closeTimer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(closeTimer);
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(onClose, 300); // Match exit animation duration
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-100",
          icon: <CheckCircle className="h-5 w-5 text-emerald-600" />,
          titleColor: "text-emerald-900",
        };
      case "warning":
        return {
          bg: "bg-amber-50",
          border: "border-amber-100",
          icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
          titleColor: "text-amber-900",
        };
      default:
        return {
          bg: "bg-blue-50",
          border: "border-blue-100",
          icon: <Info className="h-5 w-5 text-blue-600" />,
          titleColor: "text-blue-900",
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
          animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
          exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.2 } }}
          className={`fixed bottom-6 right-6 z-[9999] flex w-full max-w-sm overflow-hidden rounded-2xl border ${styles.border} ${styles.bg} shadow-2xl backdrop-blur-md`}
        >
          <div className="flex w-full items-start gap-4 p-4">
            <div className="mt-0.5 rounded-full bg-white p-1.5 shadow-sm">
              {styles.icon}
            </div>
            
            <div className="flex-1">
              <h3 className={`text-sm font-bold ${styles.titleColor}`}>
                {title}
              </h3>
              <p className="mt-1 text-xs font-medium text-gray-700 leading-relaxed">
                {message}
              </p>
              
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-gray-200/50">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: duration / 1000, ease: "linear" }}
                  className={`h-full ${type === 'success' ? 'bg-emerald-500' : type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}
                />
              </div>
            </div>

            <button
              onClick={handleClose}
              className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-200/50 hover:text-gray-600"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DashboardNotification;
