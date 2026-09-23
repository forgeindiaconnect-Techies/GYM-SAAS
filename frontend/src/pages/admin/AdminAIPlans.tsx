import { Bot } from 'lucide-react';

const AdminAIPlans = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bot className="text-[#34483F]" size={32} />
            AI Models & Usage
          </h1>
          <p className="text-[#4A514D] mt-2">Manage AI model parameters and token usage across the platform.</p>
        </div>
        <button className="px-6 py-2 bg-[#34483F] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-colors">
          Manage AI Models & Usage
        </button>
      </div>
      
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6">
          <h3 className="text-[#4A514D] text-sm mb-2">Total AI Generations (Today)</h3>
          <p className="text-4xl font-bold text-[#34483F]">12,492</p>
          <div className="w-full bg-[#E8E5DA] h-2 rounded-full mt-4">
            <div className="bg-[#34483F] h-2 rounded-full" style={{ width: '65%' }}></div>
          </div>
          <p className="text-xs text-[#4A514D] mt-2">65% of daily token limit</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4">Active Models</h3>
          <ul className="space-y-3">
            <li className="flex justify-between items-center"><span className="text-sm">Diet Generator (v2.1)</span><span className="text-green-500 text-xs">Healthy</span></li>
            <li className="flex justify-between items-center"><span className="text-sm">Workout Planner (v3.0)</span><span className="text-green-500 text-xs">Healthy</span></li>
            <li className="flex justify-between items-center"><span className="text-sm">Form Analysis CV</span><span className="text-yellow-500 text-xs">High Load</span></li>
          </ul>
        </div>
      </div>
    
    </div>
  );
};

export default AdminAIPlans;