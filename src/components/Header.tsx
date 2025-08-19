"use client";

import { useState } from "react";
import { BsChatDots, BsChatDotsFill, BsChevronDown, BsFileText, BsGear, BsPerson } from "react-icons/bs";

interface HeaderProps {
  onDateRangeChange?: (dateRange: string) => void;
  onExport?: () => void;
}

export default function Header({ onDateRangeChange, onExport }: HeaderProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("Last 30 Days");

  const handleDateRangeChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod);
    if (onDateRangeChange) {
      onDateRangeChange(newPeriod);
    }
  };

  return (
    <header className="bg-black text-white px-6 py-4 border-b border-gray-800">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <div className="flex -space-x-1">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
              <BsChatDots 
                className="w-4 h-4 text-white"
              />
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
              <BsChatDotsFill
                className="w-4 h-4 text-white"
              />
            </div>
          </div>
          <h1 className="text-xl font-semibold">Chatbot Analytics</h1>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => handleDateRangeChange(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-white px-4 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent appearance-none"
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 90 Days">Last 90 Days</option>
              <option value="Last Year">Last Year</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <BsChevronDown className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Right Side Icons */}
        <div className="flex items-center space-x-4">
          {/* Document Icon */}
          <button className="p-2 text-gray-400 hover:text-white transition-colors" onClick={onExport}>
            <BsFileText className="w-5 h-5" />
          </button>

          {/* Settings Icon */}
          {/*<button className="p-2 text-gray-400 hover:text-white transition-colors">
            <BsGear className="w-5 h-5" />
          </button>*/}

          {/* User Profile */}
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-medium text-sm overflow-hidden">
            <BsPerson className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
