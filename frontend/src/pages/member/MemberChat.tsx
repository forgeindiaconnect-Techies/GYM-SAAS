import { MessageSquare } from 'lucide-react';
import MemberAIAssistant from './MemberAIAssistant';

const MemberChat = () => {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Chat with Trainer</h1>
      {/* For now, reusing AI assistant layout as a placeholder for trainer chat */}
      <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[60vh]">
        <div className="w-20 h-20 bg-[#34483F]/10 rounded-full flex items-center justify-center mb-6">
          <MessageSquare size={40} className="text-[#34483F]" />
        </div>
        <h2 className="text-2xl font-bold text-[#202522] mb-2">Trainer Messages</h2>
        <p className="text-[#4A514D] max-w-md">
          Direct messaging with your assigned trainer will appear here. For immediate help, use the AI Assistant.
        </p>
      </div>
    </div>
  );
};

export default MemberChat;