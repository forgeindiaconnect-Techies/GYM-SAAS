import React, { useState } from 'react';
import { IndianRupee, TrendingUp, Calendar, ArrowUpRight, CheckCircle2, Wallet, Award } from 'lucide-react';
import { MobileCard } from '../../../shared/components/MobileCard';
import { MobileButton } from '../../../shared/components/MobileButton';

export const TrainerEarningsScreen: React.FC = () => {
  const [withdrawn, setWithdrawn] = useState(false);

  const earningsHistory = [
    { id: 'PAY-892', client: 'Naveen Kumar', package: '12 Personal Training Sessions', amount: 9600, date: 'Today', status: 'Credited' },
    { id: 'PAY-891', client: 'Priya Sharma', package: '8 Sessions (Fat Loss Track)', amount: 6400, date: 'Yesterday', status: 'Credited' },
    { id: 'PAY-890', client: 'Rahul Varma', package: '15 Sessions (Strength VIP)', amount: 12000, date: '28 Oct 2026', status: 'Credited' },
    { id: 'PAY-889', client: 'Monthly Retainer Bonus', package: 'Top Performance Milestone', amount: 5000, date: '25 Oct 2026', status: 'Credited' },
    { id: 'PAY-888', client: 'Vikram Singh', package: '6 Rehab Sessions', amount: 4800, date: '22 Oct 2026', status: 'Credited' }
  ];

  return (
    <div className="space-y-4 pb-6">
      {/* Wallet Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-lg border border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-orange-500" /> Available for Withdrawal
          </span>
          <span className="text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full">
            +30% Split Active
          </span>
        </div>
        <div className="mt-2 text-3xl font-extrabold flex items-baseline gap-1">
          <span className="text-xl font-normal text-slate-400">₹</span>
          <span>37,800</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">Total earned this month: ₹64,200</p>

        <div className="mt-4 pt-3 border-t border-slate-700/60">
          <button 
            disabled={withdrawn}
            onClick={() => {
              setWithdrawn(true);
              alert('Withdrawal request of ₹37,800 submitted to Gym Owner!');
            }}
            className="w-full py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/30 active:scale-98 transition-all disabled:opacity-50"
          >
            {withdrawn ? 'Withdrawal Pending Approval' : 'Withdraw to Bank Account'}
          </button>
        </div>
      </div>

      {/* Commission Breakdown */}
      <MobileCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-900">Commission Structure</h3>
          <span className="text-[10px] bg-orange-50 text-orange-600 font-bold px-2 py-0.5 rounded-full">Level 3 Master</span>
        </div>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">1-on-1 PT Session</span>
            <span className="font-bold text-slate-800">₹800 / hr (Trainer gets 70%)</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Group Class (per attendee)</span>
            <span className="font-bold text-slate-800">₹250 / member</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-slate-500">Milestone Bonus (&gt;40 hrs)</span>
            <span className="font-bold text-emerald-600">+₹5,000 / month</span>
          </div>
        </div>
      </MobileCard>

      {/* Payout History */}
      <div>
        <h3 className="text-xs font-bold text-slate-900 mb-2">Session Commission Log</h3>
        <div className="space-y-2">
          {earningsHistory.map(e => (
            <MobileCard key={e.id} className="p-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{e.client}</h4>
                  <p className="text-[10px] text-slate-500">{e.package}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-600">+₹{e.amount.toLocaleString()}</span>
                  <p className="text-[10px] text-slate-400">{e.date}</p>
                </div>
              </div>
            </MobileCard>
          ))}
        </div>
      </div>
    </div>
  );
};
export default TrainerEarningsScreen;

