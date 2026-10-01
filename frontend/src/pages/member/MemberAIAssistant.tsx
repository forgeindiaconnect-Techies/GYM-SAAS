import { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

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

const formatTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const renderFormattedText = (text: string) => {
  const parts = text.split(/(\**.*?\**)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx} className="font-bold text-[#164A4A]">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const MemberAIAssistant = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
        pageContext: 'AI Fitness Coach Page',
        history: messages.map(m => ({ sender: m.sender, text: m.text }))
      });

      if (res.data.success && res.data.reply) {
        setMessages(prev => [...prev, {
          id: 'bot-' + Date.now(),
          sender: 'bot',
          text: res.data.reply,
          timestamp: formatTime(),
        }]);
      } else {
        throw new Error('Invalid response');
      }
    } catch (err) {
      console.error('MemberAIAssistant error', err);
      setMessages(prev => [...prev, {
        id: 'bot-err-' + Date.now(),
        sender: 'bot',
        text: "I couldn't reach the AI service right now. Please check your connection and try again.",
        timestamp: formatTime(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-9rem)] flex flex-col bg-white border border-[#D3DFDA] rounded-2xl overflow-hidden shadow-sm relative">
      {/* Header */}
      <div className="p-4 border-b border-[#D3DFDA] flex items-center justify-between bg-[#F8FAFC]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#164A4A] rounded-xl flex items-center justify-center text-white shadow-xs">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="font-bold text-[#202828] text-base flex items-center gap-1.5">
              AI Fitness Coach
              <Sparkles size={14} className="text-[#C6A77D]" />
            </h2>
            <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Context-Aware &middot; Real-time Gym Data
            </p>
          </div>
        </div>
        <span className="text-xs text-[#455250] bg-white border border-[#D3DFDA] px-3 py-1 rounded-full font-medium hidden sm:inline-block">
          Hello, {user?.firstName}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8FAFC]">
        {messages.length === 0 ? (
          <div className="max-w-lg mx-auto space-y-6 pt-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#164A4A]/10 text-[#164A4A] flex items-center justify-center mx-auto shadow-xs">
              <Bot size={32} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#202828]">Hi {user?.firstName}! How can I help you today?</h3>
              <p className="text-xs text-[#455250] mt-1">
                Ask about your booking status, next session time, assigned trainer, payment status, workout plan, or fitness guidance.
              </p>
            </div>

            <div className="text-left space-y-2">
              <p className="text-[11px] font-bold text-[#A8ADA9] uppercase tracking-wider px-1">Suggested Questions</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="text-left p-3 bg-white border border-[#D3DFDA] hover:border-[#164A4A] hover:bg-[#F1F5F3] text-xs font-semibold text-[#202828] rounded-xl transition-all shadow-2xs flex items-center justify-between group"
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
            <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-xl bg-[#164A4A] text-white flex items-center justify-center shrink-0 text-xs shadow-xs mt-0.5">
                  <Bot size={16} />
                </div>
              )}
              <div className={`max-w-[78%] space-y-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#164A4A] text-white rounded-tr-xs font-medium shadow-xs'
                    : 'bg-white text-[#202828] border border-[#D3DFDA] rounded-tl-xs shadow-2xs'
                }`}>
                  {renderFormattedText(msg.text)}
                </div>
                <span className={`text-[10px] text-[#A8ADA9] block px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </span>
              </div>
              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-[#D2B48C] text-[#202828] flex items-center justify-center shrink-0 font-bold text-xs shadow-xs mt-0.5">
                  {user?.firstName?.[0] || 'U'}
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-xl bg-[#164A4A] text-white flex items-center justify-center shrink-0 text-xs">
              <Bot size={16} />
            </div>
            <div className="bg-white border border-[#D3DFDA] p-3.5 rounded-2xl rounded-tl-xs text-xs text-[#455250] flex items-center gap-2 shadow-2xs">
              <Loader2 size={16} className="animate-spin text-[#164A4A]" />
              <span>Fetching your customer data and generating answer...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#D3DFDA] bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            disabled={loading}
            placeholder="Type your message or ask about your bookings, session, trainer..."
            className="flex-1 bg-[#F8FAFC] border border-[#D3DFDA] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#164A4A] text-[#202828]"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || loading}
            className="px-5 py-3 bg-[#164A4A] text-white rounded-xl hover:bg-[#C6A77D] transition-colors disabled:opacity-40 font-bold flex items-center gap-2 shadow-xs"
          >
            <Send size={16} />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberAIAssistant;
