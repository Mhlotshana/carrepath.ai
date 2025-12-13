import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { createChat } from '../services/geminiService';
import { Send, User, Bot, Trash2 } from 'lucide-react';

const ChatPage: React.FC = () => {
  const { profile, analysis } = useUser();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Initialize chat session ref to persist across renders
  const chatSession = useRef<any>(null);

  // Lazy initialization of messages from localStorage
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>(() => {
    const saved = localStorage.getItem('cp_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
    // Default initial message
    return [
      { role: 'model', text: profile ? `Hi ${profile.name}! I've reviewed your results. Ask me anything about your career path, university choices, or how to improve your APS.` : "Hi there! Please upload your results first so I can give personalized advice." }
    ];
  });

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cp_chat_history', JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize or Restore Chat Session
  useEffect(() => {
    if (profile && analysis && !chatSession.current) {
      const courses = analysis.courses || [];
      const context = `
        You are a helpful South African career guidance counselor.
        Student Name: ${profile.name}
        APS Score: ${profile.apsScore}
        Subjects: ${JSON.stringify(profile.subjects)}
        Recommended Courses: ${JSON.stringify(courses.map(c => c.name))}
        
        Keep answers concise, encouraging, and specific to the South African education context (NSFAS, CAO, Universities).
      `;
      
      // Convert UI messages to Gemini history format
      const history = messages.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
      }));

      chatSession.current = createChat(context, history);
    }
  }, [profile, analysis, messages]); // Added messages to dep array so if we clear history, we might need to know? 
  // Actually, if we clear history, we reset `chatSession.current` to null, so this effect runs again.

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      // Ensure session exists
      if (!chatSession.current) {
         // Fallback if session wasn't created (e.g. missing profile/analysis)
         // We might need to handle this gracefully, but for now we assume profile exists if they are chatting
         if (!profile) {
             setMessages(prev => [...prev, { role: 'model', text: "Please upload your results first." }]);
             setIsLoading(false);
             return;
         }
      }

      const result = await chatSession.current.sendMessage({ message: userMsg });
      setMessages(prev => [...prev, { role: 'model', text: result.text }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      const defaultMsg = { role: 'model', text: profile ? `Hi ${profile.name}! I've reviewed your results. Ask me anything about your career path, university choices, or how to improve your APS.` : "Hi there! Please upload your results first so I can give personalized advice." } as const;
      setMessages([defaultMsg]);
      localStorage.removeItem('cp_chat_history');
      chatSession.current = null; // Force session recreation
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[600px] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-primary-600 p-4 text-white flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <Bot className="w-6 h-6 mr-2" />
          <h1 className="font-semibold text-lg">Career Advisor AI</h1>
        </div>
        <button 
          onClick={clearHistory}
          className="p-2 hover:bg-primary-700 rounded-full transition-colors text-primary-100 hover:text-white"
          title="Clear History"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-2 flex-shrink-0">
                <Bot className="w-5 h-5 text-primary-600" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
              msg.role === 'user' 
              ? 'bg-primary-600 text-white rounded-br-none' 
              : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-2 flex-shrink-0">
                <Bot className="w-5 h-5 text-primary-600" />
              </div>
            <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm flex items-center space-x-1">
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-100">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about courses, bursaries, or requirements..."
            className="flex-grow p-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:bg-gray-300 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;