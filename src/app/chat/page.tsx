'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import ReactMarkdown from 'react-markdown';

export default function ChatPage() {
  const {
    therapists,
    selectedTherapist,
    messages,
    isLoading,
    error,
    sendMessage,
    selectTherapist,
    isInitializing,
    loadingMessageId,
    startNewConsultation
  } = useChat();

  const [inputMessage, setInputMessage] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Handle touch sliding
  const touchStartXRef = useRef<number>(0);
  const currentTranslateXRef = useRef<number>(0);
  
  // Scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    if (inputMessage.trim() && !isLoading) {
      sendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Check if there's content to send
  const hasContent = inputMessage.trim().length > 0;
  
  // Handle overlay click when closing drawer
  const handleOverlayClick = () => {
    setDrawerOpen(false);
  };
  
  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    currentTranslateXRef.current = 0;
    
    if (drawerRef.current) {
      drawerRef.current.style.transition = 'none';
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!drawerRef.current) return;
    
    const currentX = e.touches[0].clientX;
    const diffX = currentX - touchStartXRef.current;
    
    // Slide from left to right to open drawer, right to left to close
    if (drawerOpen && diffX < 0) {
      // When closing drawer, limit max left slide to negative drawer width
      currentTranslateXRef.current = Math.max(diffX, -280);
      drawerRef.current.style.transform = `translateX(${currentTranslateXRef.current}px)`;
    } else if (!drawerOpen && diffX > 0) {
      // When opening drawer, start sliding from left edge of screen, max distance is drawer width
      currentTranslateXRef.current = Math.min(diffX - 280, 0);
      drawerRef.current.style.transform = `translateX(${currentTranslateXRef.current}px)`;
    }
  };
  
  const handleTouchEnd = () => {
    if (!drawerRef.current) return;
    
    drawerRef.current.style.transition = 'transform 0.3s ease';
    
    // Decide whether to toggle drawer state based on slide distance
    if (drawerOpen && currentTranslateXRef.current < -70) {
      // Close drawer
      setDrawerOpen(false);
    } else if (!drawerOpen && currentTranslateXRef.current > -210) {
      // Open drawer
      setDrawerOpen(true);
    } else {
      // Return to original position
      drawerRef.current.style.transform = drawerOpen ? 'translateX(0)' : 'translateX(-100%)';
    }
  };
  
  // Listen for window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setDrawerOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Format message timestamp
  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Check if it's initial loading state
  const isInitialLoading = therapists.length === 0 || isInitializing;

  return (
    <div className="flex h-screen bg-white relative">
      {/* Left side therapist selection area - always visible on desktop, hidden on mobile */}
      <div className="hidden md:flex w-72 bg-gray-50 border-r border-[#e7e7e7] p-4 flex-col">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Psychological Consultant</h2>
        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3">
            {therapists.length === 0 ? (
              <div className="py-4">
                {isLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((item) => (
                      <div key={item} className="flex items-center p-3 rounded-lg border border-gray-100">
                        <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <p className="text-red-500 text-center">{error}</p>
                ) : (
                  <p className="text-gray-500 text-center">No therapists available</p>
                )}
              </div>
            ) : (
              therapists.map(therapist => (
                <button
                  key={therapist.id}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-center ${
                    selectedTherapist === therapist.id 
                      ? 'bg-blue-50 border border-[#e7e7e7]' 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => selectTherapist(therapist.id)}
                >
                  {therapist.avatar && (
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium mr-3"
                      style={{ backgroundColor: therapist.avatar.bgColor }}
                    >
                      {therapist.avatar.text}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-gray-800">{therapist.name}</div>
                    {/* <div className="text-sm text-gray-500">{therapist.description}</div> */}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
        <div className="pt-4">
          <button 
            className={`w-full p-2 rounded-lg transition-colors border border-[#e7e7e7] ${
              isInitialLoading 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
            }`}
            disabled={isInitialLoading}
            onClick={startNewConsultation}
          >
            Start New Consultation
          </button>
        </div>
      </div>
      
      {/* Mobile drawer sidebar */}
      <div 
        ref={drawerRef}
        className={`fixed md:hidden top-0 left-0 h-full w-[280px] bg-gray-50 shadow-lg z-40 transform transition-transform duration-300 ease-in-out ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="p-4 flex flex-col h-full">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Psychological Consultant</h2>
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-3">
              {therapists.length === 0 ? (
                <div className="py-4">
                  {isLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((item) => (
                        <div key={item} className="flex items-center p-3 rounded-lg border border-gray-100">
                          <div className="w-10 h-10 bg-gray-200 rounded-full mr-3 animate-pulse"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : error ? (
                    <p className="text-red-500 text-center">{error}</p>
                  ) : (
                    <p className="text-gray-500 text-center">No therapists available</p>
                  )}
                </div>
              ) : (
                therapists.map(therapist => (
                  <button
                    key={therapist.id}
                    className={`w-full text-left p-3 rounded-lg transition-colors flex items-center ${
                      selectedTherapist === therapist.id 
                        ? 'bg-blue-50 border border-[#e7e7e7]' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      selectTherapist(therapist.id);
                      setDrawerOpen(false);
                    }}
                  >
                    {therapist.avatar && (
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium mr-3"
                        style={{ backgroundColor: therapist.avatar.bgColor }}
                      >
                        {therapist.avatar.text}
                      </div>
                    )}
                    <div>
                      <div className="font-medium text-gray-800">{therapist.name}</div>
                      <div className="text-sm text-gray-500">{therapist.description}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
          <div className="pt-4">
            <button 
              className={`w-full p-2 rounded-lg transition-colors border border-[#e7e7e7] ${
                isInitialLoading 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
              disabled={isInitialLoading}
              onClick={startNewConsultation}
            >
              Start New Consultation
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile overlay */}
      {drawerOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black z-30"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          onClick={handleOverlayClick}
        />
      )}

      {/* Right side chat area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat header */}
        <div className="p-4 border-b border-[#e7e7e7] bg-white">
          <div className="max-w-3xl mx-auto flex items-center">
            {/* Mobile menu button */}
            <button 
              className="md:hidden mr-3 p-2 rounded-full hover:bg-gray-100"
              onClick={() => setDrawerOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {isInitialLoading ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </div>
            ) : selectedTherapist ? (
              <>
                {therapists.find(t => t.id === selectedTherapist)?.avatar && (
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium mr-3"
                    style={{ backgroundColor: therapists.find(t => t.id === selectedTherapist)?.avatar?.bgColor }}
                  >
                    {therapists.find(t => t.id === selectedTherapist)?.avatar?.text}
                  </div>
                )}
                <h1 className="text-xl font-semibold text-gray-700">
                  {therapists.find(t => t.id === selectedTherapist)?.name || 'Psychological Counseling'}
                </h1>
              </>
            ) : (
              <h1 className="text-xl font-semibold text-gray-700">Mastra Psychological Counseling</h1>
            )}
          </div>
        </div>

        {/* Chat message area */}
        <div className="flex-1 overflow-y-auto p-4 bg-white">
          <div className="max-w-3xl mx-auto space-y-6">
            {isInitialLoading ? (
              <div className="flex flex-col justify-center h-64 space-y-8">
                {/* Chat bubble skeleton */}
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 w-2/3 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse mt-2"></div>
                  </div>
                </div>
                
                <div className="text-center text-gray-500">Connecting to consultant...</div>
                {error && (
                  <p className="text-red-500 text-center">{error}</p>
                )}
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-500">Start a new conversation</p>
                <p className="text-gray-400 text-sm mt-2">Choose a consultant and share your feelings</p>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'assistant' && selectedTherapist && (
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: therapists.find(t => t.id === selectedTherapist)?.avatar?.bgColor || '#6366f1' }}
                    >
                      {therapists.find(t => t.id === selectedTherapist)?.avatar?.text || 'T'}
                    </div>
                  )}
                  
                  <div 
                    className={`p-4 rounded-lg shadow-sm max-w-[80%] text-gray-700 border border-[#e7e7e7] ${
                      message.role === 'user' ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    {message.content ? (
                      message.role === 'assistant' ? (
                        <div className="markdown-content">
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p>{message.content}</p>
                      )
                    ) : loadingMessageId === message.id ? (
                      // ChatGPT-like typing indicator
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    ) : isLoading && message.role === 'assistant' ? (
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                      </div>
                    ) : (
                      <p>...</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatTime(message.timestamp)}</p>
                  </div>
                  
                  {message.role === 'user' && (
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: '#f97316' }}
                    >
                      You
                    </div>
                  )}
                </div>
              ))
            )}
            
            {/* Message bottom reference point for auto-scrolling */}
            <div ref={messagesEndRef} />
            
            {/* Error message */}
            {!isInitialLoading && error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-lg border border-red-100 text-center">
                <div className="flex items-center justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Connection Failed</span>
                </div>
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-[#e7e7e7] bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-center">
              <input 
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isInitialLoading ? "Connecting..." : "Share your feelings..."}
                disabled={isLoading || isInitialLoading}
                className={`w-full px-6 py-4 pr-16 bg-gray-50 border border-[#e7e7e7] rounded-full focus:outline-none focus:ring-1 focus:ring-blue-200 focus:border-blue-300 transition-all shadow-sm ${
                  isInitialLoading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
                }`}
              />
              
              {isInitialLoading && (
                <div className="absolute left-6 right-16 h-6 bg-gray-200 rounded animate-pulse"></div>
              )}
              
              <div className="absolute right-0 flex space-x-2 px-4">
                {/* Send button - changes state based on whether there's content */}
                <button 
                  onClick={handleSend}
                  disabled={!hasContent || isLoading || isInitialLoading}
                  className={`p-2 rounded-full transition-all flex items-center justify-center ${
                    hasContent && !isLoading && !isInitialLoading
                      ? 'bg-gradient-to-r from-blue-400 to-purple-500 text-white hover:opacity-90' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  title="Send"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 rounded-full relative animate-pulse">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-75"></div>
                    </div>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 2L11 13" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">All conversations are private, feel free to share anytime</p>
          </div>
        </div>
      </div>
    </div>
  );
} 