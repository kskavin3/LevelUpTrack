'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

export default function ChatHistorySidebar({ onSelectConversation, currentConversationId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/conversations');
      const data = await response.json();
      
      if (data.success) {
        setConversations(data.conversations);
      } else {
        setError('Failed to load conversations');
      }
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  const deleteConversation = async (id, e) => {
    e.stopPropagation(); // Prevent triggering the conversation selection
    
    if (!confirm('Are you sure you want to delete this conversation?')) return;
    
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove from state
        setConversations(conversations.filter(conv => conv.id !== id));
        
        // If the currently active conversation was deleted, notify parent
        if (currentConversationId === id) {
          onSelectConversation(null);
        }
      } else {
        alert('Failed to delete conversation');
      }
    } catch (err) {
      console.error('Error deleting conversation:', err);
      alert('Failed to delete conversation');
    }
  };

  const startNewConversation = () => {
    onSelectConversation(null);
    // Close sidebar on mobile after selecting
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const handleSelectConversation = (id) => {
    onSelectConversation(id);
    // Close sidebar on mobile after selecting
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Modern toggle button with smooth animation */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed left-0 top-20 z-50 bg-gray-800/90 text-white p-3 rounded-r-lg shadow-lg transition-all duration-300 ease-in-out hover:bg-gray-700 ${
          isOpen ? 'translate-x-64 md:translate-x-72' : 'translate-x-0'
        }`}
        aria-label={isOpen ? "Close chat history" : "Open chat history"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isOpen ? (
            <path d="M15 18l-6-6 6-6" />
          ) : (
            <path d="M9 18l6-6-6-6" />
          )}
        </svg>
      </button>
      
      {/* Sidebar with updated design */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-full bg-white/95 backdrop-blur-sm shadow-xl transition-all duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '280px' }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold">History</h2>
          </div>
          
          {/* New Chat button */}
          <div className="p-3 border-b border-gray-100">
            <button 
              onClick={startNewConversation}
              className="w-full py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              New Chat
            </button>
          </div>
          
          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-800"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-center text-red-500 text-sm">{error}</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                No conversations yet
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {conversations.map(conversation => (
                  <li 
                    key={conversation.id} 
                    className={`p-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                      currentConversationId === conversation.id ? 'bg-gray-50 border-l-4 border-gray-800' : ''
                    }`}
                    onClick={() => handleSelectConversation(conversation.id)}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-sm truncate">{conversation.title}</h3>
                      <button 
                        onClick={(e) => deleteConversation(conversation.id, e)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 -mt-1 -mr-1 rounded-full hover:bg-gray-100"
                        aria-label="Delete conversation"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-1">{conversation.lastMessage}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDistanceToNow(new Date(conversation.updatedAt), { addSuffix: true })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </aside>
      
      {/* Overlay to close sidebar on click (mobile only) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
} 