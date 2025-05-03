'use client';

import { useState } from 'react';
import ChatInterface from "@/components/ChatInterface";
import ChatHistorySidebar from "@/components/ChatHistorySidebar";

export default function Home() {
  const [currentConversationId, setCurrentConversationId] = useState(null);
  
  const handleConversationSelect = (id) => {
    setCurrentConversationId(id);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="py-4 text-center">
        <h1 className="text-2xl font-bold">LevelUp Track</h1>
        <p className="text-sm text-gray-600">Your AI-powered career development assistant</p>
      </header>
      
      <main className="flex-1 w-full mx-auto px-2 relative" style={{ maxWidth: "800px" }}>
        <ChatHistorySidebar 
          onSelectConversation={handleConversationSelect} 
          currentConversationId={currentConversationId} 
        />
        <ChatInterface 
          conversationId={currentConversationId}
          onConversationChange={setCurrentConversationId}
        />
      </main>
    </div>
  );
}
