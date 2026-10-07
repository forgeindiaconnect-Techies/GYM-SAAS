import { useState } from 'react';
import { Search, Send, Phone, Video, MoreVertical, Image as ImageIcon, Paperclip } from 'lucide-react';

const MemberMessages = () => {
  const [message, setMessage] = useState('');

  const contacts = [
    { id: 1, name: 'Alex Johnson', role: 'Personal Trainer', avatar: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=150&q=80', active: true, unread: 2, lastMsg: 'See you tomorrow at 5!' },
    { id: 2, name: 'Gym Support', role: 'Admin', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80', active: false, unread: 0, lastMsg: 'Your membership is renewed.' },
    { id: 3, name: 'Sarah Williams', role: 'Yoga Instructor', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80', active: true, unread: 0, lastMsg: 'Great session today!' },
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Messages</h1>
        <p className="text-[#78716C] mt-1">Connect with your trainers and gym staff.</p>
      </div>

      <div className="flex-1 bg-white border border-[#FED7AA] rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-0">
        
        {/* Left Sidebar - Contacts List */}
        <div className="w-full md:w-80 border-r border-[#FED7AA] flex flex-col">
          <div className="p-4 border-b border-[#FED7AA]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" size={18} />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full pl-10 pr-4 py-2 bg-[#FFFDF8] border border-[#FED7AA] rounded-xl text-sm focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] outline-none transition-all"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {contacts.map((contact, idx) => (
              <div 
                key={contact.id} 
                className={`flex items-center p-4 cursor-pointer transition-colors border-b border-[#FED7AA]/50 ${
                  idx === 0 ? 'bg-green-50/50' : 'hover:bg-[#FFFDF8]'
                }`}
              >
                <div className="relative">
                  <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full object-cover border border-[#FED7AA]" />
                  {contact.active && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="ml-3 flex-1 overflow-hidden">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-bold text-[#292524] truncate">{contact.name}</h4>
                    <span className="text-xs text-[#78716C]">10:42 AM</span>
                  </div>
                  <p className={`text-sm truncate ${contact.unread > 0 ? 'text-[#292524] font-semibold' : 'text-[#78716C]'}`}>
                    {contact.lastMsg}
                  </p>
                </div>
                {contact.unread > 0 && (
                  <div className="ml-2 w-5 h-5 bg-[#F97316] text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {contact.unread}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Area - Chat Window */}
        <div className="flex-1 flex flex-col bg-[#FFFDF8]">
          {/* Chat Header */}
          <div className="p-4 bg-white border-b border-[#FED7AA] flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img src={contacts[0].avatar} alt="Current chat" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <h3 className="font-bold text-[#292524]">{contacts[0].name}</h3>
                <p className="text-xs text-[#F97316] font-medium">Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-[#78716C]">
              <button className="hover:text-[#F97316] transition-colors"><Phone size={20} /></button>
              <button className="hover:text-[#F97316] transition-colors"><Video size={20} /></button>
              <button className="hover:text-[#292524] transition-colors"><MoreVertical size={20} /></button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="flex justify-center">
              <span className="bg-[#FED7AA] text-[#78716C] text-xs font-semibold px-3 py-1 rounded-full">Today</span>
            </div>
            
            {/* Received Message */}
            <div className="flex items-end space-x-2">
              <img src={contacts[0].avatar} alt="" className="w-8 h-8 rounded-full mb-1" />
              <div className="bg-white border border-[#FED7AA] text-[#292524] p-3 rounded-2xl rounded-bl-sm max-w-[70%] shadow-sm">
                <p className="text-sm">Hey! Are we still on for the 5 PM session today? We're going to focus on upper body strength.</p>
                <span className="text-[10px] text-[#78716C] block mt-1">10:40 AM</span>
              </div>
            </div>
            
            {/* Sent Message */}
            <div className="flex items-end justify-end space-x-2">
              <div className="bg-[#F97316] text-white p-3 rounded-2xl rounded-br-sm max-w-[70%] shadow-sm shadow-orange-500/10">
                <p className="text-sm">Yes, absolutely! See you tomorrow at 5!</p>
                <span className="text-[10px] text-green-200 block mt-1 text-right">10:42 AM • Read</span>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-white border-t border-[#FED7AA]">
            <div className="flex items-center space-x-2">
              <button className="p-2 text-[#78716C] hover:text-[#F97316] transition-colors rounded-full hover:bg-gray-50">
                <Paperclip size={20} />
              </button>
              <button className="p-2 text-[#78716C] hover:text-[#F97316] transition-colors rounded-full hover:bg-gray-50 hidden sm:block">
                <ImageIcon size={20} />
              </button>
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 bg-[#FFFDF8] border border-[#FED7AA] rounded-full px-4 py-2.5 text-sm focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] outline-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button className="p-3 bg-[#F97316] text-white rounded-full hover:bg-[#EA580C] transition-colors shadow-md shadow-orange-500/20">
                <Send size={18} className="ml-0.5" />
              </button>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default MemberMessages;
