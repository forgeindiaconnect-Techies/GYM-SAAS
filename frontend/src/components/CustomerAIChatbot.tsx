import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Bot, X, Send, Loader2, Sparkles, Minimize2, Maximize2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

const SUGGESTED_QUESTIONS = [
  "What is my booking status?",
  "When is my next session?",
  "Who is my trainer?",
  "Show my workout plan",
  "What is my payment status?",
  "How is my progress?",
  "How can I improve my fitness?"
];

const PAGE_NAMES: Record<string, string> = {
  '/member/dashboard': 'Customer Dashboard',
  '/member/my-gym': 'My Gym',
  '/member/find-trainers': 'Find Trainers',
  '/member/trainer': 'My Trainer',
  '/member/book-session': 'Book Trainer Session',
  '/member/bookings': 'My Bookings',
  '/member/online-sessions': 'Online Sessions',
  '/member/workout': 'Workout Plan',
  '/member/workout-videos': 'Workout Videos',
  '/member/diet': 'Diet Plan',
  '/member/ai-assistant': 'AI Fitness Coach',
  '/member/ai-results': 'AI Results',
  '/member/progress': 'Customer Progress',
  '/member/attendance': 'Attendance',
  '/member/subscription': 'Membership Subscription',
  '/member/upgrade': 'Upgrade Membership',
  '/member/payments': 'Payment History',
  '/member/chat': 'Messages',
  '/member/notifications': 'Notifications',
  '/member/store': 'Gym Store',
  '/member/store/orders': 'My Orders',
  '/member/profile': 'Profile Information',
};

const formatTime = () => {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Helper to format bold **text** into JSX elements
const renderFormattedText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-bold text-[#164A4A]">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const CustomerAIChatbot = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const pageTitle = PAGE_NAMES[location.pathname] || 'Customer Dashboard';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: formatTime(),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    try {
      const res = await api.post('/ai/member/chat', {
        message: query,
        pageContext: pageTitle,
        history: messages.map(m => ({ sender: m.sender, text: m.text }))
      });

      if (res.data.success && res.data.reply) {
        const botMsg: ChatMessage = {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: res.data.reply,
          timestamp: formatTime(),
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error('Invalid response from AI');
      }
    } catch (err) {
      console.error('AIChatbot error', err);
      const errorMsg: ChatMessage = {
        id: 'bot-err-' + Date.now(),
        sender: 'bot',
        text: "I'm having trouble retrieving your gym data right now. Please check your network connection and try asking again.",
        timestamp: formatTime(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-[#164A4A] to-[#206868] text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2.5 border-2 border-white/40 ring-4 ring-[#164A4A]/20 group"
          title="Open AI Gym Assistant"
        >
          <div className="relative">
            <Bot size={26} className="group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-white animate-pulse" />
          </div>
          <span className="font-bold text-sm hidden sm:inline-block pr-1">AI Assistant</span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div
          className={`fixed right-4 sm:right-6 z-50 bg-white rounded-3xl border border-[#D3DFDA] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized
              ? 'bottom-6 w-80 h-16'
              : 'bottom-6 w-[92vw] sm:w-[400px] h-[540px] max-h-[85vh]'
          }`}
        >
          {/* Window Header */}
          <div className="bg-[#164A4A] text-white px-5 py-3.5 flex items-center justify-between shrink-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shrink-0">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight leading-none flex items-center gap-1.5">
                  AI Gym Assistant
                  <Sparkles size={13} className="text-[#C6A77D]" />
                </h3>
                <p className="text-[11px] text-white/70 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online &middot; Context-Aware
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Context Banner */}
              <div className="bg-[#F1F5F3] px-4 py-1.5 border-b border-[#D3DFDA] flex items-center justify-between text-[11px] text-[#455250] font-medium">
                <span className="truncate">📍 Context: <strong>{pageTitle}</strong></span>
                <span className="text-[#164A4A] font-semibold shrink-0">Hello, {user?.firstName || 'Member'}</span>
              </div>

              {/* Chat Message Scroll Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]">
                {messages.length === 0 ? (
                  <div className="space-y-4 pt-2">
                    {/* Welcome Card */}
                    <div className="bg-white border border-[#D3DFDA] rounded-2xl p-4 shadow-sm text-center space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-[#164A4A]/10 text-[#164A4A] flex items-center justify-center mx-auto">
                        <Bot size={24} />
                      </div>
                      <h4 className="font-bold text-[#202828] text-sm">Welcome to AI Gym Assistant! 👋</h4>
                      <p className="text-xs text-[#455250] leading-relaxed">
                        Ask me anything about your trainer bookings, session status, upcoming sessions, workout plan, progress, or fitness guidance.
                      </p>
                    </div>

                    {/* Quick Questions List */}
                    <div>
                      <p className="text-[11px] font-bold text-[#A8ADA9] uppercase tracking-wider mb-2 px-1">
                        Suggested Quick Questions
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {SUGGESTED_QUESTIONS.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(q)}
                            className="text-left px-3.5 py-2.5 bg-white border border-[#D3DFDA] hover:border-[#164A4A] hover:bg-[#F1F5F3] text-xs font-semibold text-[#202828] rounded-xl transition-all flex items-center justify-between group shadow-2xs"
                          >
                            <span>{q}</span>
                            <Sparkles size={12} className="text-[#164A4A] opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender === 'bot' && (
                        <div className="w-7 h-7 rounded-xl bg-[#164A4A] text-white flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-xs">
                          <Bot size={14} />
                        </div>
                      )}
                      <div className={`max-w-[82%] space-y-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-[#164A4A] text-white rounded-tr-xs shadow-sm font-medium'
                              : 'bg-white text-[#202828] border border-[#D3DFDA] rounded-tl-xs shadow-xs'
                          }`}
                        >
                          {renderFormattedText(msg.text)}
                        </div>
                        <span className={`text-[10px] text-[#A8ADA9] block px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))
                )}

                {/* Loading State Indicator */}
                {loading && (
                  <div className="flex gap-2.5 items-start">
                    <div className="w-7 h-7 rounded-xl bg-[#164A4A] text-white flex items-center justify-center shrink-0 text-xs">
                      <Bot size={14} />
                    </div>
                    <div className="bg-white border border-[#D3DFDA] p-3 rounded-2xl rounded-tl-xs shadow-xs text-xs text-[#455250] flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-[#164A4A]" />
                      <span>Checking your gym data...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Footer */}
              <div className="p-3 border-t border-[#D3DFDA] bg-white">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={loading}
                    placeholder="Ask about bookings, sessions, trainer..."
                    className="flex-1 px-4 py-2.5 bg-[#F8FAFC] border border-[#D3DFDA] rounded-xl text-xs focus:outline-none focus:border-[#164A4A] text-[#202828] placeholder:text-[#A8ADA9]"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || loading}
                    className="p-2.5 bg-[#164A4A] text-white rounded-xl hover:bg-[#C6A77D] transition-colors disabled:opacity-40 disabled:hover:bg-[#164A4A] shadow-xs"
                    title="Send message"
                  >
                    <Send size={15} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default CustomerAIChatbot;
