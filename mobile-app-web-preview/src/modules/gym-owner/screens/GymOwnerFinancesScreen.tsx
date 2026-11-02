import React, { useState } from 'react';
import { IndianRupee, ArrowDownLeft, ArrowUpRight, TrendingUp, Calendar, Download, CheckCircle2 } from 'lucide-react';
import { MobileCard } from '../../../shared/components/MobileCard';
import { MobileStatCard } from '../../../shared/components/MobileStatCard';
import { MobileButton } from '../../../shared/components/MobileButton';

export const GymOwnerFinancesScreen: React.FC = () => {
  const [period, setPeriod] = useState<'this_month' | 'last_month' | 'year'>('this_month');

  const transactions = [
    { id: 'TX-1092', user: 'Naveen Kumar', type: 'Member Subscription', amount: 18000, date: 'Today, 2:15 PM', status: 'Success', mode: 'UPI' },
    { id: 'TX-1091', user: 'Vikram Malhotra', type: 'Trainer Commission Payout', amount: -24500, date: 'Yesterday', status: 'Settled', mode: 'Bank Transfer' },
    { id: 'TX-1090', user: 'Priya Sharma', type: 'Member Renewal', amount: 6500, date: '28 Oct 2026', status: 'Success', mode: 'Credit Card' },
    { id: 'TX-1089', user: 'Rahul Varma', type: 'Platinum Pass', amount: 24000, date: '27 Oct 2026', status: 'Success', mode: 'UPI' },
    { id: 'TX-1088', user: 'Gymora Cloud SaaS', type: 'Platform Fee (Monthly)', amount: -4999, date: '25 Oct 2026', status: 'Settled', mode: 'Auto-Debit' }
  ];

  return (
    <div className="space-y-4 pb-6">
      {/* Revenue Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Total Net Revenue</span>
          <span className="flex items-center gap-1 text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4%
          </span>
        </div>
        <div className="mt-2 text-3xl font-extrabold tracking-tight flex items-baseline gap-1">
          <span className="text-xl font-normal text-slate-400">₹</span>
          <span>4,82,000</span>
        </div>
        <p className="text-[11px] text-slate-400 mt-1">October 2026 Accounting Period</p>

        {/* Breakdowns */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-700/60 text-xs">
          <div>
            <span className="text-slate-400 flex items-center gap-1">
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" /> Total Inflow:
            </span>
            <p className="text-sm font-bold text-emerald-400 mt-0.5">₹5,42,000</p>
          </div>
          <div>
            <span className="text-slate-400 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" /> Outflow / Payouts:
            </span>
            <p className="text-sm font-bold text-rose-400 mt-0.5">₹60,000</p>
          </div>
        </div>
      </div>

      {/* Period Selector Tabs */}
      <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl">
        {(['this_month', 'last_month', 'year'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
              period === p 
                ? 'bg-white text-slate-900 shadow-xs' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {p.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
          <button 
            onClick={() => alert('Exporting monthly statement PDF...')}
            className="text-xs text-orange-600 font-semibold flex items-center gap-1 hover:underline"
          >
            <Download className="w-3.5 h-3.5" /> Statement
          </button>
        </div>

        <div className="space-y-2">
          {transactions.map(t => (
            <MobileCard key={t.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                    t.amount > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {t.amount > 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{t.user}</h4>
                    <p className="text-[10px] text-slate-500">{t.type} • {t.mode}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-bold ${t.amount > 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {t.amount > 0 ? `+₹${t.amount.toLocaleString()}` : `-₹${Math.abs(t.amount).toLocaleString()}`}
                  </p>
                  <p className="text-[10px] text-slate-400">{t.date}</p>
                </div>
              </div>
            </MobileCard>
          ))}
        </div>
      </div>
    </div>
  );
};
export default GymOwnerFinancesScreen;

