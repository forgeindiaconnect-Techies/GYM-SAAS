import { useState } from 'react';
import { Send, Search } from 'lucide-react';

const defaultContacts = [
  { id: '1', name: 'Sarah Connor', lastMsg: "I'll do the new diet plan today as well!", online: true, active: true },
  { id: '2', name: 'John Doe', lastMsg: "Thanks coach!", online: false, active: false },
  { id: '3', name: 'Mike Tyson', lastMsg: "See you at 5 PM tomorrow", online: true, active: false },
  { id: '4', name: 'Jane Smith', lastMsg: "Can we reschedule Thursday's slot?", online: false, active: false },
];

const TrainerMessages = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContact, setSelectedContact] = useState(defaultContacts[0]);
  const [messageText, setMessageText] = useState('');

  const filteredContacts = defaultContacts.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl overflow-hidden">
      {/* Sidebar Contacts */}
      <div className="w-80 border-r border-[#DCD9CD] bg-[#FFFFFF] flex flex-col hidden md:flex">
        <div className="p-4 border-b border-[#DCD9CD]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A514D]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search clients..."
              className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-[#34483F]"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <div className="p-6 text-center text-sm text-[#A8ADA9]">No clients found</div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`p-4 flex items-center gap-3 cursor-pointer border-b border-[#DCD9CD] ${
                  selectedContact.id === contact.id ? 'bg-[#34483F]/10 border-l-4 border-l-[#34483F]' : 'hover:bg-[#F5F3EE]'
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-[#E8E5DA] rounded-full flex items-center justify-center font-bold text-[#202522]">
                    {contact.name[0]}
                  </div>
                  {contact.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#FFFFFF] rounded-full"></span>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-medium text-sm truncate text-[#202522]">{contact.name}</h4>
                  <p className="text-xs text-[#4A514D] truncate">{contact.lastMsg}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative">
        <div className="p-4 border-b border-[#DCD9CD] bg-[#FFFFFF] flex items-center gap-3">
          <div className="w-10 h-10 bg-[#E8E5DA] rounded-full flex items-center justify-center font-bold">S</div>
          <div>
            <h3 className="font-bold">Sarah Connor</h3>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="flex gap-4 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-[#E8E5DA] flex shrink-0 items-center justify-center font-bold text-xs">S</div>
            <div className="bg-[#E8E5DA] p-3 rounded-2xl rounded-tl-sm text-sm">
              Hey Coach! Just finished the workout plan you sent. The new leg exercises are brutal!
            </div>
          </div>
          
          <div className="flex gap-4 max-w-[80%] ml-auto flex-row-reverse">
            <div className="w-8 h-8 rounded-full bg-[#34483F] text-white flex shrink-0 items-center justify-center font-bold text-xs">T</div>
            <div className="bg-[#34483F] text-white p-3 rounded-2xl rounded-tr-sm text-sm font-medium">
              Great job Sarah! Make sure you stretch properly and get your protein in. We will check your form on Thursday.
            </div>
          </div>
          
          <div className="flex gap-4 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-[#E8E5DA] flex shrink-0 items-center justify-center font-bold text-xs">S</div>
            <div className="bg-[#E8E5DA] p-3 rounded-2xl rounded-tl-sm text-sm">
              Will do! I'll do the new diet plan today as well!
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#DCD9CD] bg-[#FFFFFF]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (messageText.trim()) setMessageText('');
            }}
            className="relative flex items-center"
          >
            <input 
              type="text" 
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..." 
              className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-[#34483F]"
            />
            <button type="submit" className="absolute right-2 p-2 text-[#34483F] hover:bg-[#34483F]/10 rounded-lg">
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TrainerMessages;