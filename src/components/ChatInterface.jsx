'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'What role do you want to progress to?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [playlist, setPlaylist] = useState(null);
  const [playlistIdeas, setPlaylistIdeas] = useState([]);
  const router = useRouter();
  const carouselRef = useRef(null);
  const messagesEndRef = useRef(null);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message to chat
    const userMessage = { role: 'user', content: inputValue };
    setMessages([...messages, userMessage]);
    setLoading(true);

    try {
      // Make API call to generate playlist based on user's desired role
      const response = await fetch('/api/generate-playlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ theme: inputValue }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate playlist');
      }

      const data = await response.json();
      
      // Extract video titles for the playlist ideas
      const ideas = data.videos.map(video => video.title);
      setPlaylistIdeas(ideas);
      setPlaylist(data);

      // Add response to chat with playlist title
      setMessages([
        ...messages, 
        userMessage, 
        { 
          role: 'assistant', 
          content: `Here's a learning playlist to help you become a ${inputValue}:` 
        },
        {
          role: 'assistant',
          type: 'playlist-ideas',
          content: ideas
        },
        {
          role: 'assistant',
          type: 'playlist',
          content: data
        }
      ]);
      
      // Scroll to bottom of messages
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Error generating playlist:', error);
      setMessages([
        ...messages,
        userMessage,
        { role: 'assistant', content: 'Sorry, I encountered an error generating your playlist. Please try again.' }
      ]);
    } finally {
      setLoading(false);
      setInputValue('');
    }
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      const currentScroll = carouselRef.current.scrollLeft;
      carouselRef.current.scrollTo({
        left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const renderMessage = (message, index) => {
    if (message.type === 'playlist-ideas') {
      return (
        <div key={index} className="bg-white shadow-sm rounded-lg p-4 max-w-[90%]">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Generated playlist ideas:</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            {message.content.map((idea, idx) => (
              <li key={idx}>{idea}</li>
            ))}
          </ul>
        </div>
      );
    }
    
    if (message.type === 'playlist') {
      return (
        <div key={index} className="bg-white shadow-sm rounded-lg p-4 max-w-[95%] w-full mt-2">
          <h3 className="text-lg font-bold mb-4">{message.content.theme} Learning Playlist</h3>
          <div className="relative">
            <button 
              onClick={() => scrollCarousel('left')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 rounded-full p-2 shadow-sm hover:bg-gray-100 text-gray-700"
              aria-label="Previous videos"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            
            <div 
              ref={carouselRef}
              className="flex overflow-x-auto pb-4 gap-4 scrollbar-hide snap-x scroll-smooth px-6"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {message.content.videos?.map((video) => (
                <div key={video.id} className="flex-shrink-0 w-72 snap-start border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200 bg-white">
                  <h4 className="font-medium mb-2 text-sm line-clamp-2 h-10 text-gray-800">{video.title}</h4>
                  <div className="aspect-video mb-2 w-full rounded-md overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${video.videoId}`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded-md"
                    ></iframe>
                  </div>
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => scrollCarousel('right')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white/90 rounded-full p-2 shadow-sm hover:bg-gray-100 text-gray-700"
              aria-label="Next videos"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
          
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
          `}</style>
        </div>
      );
    }
    
    return (
      <div
        key={index}
        className={`p-3 rounded-lg ${
          message.role === 'user'
            ? 'bg-blue-100 ml-auto max-w-[80%]'
            : 'bg-white shadow-sm max-w-[80%]'
        }`}
      >
        {message.content}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 overflow-y-auto space-y-4 mb-1">
        {messages.map((message, index) => renderMessage(message, index))}
        {loading && (
          <div className="p-3 rounded-lg bg-white shadow-sm max-w-[80%]">
            <div className="flex space-x-2 items-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-3 flex border-t">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your desired role..."
          className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
          disabled={loading}
        />
        <button
          type="submit"
          className={`px-4 py-2 rounded-r-lg bg-blue-500 text-white font-medium ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
          }`}
          disabled={loading}
        >
          Send
        </button>
      </form>
    </div>
  );
} 