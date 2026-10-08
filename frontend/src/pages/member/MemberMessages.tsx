import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Send, Loader2, MessageSquare, RefreshCw, Dumbbell } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import MemberTrainingTabs from '../../components/Member/MemberTrainingTabs';

interface Contact {
  id: string;
  _id: string;
  name: string;
  email?: string;
  role?: string;
  specialization?: string;
  profilePhoto?: string;
  lastMsg?: string;
  lastMsgTime?: string | Date | null;
  unreadCount?: number;
}

interface MessageItem {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const MemberMessages = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetTrainerId = searchParams.get('trainerId');
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

  // 1. Fetch contacts (Trainers)
  const fetchContacts = useCallback(async (autoSelectTarget = false) => {
    try {
      const res = await api.get('/direct-messages/contacts');
      if (res.data.success) {
        const fetchedContacts: Contact[] = res.data.contacts || [];
        setContacts(fetchedContacts);

        if (fetchedContacts.length > 0) {
          if (autoSelectTarget && targetTrainerId) {
            const match = fetchedContacts.find(c => c.id === targetTrainerId || c._id === targetTrainerId);
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
  }, [targetTrainerId, selectedContact]);

  useEffect(() => {
    fetchContacts(true);
  }, [fetchContacts]);

  // 2. Fetch history for selected trainer
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

  // 3. Polling every 3 seconds
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

  // 4. Send message to trainer
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
        const newMsg: MessageItem = res.data.message;
        setMessages(prev => [...prev, newMsg]);

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
    (c.specialization && c.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <MemberTrainingTabs />

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Trainer Messages</h1>
          <p className="text-[#78716C] text-sm mt-1">Direct 2-way real-time communication with your assigned &amp; gym trainers.</p>
        </div>
      </div>

      <div className="h-[calc(100vh-12rem)] bg-white border border-[#E7E5E4] rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Contacts Panel */}
        <div className="w-full md:w-80 border-r border-[#E7E5E4] flex flex-col bg-white">
          <div className="p-3.5 border-b border-[#E7E5E4] flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" size={16} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trainers..." 
                className="w-full pl-9 pr-3 py-2 bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl text-sm focus:border-[#F97316] outline-none"
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
                <span className="text-xs">Loading trainers...</span>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#78716C] flex flex-col items-center gap-2">
                <Dumbbell size={28} className="text-gray-300" />
                <span>No trainers found</span>
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = selectedContact?.id === contact.id;
                return (
                  <div 
                    key={contact.id} 
                    onClick={() => setSelectedContact(contact)}
                    className={`flex items-center p-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#F97316]/10 border-l-4 border-l-[#F97316]' : 'hover:bg-[#FFFDF8]'
                    }`}
                  >
                    <div className="relative shrink-0">
                      {contact.profilePhoto ? (
                        <img src={contact.profilePhoto} alt={contact.name} className="w-11 h-11 rounded-full object-cover border border-[#E7E5E4]" />
                      ) : (
                        <div className="w-11 h-11 bg-[#F97316]/15 rounded-full flex items-center justify-center font-bold text-[#F97316] text-base border border-[#E7E5E4]">
                          {contact.name[0] || 'T'}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-bold text-[#292524] text-sm truncate">{contact.name}</h4>
                        {contact.unreadCount && contact.unreadCount > 0 ? (
                          <span className="bg-[#F97316] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {contact.unreadCount}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-[#78716C] truncate mt-0.5">
                        {contact.specialization ? `${contact.specialization} · ` : ''}{contact.lastMsg}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Chat Area */}
        <div className="flex-1 flex flex-col bg-[#FFFDF8]">
          {selectedContact ? (
            <>
              {/* Header */}
              <div className="p-4 bg-white border-b border-[#E7E5E4] flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#F97316]/15 rounded-full flex items-center justify-center font-bold text-[#F97316] border border-[#E7E5E4] shrink-0 overflow-hidden">
                    {selectedContact.profilePhoto ? (
                      <img src={selectedContact.profilePhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      selectedContact.name[0] || 'T'
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#292524]">{selectedContact.name}</h3>
                    <p className="text-xs text-[#F97316] font-medium">
                      {selectedContact.specialization || 'Personal Trainer'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
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
                    <p className="text-xs text-[#78716C]">Ask {selectedContact.name} anything about your workout, diet, or schedule.</p>
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
                          {isMine ? (currentUser?.firstName?.charAt(0) || 'M') : (selectedContact.name[0] || 'T')}
                        </div>
                        <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                          <span className="text-[11px] font-bold text-[#78716C] mb-1 px-1">
                            {isMine
                              ? `You (${currentUser?.firstName || 'Customer'} ${currentUser?.lastName || ''})`.trim()
                              : `${selectedContact.name} (Trainer)`}
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

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-[#E7E5E4]">
                <form onSubmit={handleSend} className="relative flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Message ${selectedContact.name}...`}
                    className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl pl-4 pr-12 py-3 text-sm focus:border-[#F97316] outline-none"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
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
              <h3 className="text-lg font-bold text-[#292524]">Select a trainer to message</h3>
              <p className="text-sm max-w-xs">
                Pick a trainer from the list on the left to start a conversation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberMessages;
