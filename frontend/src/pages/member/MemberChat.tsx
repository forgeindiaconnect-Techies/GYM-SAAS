import { MessageSquare } from 'lucide-react';

const MemberChat = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Chat with Trainer</h1>
      {/* For now, reusing AI assistant layout as a placeholder for trainer chat */}
      <div className="bg-[#FFFFFF] border border-[#292940] rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[60vh]">
        <div className="w-20 h-20 bg-[#6366F1]/10 rounded-full flex items-center justify-center mb-6">
          <MessageSquare size={40} className="text-[#6366F1]" />
        </div>
        <h2 className="text-2xl font-bold text-[#11111F] mb-2">Trainer Messages</h2>
        <p className="text-[#A1A1AA] max-w-md">
          Direct messaging with your assigned trainer will appear here. For immediate help, use the AI Assistant.
        </p>
      </div>
    </div>
  );
};

export default MemberChat;