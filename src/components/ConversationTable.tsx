"use client";

import { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { ChatMessage } from "@/types";

// Custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 3px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #9ca3af;
    border-radius: 2px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
`;


interface ConversationTableProps {
  dateRangeTitle: string;
  chatHistory: ChatMessage[];
  sessions: any[];
  loading: boolean;
  error: string | null;
  conversationStatuses: Record<string, string>;
  setConversationStatuses: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export default function ConversationTable({
  dateRangeTitle,
  chatHistory,
  sessions,
  loading,
  error,
  conversationStatuses,
  setConversationStatuses,
}: ConversationTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [statusMenuOpen, setStatusMenuOpen] = useState<string | null>(null);

  // Group messages by session_id to create conversations
  const groupedConversations = chatHistory.reduce((acc, message) => {
    const sessionId = message.session_id;
    if (!acc[sessionId]) {
      acc[sessionId] = [];
    }
    acc[sessionId].push(message);
    return acc;
  }, {} as Record<string, ChatMessage[]>);

  // Convert grouped conversations to table data, filtering out incomplete conversations
  const conversationData = Object.entries(groupedConversations)
    .filter(([sessionId, messages]) => {
      // Check if conversation has both user and assistant messages
      const hasUser = messages.some(msg => msg.role === 'user');
      const hasAssistant = messages.some(msg => msg.role === 'assistant');
      return hasUser && hasAssistant;
    })
    .map(([sessionId, messages], index) => {
      // Sort messages by timestamp
      const sortedMessages = messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      
      // Calculate conversation metrics
      const totalMessages = messages.length;
      const firstMessage = sortedMessages[0];
      const lastMessage = sortedMessages[sortedMessages.length - 1];
      
      // Calculate duration
      const startTime = new Date(firstMessage.timestamp).getTime();
      const endTime = new Date(lastMessage.timestamp).getTime();
      const durationMs = endTime - startTime;
      const durationMinutes = Math.floor(durationMs / 60000);
      const durationSeconds = Math.floor((durationMs % 60000) / 1000);
      const formattedDuration = durationMinutes > 0 ? `${durationMinutes}m ${durationSeconds}s` : `${durationSeconds}s`;
      
      // Determine conversation status
      const userMessages = sortedMessages.filter(msg => msg.role === 'user');
      const assistantMessages = sortedMessages.filter(msg => msg.role === 'assistant');
      
      // Check if conversation is older than 7 days
      const conversationAge = Date.now() - new Date(firstMessage.timestamp).getTime();
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      
      let status = conversationStatuses[sessionId] || 'pending'; // Default to pending
      
      // Only apply auto-logic if no manual status has been set
      if (!conversationStatuses[sessionId]) {
        if (conversationAge > sevenDaysInMs) {
          status = 'complete';
        } else if (userMessages.length === 0 || assistantMessages.length === 0) {
          status = 'incomplete';
        }
      } else {
        // Use the manually set status
        status = conversationStatuses[sessionId];
      }
      
      return {
        id: index + 1,
        conversationId: String(index + 1).padStart(3, "0"), // Sequential format: 001, 002, etc.
        totalConversation: `${totalMessages} messages`,
        duration: formattedDuration,
        region: 'Unknown', // Placeholder - can be enhanced later
        country: 'Unknown', // Placeholder - can be enhanced later
        sessionId: sessionId,
        messages: sortedMessages,
        createdAt: firstMessage.timestamp,
        status: status
      };
    });

  // Sort conversations by creation time (newest first)
  const sortedConversations = conversationData.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Filter conversations based on search term
  const filteredData = sortedConversations.filter((conversation) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      conversation.conversationId.toLowerCase().includes(searchLower) ||
      conversation.sessionId.toLowerCase().includes(searchLower) ||
      conversation.region.toLowerCase().includes(searchLower) ||
      conversation.country.toLowerCase().includes(searchLower) ||
      conversation.messages.some(msg => 
        msg.content.toLowerCase().includes(searchLower) ||
        msg.role.toLowerCase().includes(searchLower)
      )
    );
  });

  const handleExport = (conversation: any) => {
    const messagesToExport = conversation.messages.map((msg: ChatMessage) => ({
      Timestamp: new Date(msg.timestamp).toLocaleString(),
      Role: msg.role,
      Content: msg.content.replace(/<[^>]*>?/gm, ''), // Strip HTML tags from content
    }));

    const worksheet = XLSX.utils.json_to_sheet(messagesToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Conversation");

    // Set column widths for better readability
    worksheet['!cols'] = [
      { wch: 20 }, // Timestamp
      { wch: 15 }, // Role
      { wch: 100 }  // Content
    ];

    XLSX.writeFile(workbook, `conversation-${conversation.sessionId}.xlsx`);
  };

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
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div className="bg-black border border-gray-700 rounded-lg p-6">
      {/* Title and Search */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-white">
          {dateRangeTitle}
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations, messages, or session"
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
                View Chats
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                Flags
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                Export
              </th>
            </tr>
          </thead>
          <tbody className="bg-black divide-y divide-gray-800">
            {filteredData.map((conversation, index) => (
              <tr 
                key={conversation.sessionId} 
                className="hover:bg-gray-900"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-center">
                  {String(conversation.id).padStart(3, "0")}
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                  <div className="flex items-center justify-center space-x-2">
                    {/* View Button */}
                    <button 
                      className="text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                      onClick={() => setSelectedConversation(conversation.sessionId)}
                    >
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
                   <div className="relative">
                      <button 
                        className="text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                        onClick={() => setStatusMenuOpen(statusMenuOpen === conversation.sessionId ? null : conversation.sessionId)}
                      >
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
                      
                      {/* Status Selection Modal */}
                      {statusMenuOpen === conversation.sessionId && (
                        <div className="fixed inset-0 flex items-center justify-center z-50">
                          <div 
                            className="fixed inset-0"
                            style={{ backgroundColor: '#0000001a' }}
                            onClick={() => setStatusMenuOpen(null)}
                          />
                          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 min-w-[200px] relative z-10">
                            <h3 className="text-gray-900 dark:text-white font-medium mb-3">Update Status</h3>
                            <div className="space-y-2">
                              {['pending', 'incomplete', 'complete'].map((status) => (
                                <button
                                  key={status}
                                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-all flex items-center border-2 cursor-pointer ${
                                    conversation.status === status 
                                      ? (status === 'complete' ? 'bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                         status === 'pending' ? 'bg-yellow-100 border-yellow-500 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                         'bg-red-100 border-red-500 text-red-800 dark:bg-red-900 dark:text-red-200')
                                      : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                  }`}
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    
                                    try {
                                      // Update database
                                      const response = await fetch('/api/conversation-status', {
                                        method: 'PUT',
                                        headers: {
                                          'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                          sessionId: conversation.sessionId,
                                          flagStatus: status,
                                        }),
                                      });
                                      
                                      if (response.ok) {
                                        // Update local state only if database update succeeds
                                        setConversationStatuses(prev => ({
                                          ...prev,
                                          [conversation.sessionId]: status
                                        }));
                                      } else {
                                        console.error('Failed to update status in database');
                                        // Could add toast notification here
                                      }
                                    } catch (error) {
                                      console.error('Error updating status:', error);
                                      // Could add toast notification here
                                    }
                                    
                                    setStatusMenuOpen(null);
                                  }}
                                >
                                  <span className={`inline-block w-3 h-3 rounded-full mr-3 ${
                                    status === 'complete' ? 'bg-green-500' :
                                    status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}></span>
                                  {status.charAt(0).toUpperCase() + status.slice(1)}
                                  {conversation.status === status && (
                                    <span className="ml-auto text-xs">✓</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    conversation.status === 'complete' 
                      ? 'bg-green-900 text-green-200' 
                      : conversation.status === 'pending'
                      ? 'bg-yellow-900 text-yellow-200'
                      : 'bg-red-900 text-red-200'
                  }`}>
                    {conversation.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-center">
                  <button 
                    className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                    onClick={() => handleExport(conversation)}
                  >
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

      {filteredData.length === 0 && (
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
            Try adjusting your search criteria.
          </p>
        </div>
      )}
      
      
      {/* Bootstrap-style Chat Modal */}
      {selectedConversation && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          style={{ backgroundColor: '#0000001a' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedConversation(null);
            }
          }}
        >
          <div className="bg-white bg-custom-grey rounded-lg w-full max-w-4xl h-4/5 max-h-[85vh] flex flex-col shadow-xl border border-gray-200 dark:border-gray-700 transform transition-all duration-200 ease-out scale-100">
            {/* Chat Header */}
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 rounded-t-lg flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-gray-900 dark:text-white font-medium">Conversation {selectedConversation.substring(0, 8)}</h3>
                {(() => {
                  const conversationMessages = chatHistory
                    .filter(msg => msg.session_id === selectedConversation)
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                  
                  if (conversationMessages.length > 0) {
                    const startTime = new Date(conversationMessages[0].timestamp);
                    return (
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {startTime.toLocaleDateString()} at {startTime.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>
              <button 
                onClick={() => setSelectedConversation(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Chat Messages */}
            <div 
              className="flex-1 overflow-y-auto p-6 custom-scrollbar"
            >
              <div className="space-y-3">
                {(() => {
                  const conversationMessages = chatHistory
                    .filter(msg => msg.session_id === selectedConversation)
                    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                  
                  return conversationMessages.map((message, index) => {
                    const isUser = message.role === 'user';
                    
                    return (
                      <div key={message._id}>
                        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-1`}>
                          <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md ${
                            isUser 
                              ? 'bg-blue-500 text-white rounded-br-md' 
                              : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 rounded-bl-md'
                          }`}>
                            <div 
                              className="text-sm"
                              dangerouslySetInnerHTML={{ __html: message.content }}
                            />
                            <div className={`text-xs mt-1 ${
                              isUser ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {new Date(message.timestamp).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
            
          </div>
        </div>
      )}
      </div>
    </>
  );
}
