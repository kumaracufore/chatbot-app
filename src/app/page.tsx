"use client";

"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import Header from "@/components/Header";
import ConversationTable from "@/components/ConversationTable";
import { ChatMessage } from "@/types";

export default function Home() {
  const [selectedDateRange, setSelectedDateRange] = useState("Last 30 Days");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conversationStatuses, setConversationStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const chatHistoryResponse = await fetch("/api/chat-history");
      if (!chatHistoryResponse.ok) throw new Error("Failed to fetch chat history");
      const chatHistoryData = await chatHistoryResponse.json();
      setChatHistory(chatHistoryData);
      
      const sessionsResponse = await fetch("/api/sessions");
      if (!sessionsResponse.ok) throw new Error("Failed to fetch sessions");
      const sessionsData = await sessionsResponse.json();
      setSessions(sessionsData);
      
      const statusResponse = await fetch("/api/conversation-status");
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setConversationStatuses(statusData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (dateRange: string) => {
    setSelectedDateRange(dateRange);
  };

  const getFormattedDateRange = () => {
    const today = new Date();
    let startDate = new Date();

    switch (selectedDateRange) {
      case "Last 7 Days":
        startDate.setDate(today.getDate() - 7);
        break;
      case "Last 30 Days":
        startDate.setDate(today.getDate() - 30);
        break;
      case "Last 90 Days":
        startDate.setDate(today.getDate() - 90);
        break;
      case "Last Year":
        startDate.setFullYear(today.getFullYear() - 1);
        break;
      default:
        startDate.setDate(today.getDate() - 30);
    }

    const formatDate = (date: Date) => {
      return date
        .toLocaleDateString("en-CA", { // YYYY-MM-DD format
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
    };

    return { 
      title: `Conversations From ${formatDate(startDate)} to ${formatDate(today)}`,
      filename: `completed-conversations-${formatDate(startDate)}-to-${formatDate(today)}.xlsx`
    };
  };

  const handleBulkExport = () => {
    const completedConversations = chatHistory.reduce((acc, message) => {
      const sessionId = message.session_id;
      if (conversationStatuses[sessionId] === 'complete') {
        if (!acc[sessionId]) {
          acc[sessionId] = [];
        }
        acc[sessionId].push(message);
      }
      return acc;
    }, {} as Record<string, ChatMessage[]>);

    if (Object.keys(completedConversations).length === 0) {
      alert("No completed conversations to export.");
      return;
    }

    const workbook = XLSX.utils.book_new();

    for (const sessionId in completedConversations) {
      const messages = completedConversations[sessionId].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const messagesToExport = messages.map(msg => ({
        Timestamp: new Date(msg.timestamp).toLocaleString(),
        Role: msg.role,
        Content: msg.content.replace(/<[^>]*>?/gm, ''),
      }));

      const worksheet = XLSX.utils.json_to_sheet(messagesToExport);
      worksheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 100 }];
      XLSX.utils.book_append_sheet(workbook, worksheet, `Session-${sessionId.substring(0, 8)}`);
    }

    const { filename } = getFormattedDateRange();
    XLSX.writeFile(workbook, filename);
  };

  return (
    <div className="min-h-screen bg-black">
      <Header onDateRangeChange={handleDateRangeChange} onExport={handleBulkExport} />
      <main className="p-6">
                <ConversationTable 
          dateRangeTitle={getFormattedDateRange().title}
          chatHistory={chatHistory}
          sessions={sessions}
          loading={loading}
          error={error}
          conversationStatuses={conversationStatuses}
          setConversationStatuses={setConversationStatuses}
        />
      </main>
    </div>
  );
}
