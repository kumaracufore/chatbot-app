"use client";

import { useState } from "react";
import Header from "@/components/Header";
import ConversationTable from "@/components/ConversationTable";

export default function Home() {
  const [selectedDateRange, setSelectedDateRange] = useState("Last 30 Days");

  const handleDateRangeChange = (dateRange: string) => {
    setSelectedDateRange(dateRange);
  };

  return (
    <div className="min-h-screen bg-black">
      <Header onDateRangeChange={handleDateRangeChange} />
      <main className="p-6">
        <ConversationTable dateRange={selectedDateRange} />
      </main>
    </div>
  );
}
