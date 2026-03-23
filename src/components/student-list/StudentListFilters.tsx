"use client";

import { Button } from "@/components/ui/button";
import { Filter, Search, UsersRound, XCircle } from "lucide-react";

type Props = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  centerFilter: string;
  setCenterFilter: (value: string) => void;
  trainerFilter: string;
  setTrainerFilter: (value: string) => void;
  studentsCount: number;
  filteredCount: number;
  activeTab: string;
  setActiveTab: (value: string) => void;
  trainerOptions: string[];
  onRefresh: () => void;
  refreshing: boolean;
  loading: boolean;
};

export function StudentListFilters({
  searchTerm,
  setSearchTerm,
  centerFilter,
  setCenterFilter,
  trainerFilter,
  setTrainerFilter,
  studentsCount,
  filteredCount,
  activeTab,
  setActiveTab,
  trainerOptions,
  onRefresh,
  refreshing,
  loading,
}: Props) {
  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-4 md:mb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="relative rounded-xl shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-12 py-3 bg-gray-50 border outline-none border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-300 text-sm"
              placeholder="Search by name, PRN, or classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search students"
            />
            {searchTerm && (
              <button
                className="absolute inset-y-0 right-0 flex items-center pr-4"
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
              >
                <XCircle className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 max-w-xs">
          <select
            className="block w-full pl-4 pr-10 py-3 bg-gray-50 border outline-none border-gray-200 rounded-xl text-gray-800 focus:outline-none transition-all duration-300"
            value={centerFilter}
            onChange={(e) => setCenterFilter(e.target.value)}
            aria-label="Filter by center"
          >
            <option value="">All Centers</option>
            <option value="Kalyani Nagar">Kalyani Nagar</option>
            <option value="Viman Nagar">Viman Nagar</option>
          </select>
        </div>
        <div className="flex-1 max-w-xs">
          <select
            className="block w-full pl-4 pr-10 py-3 bg-gray-50 border outline-none border-gray-200 rounded-xl text-gray-800 focus:outline-none transition-all duration-300"
            value={trainerFilter}
            onChange={(e) => setTrainerFilter(e.target.value)}
            aria-label="Filter by trainer"
          >
            <option value="">All Trainers</option>
            <option value="None Assigned">None Assigned</option>
            {trainerOptions.map((trainerName) => (
              <option key={trainerName} value={trainerName}>
                {trainerName}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="bg-[#991b1b] bg-opacity-10 text-white px-4 py-2 rounded-full font-semibold flex items-center shadow-sm">
            <UsersRound className="h-4 w-4 mr-2" color="white" />
            Students: {studentsCount}
          </div>
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full font-medium flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            Showing: {filteredCount}
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center">
        <div className="flex gap-2">
          {["all", "ongoing", "hold"].map((tab) => (
            <Button
              key={tab}
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab(tab)}
              className={`py-1.5 px-3 text-xs rounded-full font-semibold transition-all duration-200 shadow-sm ${
                activeTab === tab
                  ? "bg-red-800 text-white shadow"
                  : "bg-red-800/10 text-red-800 hover:bg-red-800/20"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>
        <Button
          size="sm"
          className="inline-flex items-center px-3 py-1.5 text-xs bg-gradient-to-r from-[#991b1b] to-[#7f1d1d] text-white rounded-full shadow-md font-semibold tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#991b1b]"
          onClick={onRefresh}
          aria-label="Refresh student list"
          disabled={refreshing || loading}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
}
