import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, X, Loader2, Sparkles } from 'lucide-react';
import { sendMessageToGemini, initGeminiChat } from '../services/geminiService';
import { ChatMessage } from '../types';

interface AiAssistantProps {
  contextHint?: string; // e.g., "Creating Token on BNB"
}

export const AiAssistant: React.FC<AiAssistantProps> = ({ contextHint }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'intro',
      role: 'model',
      text: 'Hello! I am KUBA Forge Ai. How can I assist you with your token journey today? I can speak multiple languages.',
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initGeminiChat();
  }, []);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Append context if available and it's the first message about it, or just send naturally
    const prompt = contextHint ? `[Context: User is currently ${contextHint}] ${input}` : input;

    const responseText = await sendMessageToGemini(prompt);

    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 md:w-96 bg-card border border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px] animate-fade-in-up ring-1 ring-yellow-500/20">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 flex justify-between items-center">
            <div className="flex items-center gap-2 text-black">
              <Bot className="w-6 h-6" />
              <div className="flex flex-col">
                <span className="font-bold text-sm">KUBA Forge Ai</span>
                <span className="text-xs text-black/70 flex items-center gap-1 font-medium">
                  <Sparkles className="w-3 h-3" /> Powered by Gemini 2.5
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-black/60 hover:text-black">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-darker/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-yellow-500 text-black font-medium rounded-tr-none shadow-lg shadow-yellow-500/10'
                      : 'bg-gray-700 text-gray-100 rounded-tl-none border border-gray-600'
                  }`}
                >
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i} className="mb-1 last:mb-0">{line}</p>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-700 p-3 rounded-2xl rounded-tl-none flex items-center gap-2 border border-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                  <span className="text-xs text-gray-400">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-card border-t border-gray-700 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about tokens, or paste error logs..."
              className="flex-1 bg-dark border border-gray-600 text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 text-black font-bold p-2 rounded-xl transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${
          isOpen ? 'bg-gray-700' : 'bg-gradient-to-r from-yellow-400 to-orange-500 animate-pulse'
        } text-black p-4 rounded-full shadow-lg hover:shadow-yellow-500/50 transition-all transform hover:scale-105 flex items-center gap-2 font-bold`}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <Bot className="w-6 h-6" />}
        {!isOpen && <span className="pr-2">Ask AI</span>}
      </button>
    </div>
  );
};