import { MessageSquare } from 'lucide-react';

const MemberChat = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-[#111827] mb-6">Chat with Trainer</h1>
      {/* For now, reusing AI assistant layout as a placeholder for trainer chat */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[60vh] shadow-xl">
        <div className="w-20 h-20 bg-[#FFF7ED] rounded-full flex items-center justify-center mb-6">
          <MessageSquare size={40} className="text-[#EA580C]" />
        </div>
        <h2 className="text-2xl font-bold text-[#111827] mb-2">Trainer Messages</h2>
        <p className="text-[#64748B] max-w-md">
          Direct messaging with your assigned trainer will appear here. For immediate help, use the AI Assistant.
        </p>
      </div>
    </div>
  );
};

export default MemberChat;