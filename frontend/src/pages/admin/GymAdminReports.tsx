import { useState } from 'react';
import { BarChart3, TrendingUp, Users, UserMinus, Download, Filter } from 'lucide-react';

const GymAdminReports = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Analytics & Reports</h1>
          <p className="text-[#475569] mt-1">Deep insights into your gym's performance and member retention.</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] font-bold rounded-xl hover:bg-[#FFFFFF] transition-colors flex items-center gap-2">
            <Filter size={18} /> Last 30 Days
          </button>
          <button className="px-4 py-2 bg-[#16A34A] text-[#1E293B] font-bold rounded-xl hover:bg-[#15803D] transition-colors flex items-center gap-2 shadow-lg shadow-[#16A34A]/20">
            <Download size={18} /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 hover:border-[#16A34A]/30 transition-colors">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-xl flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <p className="text-[#475569] font-medium mb-1">Total Members</p>
          <h3 className="text-3xl font-bold text-[#1E293B]">1,248</h3>
          <p className="text-green-500 text-sm font-bold mt-2 flex items-center">
            <TrendingUp size={16} className="mr-1" /> +4.2% vs last month
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 hover:border-[#16A34A]/30 transition-colors">
          <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center mb-4">
            <BarChart3 size={24} />
          </div>
          <p className="text-[#475569] font-medium mb-1">Retention Rate</p>
          <h3 className="text-3xl font-bold text-[#1E293B]">89.4%</h3>
          <p className="text-green-500 text-sm font-bold mt-2 flex items-center">
            <TrendingUp size={16} className="mr-1" /> +1.1% vs last month
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 hover:border-[#16A34A]/30 transition-colors">
          <div className="w-12 h-12 bg-[#0D9488]/10 text-[#0D9488] rounded-xl flex items-center justify-center mb-4">
            <UserMinus size={24} />
          </div>
          <p className="text-[#475569] font-medium mb-1">Churn Rate</p>
          <h3 className="text-3xl font-bold text-[#1E293B]">2.8%</h3>
          <p className="text-[#475569] text-sm font-bold mt-2 flex items-center">
            -0.4% vs last month
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6 hover:border-[#16A34A]/30 transition-colors">
          <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp size={24} />
          </div>
          <p className="text-[#475569] font-medium mb-1">Avg. Lifetime Value</p>
          <h3 className="text-3xl font-bold text-[#1E293B]">$485.00</h3>
          <p className="text-green-500 text-sm font-bold mt-2 flex items-center">
            <TrendingUp size={16} className="mr-1" /> +$12.00 vs last month
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[#1E293B] mb-6 border-b border-[#CCFBF1] pb-2">Membership Growth</h3>
          <div className="h-64 flex items-end justify-between space-x-2 pt-4">
            {[40, 45, 55, 50, 65, 75, 80, 85, 90, 85, 95, 100].map((val, idx) => (
              <div key={idx} className="w-full bg-[#FFFFFF] hover:bg-blue-500 rounded-t-sm transition-colors relative group" style={{ height: `${val}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-[#1E293B] text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100">{val * 10}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-[#475569]">
            <span>Jan</span><span>Mar</span><span>Jun</span><span>Sep</span><span>Dec</span>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[#1E293B] mb-6 border-b border-[#CCFBF1] pb-2">Revenue by Plan Type</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2"><span className="text-[#1E293B]">Pro Tier</span><span className="font-bold text-[#16A34A]">55%</span></div>
              <div className="w-full bg-[#FFFFFF] rounded-full h-3"><div className="bg-[#16A34A] h-3 rounded-full" style={{width: '55%'}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2"><span className="text-[#1E293B]">Basic Tier</span><span className="font-bold text-blue-500">30%</span></div>
              <div className="w-full bg-[#FFFFFF] rounded-full h-3"><div className="bg-blue-500 h-3 rounded-full" style={{width: '30%'}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2"><span className="text-[#1E293B]">Elite Tier</span><span className="font-bold text-purple-500">15%</span></div>
              <div className="w-full bg-[#FFFFFF] rounded-full h-3"><div className="bg-purple-500 h-3 rounded-full" style={{width: '15%'}}></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymAdminReports;
