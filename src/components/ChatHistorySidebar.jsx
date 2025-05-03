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
      {/* Toggle button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-20 z-50 bg-blue-500 text-white p-2 rounded-full shadow-md hover:bg-blue-600 transition-all"
        aria-label={isOpen ? "Close chat history" : "Open chat history"}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6L6 18M6 6l12 12"></path>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </button>
      
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 z-40 h-full bg-white shadow-lg transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '280px' }}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b">
            <h2 className="text-lg font-bold">Chat History</h2>
          </div>
          
          {/* New Chat button */}
          <div className="p-3 border-b">
            <button 
              onClick={startNewConversation}
              className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
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
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : error ? (
              <div className="p-4 text-center text-red-500">{error}</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No conversations yet</div>
            ) : (
              <ul className="divide-y">
                {conversations.map(conversation => (
                  <li 
                    key={conversation.id} 
                    className={`p-3 hover:bg-gray-100 cursor-pointer ${
                      currentConversationId === conversation.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => handleSelectConversation(conversation.id)}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium text-sm truncate">{conversation.title}</h3>
                      <button 
                        onClick={(e) => deleteConversation(conversation.id, e)}
                        className="text-gray-400 hover:text-red-500"
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
          className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
} 