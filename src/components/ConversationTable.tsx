"use client";

import { useState, useEffect } from "react";

interface Conversation {
  _id: string;
  conversationId: number;
  totalConversation: string;
  duration: string;
  region: string;
  country: string;
  status: "active" | "paused";
  createdAt: string;
}

interface ConversationTableProps {
  dateRange?: string;
}

export default function ConversationTable({
  dateRange = "Last 30 Days",
}: ConversationTableProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/conversations");
      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }
      const data = await response.json();
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const getDateRangeTitle = () => {
    const today = new Date();
    let startDate = new Date();

    switch (dateRange) {
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
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, "-");
    };

    return `Conversations From ${formatDate(startDate)} to ${formatDate(
      today
    )}`;
  };

  const filteredConversations = conversations.filter((conversation) =>
    conversation.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-200">Error</h3>
            <div className="mt-2 text-sm text-red-300">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black border border-gray-700 rounded-lg p-6">
      {/* Title and Search */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-white">
          {getDateRangeTitle()}
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search for location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-gray-900 border border-gray-700 text-white px-4 py-2 pl-10 pr-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                Conversation ID
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                Total Conversation
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                Region
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                Country
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                Actions
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                Export
              </th>
            </tr>
          </thead>
          <tbody className="bg-black divide-y divide-gray-800">
            {filteredConversations.map((conversation, index) => (
              <tr key={conversation._id} className="hover:bg-gray-900">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-center">
                  {String(index + 1).padStart(3, "0")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-center">
                  {conversation.conversationId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-center">
                  {conversation.totalConversation}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-center">
                  {conversation.duration}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-center">
                  {conversation.region}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-center">
                  {conversation.country}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-center">
                  <div className="flex items-center justify-center space-x-2">
                    {/* View Button */}
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </button>

                    {/* Three Dots Menu Button */}
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-center">
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredConversations.length === 0 && (
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-300">
            No conversations found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding a new conversation.
          </p>
        </div>
      )}
    </div>
  );
}
