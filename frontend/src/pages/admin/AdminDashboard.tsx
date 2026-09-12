import { LayoutDashboard } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <LayoutDashboard className="text-[#16A34A]" size={32} />
            Dashboard Overview
          </h1>
          <p className="text-[#475569] mt-2">High-level view of your gym platform operations.</p>
        </div>
        <button className="px-6 py-2 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors">
          Manage Dashboard Overview
        </button>
      </div>
      
      
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-5">
           <p className="text-[#475569] text-sm">Total Active Users</p>
           <p className="text-3xl font-bold text-[#1E293B] mt-1">1,248</p>
           <p className="text-green-500 text-xs mt-2">+12% this month</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-5">
           <p className="text-[#475569] text-sm">Monthly Revenue</p>
           <p className="text-3xl font-bold text-[#1E293B] mt-1">$48,290</p>
           <p className="text-green-500 text-xs mt-2">+5.4% this month</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-5">
           <p className="text-[#475569] text-sm">Active Trainers</p>
           <p className="text-3xl font-bold text-[#1E293B] mt-1">42</p>
           <p className="text-green-500 text-xs mt-2">+3 new this week</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-5">
           <p className="text-[#475569] text-sm">AI Sessions Today</p>
           <p className="text-3xl font-bold text-[#1E293B] mt-1">3,492</p>
           <p className="text-green-500 text-xs mt-2">+18% vs yesterday</p>
        </div>
      </div>
      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl overflow-hidden p-6">
         <h2 className="text-lg font-bold mb-4">Platform Activity Map</h2>
         <div className="h-64 bg-[#FFFFFF] rounded-xl flex items-center justify-center border border-[#CCFBF1]">
           <p className="text-[#475569]">Interactive Chart Component Placeholder</p>
         </div>
      </div>
    
    </div>
  );
};

export default AdminDashboard;