import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Send, Search, ArrowLeft, Loader2, MessageSquare, RefreshCw } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

interface Contact {
  id: string;
  _id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  profilePhoto?: string;
  lastMsg?: string;
  lastMsgTime?: string | Date | null;
  unreadCount?: number;
  isActive?: boolean;
}

interface MessageItem {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const TrainerMessages = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetUserId = searchParams.get('userId');
  const { user: currentUser } = useAuth();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch contacts
  const fetchContacts = useCallback(async (autoSelectTarget = false) => {
    try {
      const res = await api.get('/direct-messages/contacts');
      if (res.data.success) {
        const fetchedContacts: Contact[] = res.data.contacts || [];
        setContacts(fetchedContacts);

        if (fetchedContacts.length > 0) {
          if (autoSelectTarget && targetUserId) {
            const match = fetchedContacts.find(c => c.id === targetUserId || c._id === targetUserId);
            if (match) {
              setSelectedContact(match);
              return;
            }
          }
          if (!selectedContact) {
            setSelectedContact(fetchedContacts[0]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  }, [targetUserId, selectedContact]);

  useEffect(() => {
    fetchContacts(true);
  }, [fetchContacts]);

  // 2. Fetch history for selected contact
  const fetchHistory = useCallback(async (contactId: string, quiet = false) => {
    if (!quiet) setLoadingMessages(true);
    try {
      const res = await api.get(`/direct-messages/history/${contactId}`);
      if (res.data.success) {
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      if (!quiet) setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchHistory(selectedContact.id);
    }
  }, [selectedContact, fetchHistory]);

  // 3. Polling every 3 seconds for active conversation
  useEffect(() => {
    if (!selectedContact) return;
    const interval = setInterval(() => {
      fetchHistory(selectedContact.id, true);
      fetchContacts(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedContact, fetchHistory, fetchContacts]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 4. Send Message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedContact || sending) return;

    const textToSend = messageText.trim();
    setMessageText('');
    setSending(true);

    try {
      const res = await api.post('/direct-messages/send', {
        receiverId: selectedContact.id,
        message: textToSend
      });

      if (res.data.success) {
        // Append message locally
        const newMsg: MessageItem = res.data.message;
        setMessages(prev => [...prev, newMsg]);

        // Update contacts list last message snippet
        setContacts(prev => prev.map(c => {
          if (c.id === selectedContact.id) {
            return { ...c, lastMsg: textToSend, lastMsgTime: new Date() };
          }
          return c;
        }));
      }
    } catch (err: any) {
      console.error('Failed to send message:', err);
      alert(err.response?.data?.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-7rem)] flex bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl overflow-hidden shadow-sm">
      {/* Sidebar Contacts */}
      <div className="w-80 border-r border-[#E7E5E4] bg-[#FFFFFF] flex flex-col hidden md:flex">
        <div className="p-4 border-b border-[#E7E5E4] flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients..."
              className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#F97316]"
            />
          </div>
          <button onClick={() => fetchContacts(false)} title="Refresh list" className="p-2 text-[#78716C] hover:text-[#F97316] hover:bg-[#FFFDF8] rounded-lg transition-colors">
            <RefreshCw size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#E7E5E4]/60">
          {loadingContacts ? (
            <div className="flex flex-col items-center justify-center p-8 text-[#78716C] gap-2">
              <Loader2 size={24} className="animate-spin text-[#F97316]" />
              <span className="text-xs font-medium">Loading conversations...</span>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-8 text-center text-sm text-[#78716C] flex flex-col items-center gap-2">
              <MessageSquare size={28} className="text-gray-300" />
              <span>No clients or messages found</span>
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const isSelected = selectedContact?.id === contact.id;
              return (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-4 flex items-center gap-3 cursor-pointer transition-all ${
                    isSelected ? 'bg-[#F97316]/10 border-l-4 border-l-[#F97316]' : 'hover:bg-[#FFFDF8]'
                  }`}
                >
                  <div className="relative shrink-0">
                    {contact.profilePhoto ? (
                      <img src={contact.profilePhoto} alt="" className="w-11 h-11 rounded-full object-cover border border-[#E7E5E4]" />
                    ) : (
                      <div className="w-11 h-11 bg-[#F97316]/15 rounded-full flex items-center justify-center font-bold text-[#F97316] text-base border border-[#E7E5E4]">
                        {contact.name[0] || 'C'}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-sm truncate text-[#292524]">{contact.name}</h4>
                      {contact.unreadCount && contact.unreadCount > 0 ? (
                        <span className="bg-[#F97316] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {contact.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-[#78716C] truncate mt-0.5">{contact.lastMsg}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative bg-[#FFFDF8]">
        {selectedContact ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-[#E7E5E4] bg-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-[#FFFDF8] rounded-full transition-colors md:hidden text-[#78716C]"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="w-10 h-10 bg-[#F97316]/15 rounded-full flex items-center justify-center font-bold text-[#F97316] border border-[#E7E5E4] shrink-0 overflow-hidden">
                  {selectedContact.profilePhoto ? (
                    <img src={selectedContact.profilePhoto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    selectedContact.name[0] || 'C'
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-[#292524] text-base">{selectedContact.name}</h3>
                  <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span> Client / Member
                  </p>
                </div>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMessages ? (
                <div className="flex flex-col items-center justify-center py-12 text-[#78716C] gap-2">
                  <Loader2 size={24} className="animate-spin text-[#F97316]" />
                  <span className="text-xs">Loading chat history...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-[#78716C] gap-2 text-center">
                  <MessageSquare size={36} className="text-gray-300" />
                  <p className="text-sm font-semibold text-[#292524]">No messages yet</p>
                  <p className="text-xs text-[#78716C]">Send a message to start conversation with {selectedContact.name}.</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.senderId?.toString() === currentUser?.id?.toString();
                  const timeFormatted = new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <div
                      key={msg._id}
                      className={`flex gap-2.5 max-w-[80%] ${isMine ? 'ml-auto flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center font-bold text-xs ${
                        isMine ? 'bg-[#F97316] text-white' : 'bg-[#FED7AA] text-[#292524]'
                      }`}>
                        {isMine ? (currentUser?.firstName?.charAt(0) || 'T') : (selectedContact.name[0] || 'C')}
                      </div>
                      <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                        <span className="text-[11px] font-bold text-[#78716C] mb-1 px-1">
                          {isMine
                            ? `You (${currentUser?.firstName || 'Trainer'} ${currentUser?.lastName || ''})`.trim()
                            : selectedContact.name}
                        </span>
                        <div className={`p-3.5 rounded-2xl text-sm shadow-xs ${
                          isMine
                            ? 'bg-[#F97316] text-white rounded-tr-none font-medium'
                            : 'bg-white border border-[#E7E5E4] text-[#292524] rounded-tl-none'
                        }`}>
                          <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                          <span className={`text-[10px] block mt-1 ${isMine ? 'text-white/80 text-right' : 'text-[#78716C]'}`}>
                            {timeFormatted}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Box */}
            <div className="p-4 border-t border-[#E7E5E4] bg-white">
              <form onSubmit={handleSend} className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder={`Message ${selectedContact.name}...`}
                  className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-[#F97316]"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim() || sending}
                  className="absolute right-2 p-2.5 bg-[#F97316] text-white rounded-lg hover:bg-[#EA580C] transition-colors disabled:opacity-50"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#78716C] gap-3">
            <MessageSquare size={48} className="text-gray-300" />
            <h3 className="text-lg font-bold text-[#292524]">Select a client to chat</h3>
            <p className="text-sm max-w-xs">
              Choose a customer from the sidebar to view message history and reply.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerMessages;