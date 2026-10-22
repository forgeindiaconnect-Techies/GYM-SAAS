import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Bot, X, Send, Loader2, Sparkles, Minimize2, Maximize2, 
  ArrowRight, RotateCcw, Compass, Dumbbell, ShoppingBag, 
  CreditCard, ShieldAlert, CheckCircle2, ChevronRight, Layers, Tag, Building2, Users
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { 
  searchGymFeatures, 
  getRoleSuggestedQuestions, 
  type AssistantRouteItem 
} from '../utils/smartAssistantEngine';

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
  category?: string;
  matchedItems?: AssistantRouteItem[];
  liveItems?: LiveItem[];
  actions?: AssistantAction[];
  followUps?: string[];
  isRestricted?: boolean;
}

const PAGE_NAMES: Record<string, string> = {
  '/': 'Home / Landing Page',
  '/register/gym-owner': 'Gym Owner Registration Form',
  '/gym-owner-introduction': 'Gym Owner Introduction',
  '/register/customer': 'Customer Registration Form',
  '/subscription-plans': 'SaaS Subscription Plans & Pricing',
  '/gyms': 'Gym Marketplace',
  '/member/dashboard': 'Member Dashboard',
  '/member/my-gym': 'My Gym Profile',
  '/member/find-trainers': 'Find Trainers',
  '/member/trainer': 'My Trainer',
  '/member/book-session': 'Book Session',
  '/member/bookings': 'My Bookings',
  '/member/online-sessions': 'Online Sessions',
  '/member/workout': 'My Workout Plan',
  '/member/workout-videos': 'Workout Videos',
  '/member/diet': 'My Diet Plan',
  '/member/ai-assistant': 'AI Fitness Assistant',
  '/member/trainer-review': 'Trainer Feedback',
  '/member/session-review': 'Reviews & Ratings',
  '/member/progress': 'Progress Tracking',
  '/member/attendance': 'Attendance',
  '/member/subscription': 'Membership Subscription',
  '/member/upgrade': 'Upgrade Membership',
  '/member/payments': 'Payment History',
  '/member/chat': 'Messages',
  '/member/notifications': 'Notifications',
  '/member/store': 'Gym Store',
  '/member/store/cart': 'Shopping Cart',
  '/member/store/orders': 'My Orders',
  '/member/profile': 'Member Profile',
  '/trainer/dashboard': 'Trainer Dashboard',
  '/trainer/schedule': 'Trainer Schedule',
  '/trainer/workout-plans': 'Workout Plans',
  '/trainer/diet-plans': 'Diet Plans',
  '/trainer/earnings': 'Trainer Earnings',
  '/admin/dashboard': 'Gym Admin Dashboard',
  '/admin/equipment': 'Gym Equipment',
  '/admin/members': 'Gym Members',
  '/admin/trainers': 'Gym Trainers',
  '/admin/membership-plans': 'Membership Plans',
  '/admin/reports': 'Gym Reports',
  '/super-admin/dashboard': 'Super Admin Dashboard',
  '/super-admin/gym-approvals': 'Pending Gym Approvals',
  '/super-admin/subscriptions': 'SaaS Subscriptions'
};

const formatTime = () => {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Formats **bold** text and lists into clean JSX
const renderFormattedText = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const renderedLine = parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx} className="font-bold text-[#167D78]">{part.slice(2, -2)}</strong>;
      }
      return part;
    });

    const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-') || /^\d+\./.test(line.trim());

    return (
      <span key={lineIdx} className={`block ${lineIdx > 0 ? 'mt-1' : ''} ${isBullet ? 'pl-2 text-stone-700' : ''}`}>
        {renderedLine}
      </span>
    );
  });
};

