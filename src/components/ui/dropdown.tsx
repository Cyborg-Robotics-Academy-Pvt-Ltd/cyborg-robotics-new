"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search } from "lucide-react";
import { cn } from "../../lib/utils";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  className?: string;
  label?: string;
  error?: string;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outlined" | "filled";
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  searchable = false,
  multiple = false,
  className,
  label,
  error,
  required = false,
  size = "md",
  variant = "default",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[]>(
    multiple ? (value ? [value] : []) : []
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Size classes
  const sizeClasses = {
    sm: "py-2 px-3 text-sm",
    md: "py-3 px-4 text-base",
    lg: "py-4 px-5 text-lg",
  };

  // Variant classes
  const variantClasses = {
    default:
      "border-2 border-gray-200 bg-white hover:border-[#AB2F30]/50 focus:border-[#AB2F30] focus:ring-4 focus:ring-[#AB2F30]/20",
    outlined:
      "border-2 border-gray-300 bg-transparent hover:border-[#AB2F30] focus:border-[#AB2F30] focus:ring-4 focus:ring-[#AB2F30]/20",
    filled:
      "border-2 border-transparent bg-gray-50 hover:bg-gray-100 focus:bg-white focus:border-[#AB2F30] focus:ring-4 focus:ring-[#AB2F30]/20",
  };

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get selected option for single selection
  const getSelectedSingleOption = () => {
    if (multiple) return null;
    return options.find((option) => option.value === value);
  };

  const handleOptionClick = (optionValue: string) => {
    if (multiple) {
      const newValues = selectedValues.includes(optionValue)
        ? selectedValues.filter((v) => v !== optionValue)
        : [...selectedValues, optionValue];
      setSelectedValues(newValues);
      onChange?.(newValues.join(","));
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedSingleOption = getSelectedSingleOption();

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-[#AB2F30] ml-1">*</span>}
        </label>
      )}

      {/* Dropdown Button */}
      <div
        className={cn(
          "relative cursor-pointer rounded-2xl transition-all duration-300 transform hover:scale-[1.02]",
          sizeClasses[size],
          variantClasses[variant],
          disabled && "opacity-50 cursor-not-allowed bg-gray-100",
          error && "border-[#AB2F30] focus:ring-[#AB2F30]/20",
          isOpen && "border-[#AB2F30] ring-4 ring-[#AB2F30]/20"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={`dropdown-${label || "options"}`}
        aria-label={label || placeholder}
      >
        {/* Selected Value Display */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 min-w-md flex-1">
            {multiple ? (
              <div className="flex flex-wrap gap-1">
                {selectedValues.length > 0 ? (
                  selectedValues.map((val) => {
                    const option = options.find((opt) => opt.value === val);
                    return (
                      <span
                        key={val}
                        className="inline-flex items-center space-x-1 bg-[#AB2F30]/10 text-[#AB2F30] px-2 py-1 rounded-lg text-xs font-medium"
                      >
                        {option?.icon && <span>{option.icon}</span>}
                        <span>{option?.label}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOptionClick(val);
                          }}
                          className="ml-1 hover:bg-[#AB2F30]/20 rounded-full p-0.5"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })
                ) : (
                  <span className="text-gray-400">{placeholder}</span>
                )}
              </div>
            ) : (
              <>
                {selectedSingleOption?.icon && (
                  <span className="text-gray-400">
                    {selectedSingleOption.icon}
                  </span>
                )}
                <span
                  className={cn(
                    "truncate",
                    !selectedSingleOption && "text-gray-400"
                  )}
                >
                  {selectedSingleOption?.label || placeholder}
                </span>
              </>
            )}
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-gray-400 transition-transform duration-200",
              isOpen && "rotate-180 text-[#AB2F30]"
            )}
          />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-44 mt-2 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl max-h-60 overflow-hidden">
          {/* Search Input */}
          {searchable && (
            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search options..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#AB2F30]/20 focus:border-[#AB2F30] text-sm"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = multiple
                  ? selectedValues.includes(option.value)
                  : value === option.value;

                return (
                  <div
                    key={option.value}
                    className={cn(
                      "flex items-center justify-between px-4 py-3  cursor-pointer transition-colors duration-200 hover:bg-gray-50",
                      isSelected && "bg-[#AB2F30]/10 text-[#AB2F30]",
                      option.disabled &&
                        "opacity-50 cursor-not-allowed hover:bg-transparent"
                    )}
                    onClick={() =>
                      !option.disabled && handleOptionClick(option.value)
                    }
                  >
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      {option.icon && (
                        <span className="text-gray-400">{option.icon}</span>
                      )}
                      <span className="truncate">{option.label}</span>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-[#AB2F30] flex-shrink-0" />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="px-4 py-3 text-gray-500 text-center">
                {searchTerm ? "No options found" : "No options available"}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-[#AB2F30] flex items-center space-x-1">
          <span>⚠</span>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default Dropdown;
