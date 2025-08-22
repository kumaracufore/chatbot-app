"use client";

import { useState } from "react";
import { BsChatDots, BsChatDotsFill, BsChevronDown, BsFileText, BsGear, BsPerson } from "react-icons/bs";
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
});

interface HeaderProps {
  title: string;
  onDateRangeChange?: (dateRange: string) => void;
  onExport?: () => void;
  showDateRange?: boolean;
  showExport?: boolean;
}

export default function Header({ 
  title, 
  onDateRangeChange, 
  onExport, 
  showDateRange = true, 
  showExport = true 
}: HeaderProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("Last 30 Days");

  const handleDateRangeChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod);
    if (onDateRangeChange) {
      onDateRangeChange(newPeriod);
    }
  };

  return (
    <header className={`${poppins.variable} font-sans bg-gradient-to-r from-gray-900/90 via-gray-900/80 to-gray-900/90 backdrop-blur-md text-white px-6 py-4 border-b border-gray-700/50 shadow-lg`}>
      <div className="mx-auto w-full flex items-center justify-between px-4">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <div className="flex -space-x-1">
            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
              <BsChatDots className="w-4 h-4 text-white" />
            </div>
            <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
              <BsChatDotsFill className="w-4 h-4 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent tracking-tight">
            {title}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          {/* Date Range Selector */}
          {showDateRange && (
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                className="bg-gray-800/50 border border-gray-600/50 text-white px-4 py-2 pr-10 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent appearance-none transition-all duration-200 hover:bg-gray-700/70 hover:border-gray-500/50 shadow-sm"
              >
                <option value="Last 7 Days">Last 7 Days</option>
                <option value="Last 30 Days">Last 30 Days</option>
                <option value="Last 90 Days">Last 90 Days</option>
                <option value="Last Year">Last Year</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <BsChevronDown className="w-4 h-4 text-gray-300" />
              </div>
            </div>
          )}

          {/* Export Button */}
          {showExport && onExport && (
            <button 
              className="p-2 text-gray-300 hover:text-white transition-all duration-200 hover:bg-white/10 rounded-full w-10 h-10 flex items-center justify-center"
              onClick={onExport}
              title="Export data"
            >
              <BsFileText className="w-5 h-5" />
            </button>
          )}

          {/* User Profile */}
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-full flex items-center justify-center text-white font-medium text-sm overflow-hidden shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 hover:scale-105">
            <BsPerson className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