const GymSmartAssistant = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const userRole = (user?.role || 'MEMBER').toUpperCase();
  const pageTitle = PAGE_NAMES[location.pathname] || 'Gym Management';
  const suggestedQuestions = getRoleSuggestedQuestions(userRole);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, loading]);

  const handleClearChat = () => {
    setMessages([]);
    setInputMessage('');
  };

  const handleNavigate = (route: string) => {
    if (!route) return;
    if (route.startsWith('tel:') || route.startsWith('mailto:') || route.startsWith('http')) {
      window.location.href = route;
      return;
    }
    navigate(route);
    // On mobile, collapse assistant to avoid blocking view
    if (window.innerWidth < 640) {
      setIsMinimized(true);
    }
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

    // 1. Perform Local Search & Intent Recognition (Zero External AI dependency)
    const localResult = searchGymFeatures(rawQuery, userRole);

    // 2. Fetch Live Database Enrichment (Products, Gym Plans, Real Account stats)
    let botReply = localResult.reply;
    let liveItems: LiveItem[] = [];
    let combinedActions = [...localResult.actions];
    let combinedFollowUps = [...localResult.followUps];
    let matchedCategory = localResult.category;

    try {
      const res = await api.post('/ai/member/chat', {
        message: rawQuery,
        pageContext: pageTitle
      });

      if (res.data?.success) {
        if (res.data.reply) {
          botReply = res.data.reply;
        }
        if (res.data.items && Array.isArray(res.data.items) && res.data.items.length > 0) {
          liveItems = res.data.items;
        }
        if (res.data.actions && Array.isArray(res.data.actions) && res.data.actions.length > 0) {
          // Merge unique actions
          const existingLabels = new Set(combinedActions.map(a => a.label));
          for (const a of res.data.actions) {
            if (!existingLabels.has(a.label)) {
              combinedActions.push(a);
            }
          }
        }
        if (res.data.followUps && Array.isArray(res.data.followUps) && res.data.followUps.length > 0) {
          combinedFollowUps = res.data.followUps;
        }
        if (res.data.category) {
          matchedCategory = res.data.category;
        }
      }
    } catch (apiErr) {
      // Local engine gracefully handles everything if API is offline or unauthenticated
      console.warn('[Smart Assistant] Backend enrichment note: running with local search engine.');
    }

    const botMsg: ChatMessage = {
      id: 'bot-' + Date.now(),
      sender: 'bot',
      text: botReply,
      timestamp: formatTime(),
      category: matchedCategory,
      matchedItems: localResult.matchedItems,
      liveItems: liveItems.length > 0 ? liveItems : undefined,
      actions: combinedActions.slice(0, 4),
      followUps: combinedFollowUps.slice(0, 4),
      isRestricted: localResult.isRestricted
    };

    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    } else if (e.key === 'Escape') {
      setIsMinimized(true);
    }
  };

  // Hide floating assistant trigger when user is already on the dedicated full-page AI Assistant
  if (location.pathname.startsWith('/member/ai-assistant')) {
    return null;
  }

  return (
    <>
      {/* ── Floating Action Trigger Button ── */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          className="fixed bottom-2 right-4 sm:bottom-2.5 sm:right-6 z-40 bg-gradient-to-r from-[#167D78] via-[#116660] to-[#167D78] text-white py-2 px-3 sm:py-2.5 sm:px-4 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 border-2 border-white/50 ring-4 ring-[#167D78]/20 group cursor-pointer"
          title="Open Gym Smart Assistant"
        >
          <div className="relative">
            <Bot size={20} className="group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-white animate-pulse" />
          </div>
          <span className="font-bold text-xs sm:text-sm hidden sm:inline-block pr-1 tracking-tight">Smart Assistant</span>
        </button>
      )}

      {/* ── Smart Assistant Window / Drawer ── */}
      {isOpen && (
        <div
          className={`fixed right-3 sm:right-6 z-50 bg-white rounded-3xl border border-[#D9E2E3] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized
              ? 'bottom-2 sm:bottom-2.5 w-72 sm:w-80 h-14'
              : 'bottom-2 sm:bottom-4 w-[94vw] sm:w-[440px] h-[580px] max-h-[88vh]'
          }`}
        >
          {/* Header Bar */}
          <div className="bg-[#1C1917] text-white px-4 sm:px-5 py-3.5 flex items-center justify-between shrink-0 shadow-md border-b border-stone-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-[#167D78] flex items-center justify-center text-[#344B4A] shrink-0 shadow-xs">
                <Bot size={18} />
              </div>
              <div className="truncate">
                <h3 className="font-bold text-sm tracking-tight leading-none text-white flex items-center gap-1.5">
                  Gym Smart Assistant
                  <Sparkles size={12} className="text-[#167D78]" />
                </h3>
                <p className="text-[10px] text-stone-400 flex items-center gap-1.5 mt-0.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  Instant Search &middot; {userRole}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {messages.length > 0 && !isMinimized && (
                <button
                  onClick={handleClearChat}
                  className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors text-xs flex items-center gap-1"
                  title="Start New Search"
                >
                  <RotateCcw size={14} />
                  <span className="hidden sm:inline text-[11px]">Clear</span>
                </button>
              )}
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors"
                title="Close"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Context Breadcrumb */}
              <div className="bg-[#E8EFF0] px-4 py-1.5 border-b border-[#D9E2E3] flex items-center justify-between text-[11px] text-[#697778] font-medium shrink-0">
                <span className="truncate flex items-center gap-1">
                  <Compass size={12} className="text-[#167D78] shrink-0" />
                  Screen: <strong className="text-stone-800 truncate">{pageTitle}</strong>
                </span>
                <span className="text-[#167D78] font-semibold shrink-0 ml-2">
                  {user?.firstName ? `Hi, ${user.firstName}` : 'Gym Guest'}
                </span>
              </div>

              {/* Chat Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#E8EFF0]">
                {messages.length === 0 ? (
                  <div className="space-y-4 pt-1">
                    {/* Welcome Card */}
                    <div className="bg-white border border-[#D9E2E3] rounded-2xl p-4 shadow-2xs text-center space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-[#167D78]/10 text-[#167D78] flex items-center justify-center mx-auto">
                        <Bot size={24} />
                      </div>
                      <h4 className="font-bold text-stone-800 text-sm">Welcome to Gym Smart Assistant! 👋</h4>
                      <p className="text-xs text-stone-600 leading-relaxed">
                        Search any feature, membership plan, personal trainer, workout routine, diet plan, equipment, or gym store product.
                      </p>
                    </div>

                    {/* Popular / Suggested Questions */}
                    <div>
                      <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2 px-1 flex items-center gap-1.5">
                        <Sparkles size={11} className="text-[#167D78]" />
                        Suggested Searches
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {suggestedQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(q)}
                            className="text-left px-3.5 py-2.5 bg-white border border-[#D9E2E3] hover:border-[#167D78] hover:bg-[#E8EFF0] text-xs font-semibold text-stone-800 rounded-xl transition-all flex items-center justify-between group shadow-2xs cursor-pointer"
                          >
                            <span className="truncate pr-2">{q}</span>
                            <ArrowRight size={13} className="text-[#167D78] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
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
                        <div className="w-7 h-7 rounded-xl bg-[#167D78] text-white flex items-center justify-center shrink-0 mt-0.5 text-xs shadow-2xs">
                          <Bot size={14} />
                        </div>
                      )}

                      <div className={`max-w-[88%] sm:max-w-[85%] space-y-2.5 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        {/* Text Message Bubble */}
                        <div
                          className={`p-3.5 rounded-2xl text-xs leading-relaxed whitespace-pre-wrap ${
                            msg.sender === 'user'
                              ? 'bg-[#167D78] text-white rounded-tr-xs shadow-sm font-medium'
                              : msg.isRestricted
                              ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-tl-xs shadow-2xs'
                              : 'bg-white text-stone-800 border border-[#D9E2E3] rounded-tl-xs shadow-2xs'
                          }`}
                        >
                          {msg.isRestricted && (
                            <div className="flex items-center gap-1.5 font-bold text-rose-700 mb-1.5 text-xs">
                              <ShieldAlert size={14} />
                              Access Restricted
                            </div>
                          )}
                          {renderFormattedText(msg.text)}
                        </div>

                        {/* Live Database Records / Products / Plans Cards (Prioritized) */}
                        {msg.sender === 'bot' && msg.liveItems && msg.liveItems.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block px-1 flex items-center gap-1">
                              {msg.category === 'STORE' ? (
                                <>
                                  <ShoppingBag size={11} className="text-[#167D78]" />
                                  Available in Store / Catalog
                                </>
                              ) : msg.category === 'ADMIN' ? (
                                <>
                                  <Building2 size={11} className="text-[#167D78]" />
                                  Registered Gym Owners & Facilities
                                </>
                              ) : msg.category === 'TRAINERS' ? (
                                <>
                                  <Dumbbell size={11} className="text-[#167D78]" />
                                  Featured Coaches & Trainers
                                </>
                              ) : msg.category === 'MEMBERS' ? (
                                <>
                                  <Users size={11} className="text-[#167D78]" />
                                  Customer & Member Records
                                </>
                              ) : (
                                <>
                                  <Layers size={11} className="text-[#167D78]" />
                                  Direct Records & Navigation
                                </>
                              )}
                            </span>
                            <div className="grid grid-cols-2 gap-1.5">
                              {msg.liveItems.map(live => (
                                <div
                                  key={live.id}
                                  onClick={() => handleNavigate(live.route || (msg.category === 'ADMIN' ? '/super-admin/gym-owners' : '/member/dashboard'))}
                                  className="p-2 bg-white border border-[#D9E2E3] hover:border-[#167D78] rounded-xl text-left cursor-pointer transition-all shadow-2xs group"
                                >
                                  {live.image ? (
                                    <div className="w-full h-16 rounded-lg bg-stone-50 overflow-hidden mb-1.5">
                                      <img src={live.image} alt={live.title} className="w-full h-full object-contain p-1" />
                                    </div>
                                  ) : (
                                    <div className="w-full h-10 rounded-lg bg-[#167D78]/10 text-[#167D78] flex items-center justify-center mb-1.5">
                                      {msg.category === 'ADMIN' ? (
                                        <Building2 size={16} />
                                      ) : msg.category === 'TRAINERS' ? (
                                        <Dumbbell size={16} />
                                      ) : msg.category === 'MEMBERS' ? (
                                        <Users size={16} />
                                      ) : (
                                        <Layers size={16} />
                                      )}
                                    </div>
                                  )}
                                  <h5 className="font-bold text-[11px] text-stone-800 truncate group-hover:text-[#167D78]">
                                    {live.title}
                                  </h5>
                                  <div className="flex items-center justify-between mt-1">
                                    {live.price !== undefined ? (
                                      <span className="font-extrabold text-xs text-[#167D78]">
                                        ₹{live.price}
                                      </span>
                                    ) : (
                                      <span className="text-[10px] text-stone-500 font-medium truncate max-w-[100px]">
                                        {live.subtitle || 'View Details'}
                                      </span>
                                    )}
                                    {live.tag && (
                                      <span className="text-[9px] text-[#167D78] bg-[#167D78]/10 px-1.5 py-0.5 rounded-full font-bold truncate max-w-[70px]">
                                        {live.tag}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Matched Feature Registry Cards (with Direct Route Actions) - only when liveItems is not already dominating */}
                        {msg.sender === 'bot' && (!msg.liveItems || msg.liveItems.length === 0) && msg.matchedItems && msg.matchedItems.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block px-1">
                              Matching Pages & Features
                            </span>
                            <div className="grid grid-cols-1 gap-1.5">
                              {msg.matchedItems.map(item => (
                                <div
                                  key={item.id}
                                  className="p-2.5 bg-white border border-[#D9E2E3] hover:border-[#167D78] rounded-xl transition-all shadow-2xs group flex items-center justify-between gap-2"
                                >
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-xs text-stone-800 truncate group-hover:text-[#167D78] transition-colors">
                                        {item.title}
                                      </span>
                                      {item.badge && (
                                        <span className="text-[9px] font-bold px-1.5 py-0.2 bg-[#167D78]/10 text-[#167D78] rounded-full shrink-0">
                                          {item.badge}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                                      {item.description}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleNavigate(item.route)}
                                    className="px-2.5 py-1.5 bg-[#167D78] hover:bg-[#116660] text-white text-[11px] font-bold rounded-lg transition-colors shrink-0 flex items-center gap-1 shadow-2xs cursor-pointer"
                                  >
                                    <span>{item.actionLabel}</span>
                                    <ChevronRight size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Direct Action Buttons */}
                        {msg.sender === 'bot' && msg.actions && msg.actions.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {msg.actions.map((act, actIdx) => (
                              <button
                                key={actIdx}
                                onClick={() => handleNavigate(act.route)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer ${
                                  act.variant === 'primary'
                                    ? 'bg-[#167D78] text-white hover:bg-[#116660]'
                                    : 'bg-white text-stone-800 border border-[#D9E2E3] hover:border-[#167D78] hover:bg-[#E8EFF0]'
                                }`}
                              >
                                <span>{act.label}</span>
                                <ArrowRight size={12} />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Follow-up Suggestions Chips */}
                        {msg.sender === 'bot' && msg.followUps && msg.followUps.length > 0 && (
                          <div className="pt-1.5">
                            <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block mb-1 px-1">
                              Related Topics:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {msg.followUps.map((fu, fIdx) => (
                                <button
                                  key={fIdx}
                                  onClick={() => handleSendMessage(fu)}
                                  className="text-[11px] px-2.5 py-1 bg-stone-100 hover:bg-[#167D78]/10 hover:text-[#167D78] text-stone-700 rounded-full font-medium transition-colors border border-stone-200 cursor-pointer"
                                >
                                  {fu}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <span className={`text-[10px] text-stone-400 block px-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  ))
                )}

                {/* Loading Indicator */}
                {loading && (
                  <div className="flex gap-2.5 items-start">
                    <div className="w-7 h-7 rounded-xl bg-[#167D78] text-white flex items-center justify-center shrink-0 text-xs">
                      <Bot size={14} />
                    </div>
                    <div className="bg-white border border-[#D9E2E3] p-3 rounded-2xl rounded-tl-xs shadow-2xs text-xs text-stone-600 flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-[#167D78]" />
                      <span>Searching gym knowledge & features...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Footer */}
              <div className="p-3 border-t border-[#D9E2E3] bg-white shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={loading}
                    placeholder="Ask anything about your gym..."
                    className="flex-1 px-4 py-2.5 bg-[#E8EFF0] border border-[#D9E2E3] rounded-xl text-xs focus:outline-none focus:border-[#167D78] text-stone-800 placeholder:text-stone-400"
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || loading}
                    className="p-2.5 bg-[#167D78] text-white rounded-xl hover:bg-[#116660] transition-colors disabled:opacity-40 disabled:hover:bg-[#167D78] shadow-xs cursor-pointer"
                    title="Send / Search"
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

export default GymSmartAssistant;
