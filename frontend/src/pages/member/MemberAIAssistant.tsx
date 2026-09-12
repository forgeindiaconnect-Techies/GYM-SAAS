import { Bot, Send, User } from 'lucide-react';

const MemberAIAssistant = () => {
  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl overflow-hidden relative">
      <div className="p-4 border-b border-[#CCFBF1] flex items-center gap-3 bg-[#FFFFFF]">
        <div className="w-10 h-10 bg-[#16A34A]/20 rounded-xl flex items-center justify-center text-[#16A34A]">
          <Bot size={24} />
        </div>
        <div>
          <h2 className="font-bold">AI Fitness Coach</h2>
          <p className="text-xs text-[#22C55E] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span> Online
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex gap-4 max-w-[80%]">
          <div className="w-8 h-8 rounded-full bg-[#16A34A]/20 flex shrink-0 items-center justify-center text-[#16A34A]">
            <Bot size={16} />
          </div>
          <div className="bg-[#E2E8F0] p-4 rounded-2xl rounded-tl-sm text-sm">
            Hi! I'm your AI Coach. I can help you generate workout plans, analyze your diet, or answer any fitness questions. How can I help you today?
          </div>
        </div>

        <div className="flex gap-4 max-w-[80%] ml-auto flex-row-reverse">
          <div className="w-8 h-8 rounded-full bg-[#FFFFFF] border border-[#16A34A] flex shrink-0 items-center justify-center text-[#16A34A]">
            <User size={16} />
          </div>
          <div className="bg-[#16A34A] text-white p-4 rounded-2xl rounded-tr-sm text-sm font-medium">
            Can you create a 3-day split for muscle gain?
          </div>
        </div>

        <div className="flex gap-4 max-w-[80%]">
          <div className="w-8 h-8 rounded-full bg-[#16A34A]/20 flex shrink-0 items-center justify-center text-[#16A34A]">
            <Bot size={16} />
          </div>
          <div className="bg-[#E2E8F0] p-4 rounded-2xl rounded-tl-sm text-sm space-y-2">
            <p>Absolutely! A push/pull/legs (PPL) split is great for muscle gain. Here is a basic structure:</p>
            <ul className="list-disc pl-4 text-[#475569] space-y-1 mt-2">
              <li><strong>Day 1 (Push):</strong> Chest, Shoulders, Triceps</li>
              <li><strong>Day 2 (Pull):</strong> Back, Biceps, Rear Delts</li>
              <li><strong>Day 3 (Legs):</strong> Quads, Hamstrings, Calves</li>
            </ul>
            <p>Would you like me to generate specific exercises and sets/reps for these days?</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[#CCFBF1] bg-[#FFFFFF]">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Type your message..." 
            className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-[#16A34A] transition-colors"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#16A34A] hover:bg-[#16A34A]/10 rounded-lg transition-colors">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberAIAssistant;