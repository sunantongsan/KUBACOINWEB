import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Sparkles, Bot, Loader2, Minimize2, Maximize2 } from 'lucide-react';
import { generateAIResponse } from '../services/aiService';
import { ChatMessage } from '../types';

export const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'init', role: 'ai', text: 'Hello! I am KUBA AI. I can help you audit contracts, explain transaction errors, or guide you through the Forge.', timestamp: Date.now() }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiText = await generateAIResponse(userMsg.text);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: aiText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      // Error handling handled in service, but fallback here
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: "Connection error. Please try again.", timestamp: Date.now() }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 group"
      >
        <Bot className="text-slate-900 w-8 h-8" />
        <span className="absolute right-full mr-3 top-2 bg-slate-800 text-yellow-400 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Ask KUBA AI
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-slate-900 border border-yellow-500/30 rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300 ${isMinimized ? 'w-72 h-16' : 'w-80 sm:w-96 h-[500px]'}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50 rounded-t-2xl cursor-pointer" onClick={() => !isMinimized && setIsMinimized(!isMinimized)}>
        <div className="flex items-center gap-2">
            <div className="bg-yellow-500/20 p-1.5 rounded-lg">
                <Sparkles size={16} className="text-yellow-400" />
            </div>
            <h3 className="font-bold text-slate-100">KUBA AI Assistant</h3>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="text-slate-400 hover:text-white p-1">
                {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>
            <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="text-slate-400 hover:text-red-400 p-1">
                <X size={16} />
            </button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/95">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-yellow-600 text-white rounded-br-none' 
                    : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                }`}>
                  {msg.role === 'ai' && <div className="text-xs text-yellow-500 font-bold mb-1">AI Assistant</div>}
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 p-3 rounded-xl rounded-bl-none border border-slate-700 flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin text-yellow-500" />
                    <span className="text-xs text-slate-400">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-800 bg-slate-950 rounded-b-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about contracts, errors..."
                className="flex-1 bg-slate-800 text-slate-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-yellow-500 border border-slate-700"
              />
              <button 
                onClick={handleSend} 
                disabled={isLoading || !inputValue.trim()}
                className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};