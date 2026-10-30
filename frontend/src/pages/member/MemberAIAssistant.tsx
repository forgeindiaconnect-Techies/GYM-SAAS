import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, Send, Loader2, Sparkles, ArrowRight, 
  RotateCcw, Compass, ChevronRight, ShoppingBag, Tag 
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { searchGymFeatures, getRoleSuggestedQuestions, type AssistantRouteItem } from '../../utils/smartAssistantEngine';

interface LiveItem {
  id: string;
  title: string;
  subtitle?: string;
  price?: number;
  tag?: string;
  route?: string;
  image?: string;
}

interface AssistantAction {
  label: string;
  route: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  matchedItems?: AssistantRouteItem[];
  liveItems?: LiveItem[];
  actions?: AssistantAction[];
  followUps?: string[];
  isRestricted?: boolean;
}

const formatTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const renderFormattedText = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const renderedLine = parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-bold text-[#B76E79]">{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || /^\d+\./.test(line.trim());

    return (
      <span key={lineIdx} className={`block ${lineIdx > 0 ? 'mt-1' : ''} ${isBullet ? 'pl-2 text-[#292524]' : ''}`}>
        {renderedLine}
      </span>
    );
  });
};

const MemberAIAssistant = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const userRole = (user?.role || 'MEMBER').toUpperCase();
  const suggestedQuestions = getRoleSuggestedQuestions(userRole);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleClearChat = () => {
    setMessages([]);
    setInputMessage('');
  };

  const handleSendMessage = async (textToSend?: string) => {
    const rawQuery = (textToSend || inputMessage).trim();
    if (!rawQuery || loading) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: rawQuery,
      timestamp: formatTime(),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    const localResult = searchGymFeatures(rawQuery, userRole);
    let botReply = localResult.reply;
    let liveItems: LiveItem[] = [];
    let combinedActions = [...localResult.actions];
    let combinedFollowUps = [...localResult.followUps];

    try {
      const res = await api.post('/ai/member/chat', {
        message: rawQuery,
        pageContext: 'Gym Smart Assistant Full Page'
      });

      if (res.data?.success) {
        if (res.data.reply) botReply = res.data.reply;
        if (res.data.items && Array.isArray(res.data.items)) liveItems = res.data.items;
        if (res.data.actions && Array.isArray(res.data.actions)) {
          const existingLabels = new Set(combinedActions.map(a => a.label));
          for (const a of res.data.actions) {
            if (!existingLabels.has(a.label)) combinedActions.push(a);
          }
        }
        if (res.data.followUps && Array.isArray(res.data.followUps)) {
          combinedFollowUps = res.data.followUps;
        }
      }
    } catch (e) {
      // Local engine fallback
    }

    const botMsg: ChatMessage = {
      id: 'bot-' + Date.now(),
      sender: 'bot',
      text: botReply,
      timestamp: formatTime(),
      matchedItems: localResult.matchedItems,
      liveItems: liveItems.length > 0 ? liveItems : undefined,
      actions: combinedActions.slice(0, 4),
      followUps: combinedFollowUps.slice(0, 4),
      isRestricted: localResult.isRestricted
    };

    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-9rem)] flex flex-col bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl overflow-hidden shadow-sm relative">
      {/* Header */}
      <div className="p-4 border-b border-[#E7DADD] flex items-center justify-between bg-[#FFFFFF] text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#B76E79] rounded-xl flex items-center justify-center text-[#292524] shadow-xs">
            <Bot size={22} />
          </div>
          <div>
            <h2 className="font-bold text-[#292524] text-base flex items-center gap-1.5">
              Gym Smart Assistant
              <Sparkles size={14} className="text-[#B76E79]" />
            </h2>
            <p className="text-xs text-[#57534E] font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#B76E79] animate-pulse" />
              Instant Search &middot; Real-time Gym Knowledge
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="px-3 py-1.5 bg-[#F3E8E8] hover:bg-[#FFFFFF] text-[#292524] text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Clear</span>
            </button>
          )}
          <span className="text-xs text-[#57534E] bg-[#F3E8E8] border border-[#E7DADD] px-3 py-1.5 rounded-full font-medium hidden sm:inline-block">
            {user?.firstName ? `Hi, ${user.firstName}` : 'Gym Member'}
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F3E8E8]">
        {messages.length === 0 ? (
          <div className="max-w-xl mx-auto space-y-6 pt-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#B76E79]/10 text-[#B76E79] flex items-center justify-center mx-auto shadow-xs">
              <Bot size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#292524]">Hi {user?.firstName || 'there'}! How can I assist you?</h3>
              <p className="text-xs text-[#57534E] mt-1 max-w-md mx-auto">
                Search anything about membership plans, personal trainers, workout routines, diet guidance, gym equipment, or gym store supplements.
              </p>
            </div>

            <div className="text-left space-y-2">
              <p className="text-[11px] font-bold text-[#57534E] uppercase tracking-wider px-1 flex items-center gap-1">
                <Compass size={12} className="text-[#B76E79]" />
                Suggested Inquiries
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="text-left p-3 bg-[#FFFFFF] border border-[#E7DADD] hover:border-[#B76E79] hover:bg-[#F3E8E8] text-xs font-semibold text-[#292524] rounded-xl transition-all shadow-2xs flex items-center justify-between group cursor-pointer"
                  >
                    <span className="truncate pr-2">{q}</span>
                    <ArrowRight size={13} className="text-[#B76E79] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.sender === 'bot' && (
                <div className="w-8 h-8 rounded-xl bg-[#B76E79] text-white font-bold flex items-center justify-center shrink-0 text-xs shadow-xs mt-0.5">
                  <Bot size={16} />
                </div>
              )}
              <div className={`max-w-[82%] space-y-2.5 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                {/* Bubble */}
                <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#B76E79] text-white rounded-tr-xs font-medium shadow-xs'
                    : msg.isRestricted
                    ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-tl-xs shadow-2xs'
                    : 'bg-[#FFFFFF] text-[#292524] border border-[#E7DADD] rounded-tl-xs shadow-2xs'
                }`}>
                  {renderFormattedText(msg.text)}
                </div>

                {/* Matched Feature Cards */}
                {msg.sender === 'bot' && msg.matchedItems && msg.matchedItems.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-[#57534E] uppercase tracking-wider block px-1">
                      Matching Gym Pages
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.matchedItems.map(item => (
                        <div
                          key={item.id}
                          className="p-3 bg-[#FFFFFF] border border-[#E7DADD] hover:border-[#B76E79] rounded-xl transition-all shadow-2xs group flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <h5 className="font-bold text-xs text-[#292524] group-hover:text-[#B76E79] truncate">
                                {item.title}
                              </h5>
                              {item.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#B76E79]/10 text-[#B76E79] rounded-full shrink-0">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#57534E] line-clamp-2 mt-1">
                              {item.description}
                            </p>
                          </div>
                          <button
                            onClick={() => navigate(item.route)}
                            className="mt-2.5 px-3 py-1.5 bg-[#B76E79] hover:bg-[#9F5965] text-white font-bold text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer w-full"
                          >
                            <span>{item.actionLabel}</span>
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Live Items */}
                {msg.sender === 'bot' && msg.liveItems && msg.liveItems.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-[#57534E] uppercase tracking-wider block px-1 flex items-center gap-1">
                      <ShoppingBag size={11} className="text-[#B76E79]" />
                      Products & Plans
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      {msg.liveItems.map(live => (
                        <div
                          key={live.id}
                          onClick={() => navigate(live.route || '/member/store')}
                          className="p-2.5 bg-[#FFFFFF] border border-[#E7DADD] hover:border-[#B76E79] rounded-xl text-left cursor-pointer transition-all shadow-2xs group"
                        >
                          {live.image ? (
                            <div className="w-full h-20 rounded-lg bg-[#F3E8E8] overflow-hidden mb-1.5">
                              <img src={live.image} alt={live.title} className="w-full h-full object-contain p-1" />
                            </div>
                          ) : (
                            <div className="w-full h-14 rounded-lg bg-[#B76E79]/5 text-[#B76E79] flex items-center justify-center mb-1.5">
                              <Tag size={18} />
                            </div>
                          )}
                          <h6 className="font-bold text-xs text-[#292524] truncate group-hover:text-[#B76E79]">
                            {live.title}
                          </h6>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-extrabold text-xs text-[#B76E79]">
                              ₹{live.price}
                            </span>
                            {live.tag && (
                              <span className="text-[9px] text-[#57534E] truncate max-w-[80px]">
                                {live.tag}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Follow Ups */}
                {msg.sender === 'bot' && msg.followUps && msg.followUps.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[10px] text-[#57534E] font-semibold uppercase tracking-wider block mb-1 px-1">
                      Suggested Follow-ups:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.followUps.map((fu, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => handleSendMessage(fu)}
                          className="text-xs px-3 py-1 bg-[#F3E8E8] hover:bg-[#B76E79]/10 hover:text-[#B76E79] text-[#292524] rounded-full font-medium transition-colors border border-[#E7DADD] cursor-pointer"
                        >
                          {fu}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <span className={`text-[10px] text-[#57534E] block px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-xl bg-[#B76E79] text-white font-bold flex items-center justify-center shrink-0 text-xs">
              <Bot size={16} />
            </div>
            <div className="bg-[#FFFFFF] border border-[#E7DADD] p-3.5 rounded-2xl rounded-tl-xs text-xs text-[#57534E] flex items-center gap-2 shadow-2xs">
              <Loader2 size={16} className="animate-spin text-[#B76E79]" />
              <span>Searching gym features and verified knowledge...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#E7DADD] bg-[#FFFFFF]">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            disabled={loading}
            placeholder="Ask anything about your gym..."
            className="flex-1 bg-[#F3E8E8] border border-[#E7DADD] rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-[#B76E79] text-[#292524] placeholder:text-[#57534E]"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || loading}
            className="px-5 py-3 bg-[#B76E79] text-white font-bold rounded-xl hover:bg-[#9F5965] transition-colors disabled:opacity-40 font-bold flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Send size={16} />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberAIAssistant;
