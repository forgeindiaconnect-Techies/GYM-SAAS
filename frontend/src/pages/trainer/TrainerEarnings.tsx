import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, IndianRupee, CheckCircle, ArrowDownRight, ArrowDownLeft } from 'lucide-react';
import api from '../../utils/api';

const TrainerEarnings = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchEarnings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/trainer-payments/my-earnings');
      setData(res.data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEarnings(); }, [fetchEarnings]);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-10 h-10 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const fee = data?.currentFee;
  const cycleSuffix = (cycle: string) => {
    const m: Record<string, string> = { 'Per Session': '/ Session', 'Weekly': '/ Week', 'Monthly': '/ Month', 'Custom': '' };
    return m[cycle] || '';
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#292524]">Earnings &amp; Balance</h1>
        <p className="text-[#78716C] text-sm mt-1">Your earnings overview and payment status</p>
      </div>

      {fee ? (
        /* Flowchart zigzag layout */
        <div className="relative flex flex-col items-center gap-0">

          {/* ── Step 1: LEFT ── */}
          <div className="w-full flex justify-start">
            <div className="w-[55%] bg-white border-2 border-[#F97316]/30 rounded-2xl p-6 shadow-md relative">
              {/* Step badge */}
              <span className="absolute -top-3 -left-3 w-8 h-8 bg-[#F97316] text-white text-xs font-bold rounded-full flex items-center justify-center shadow">1</span>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-[#F97316]/10 flex items-center justify-center">
                  <IndianRupee size={18} className="text-[#F97316]" />
                </div>
                <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Current Fee (Net Payable)</p>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-3xl font-bold text-[#292524]">₹{(fee.netAmount || fee.feeAmount)?.toLocaleString('en-IN')}</span>
                <span className="text-[#78716C] text-sm mb-0.5">{cycleSuffix(fee.billingCycle)}</span>
              </div>
              <p className="text-xs text-[#78716C] mt-1.5">{fee.trainingType}</p>
            </div>
          </div>

          {/* Arrow 1 → 2 (right-pointing down-right) */}
          <div className="w-full flex justify-center items-center py-2 relative h-14">
            {/* Line */}
            <div className="absolute left-[27%] top-0 h-full w-px bg-[#F97316]/20 border-l-2 border-dashed border-[#F97316]/30" />
            <div className="absolute left-[27%] bottom-0 w-[46%] h-px border-b-2 border-dashed border-[#F97316]/30" />
            <div className="absolute right-[27%] bottom-0 h-1/2 w-px border-l-2 border-dashed border-[#F97316]/30" />
            {/* Arrow icon */}
            <div className="absolute right-[24%] bottom-1 bg-[#F97316]/10 rounded-full p-1">
              <ArrowDownRight size={16} className="text-[#F97316]" />
            </div>
          </div>

          {/* ── Step 2: RIGHT ── */}
          <div className="w-full flex justify-end">
            <div className="w-[55%] bg-white border-2 border-green-500/30 rounded-2xl p-6 shadow-md relative">
              <span className="absolute -top-3 -right-3 w-8 h-8 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow">2</span>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                  <CheckCircle size={18} className="text-green-600" />
                </div>
                <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Total Earned</p>
              </div>
              <p className="text-3xl font-bold text-[#292524]">₹{(data?.trainer?.totalEarnings || 0).toLocaleString('en-IN')}</p>
              <p className="text-xs text-[#78716C] mt-2">All time payments received</p>
            </div>
          </div>

          {/* Arrow 2 → 3 (left-pointing down-left) */}
          <div className="w-full flex justify-center items-center py-2 relative h-14">
            <div className="absolute right-[27%] top-0 h-full w-px border-l-2 border-dashed border-blue-400/40" />
            <div className="absolute right-[27%] bottom-0 w-[46%] h-px border-b-2 border-dashed border-blue-400/40" />
            <div className="absolute left-[27%] bottom-0 h-1/2 w-px border-l-2 border-dashed border-blue-400/40" />
            {/* Arrow icon */}
            <div className="absolute left-[24%] bottom-1 bg-blue-50 rounded-full p-1">
              <ArrowDownLeft size={16} className="text-blue-500" />
            </div>
          </div>

          {/* ── Step 3: LEFT ── */}
          <div className="w-full flex justify-start">
            <div className="w-[55%] bg-white border-2 border-blue-400/30 rounded-2xl p-6 shadow-md relative">
              <span className="absolute -top-3 -left-3 w-8 h-8 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow">3</span>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                  <IndianRupee size={18} className="text-blue-500" />
                </div>
                <p className="text-xs font-bold text-[#78716C] uppercase tracking-wider">Available Balance</p>
              </div>
              <p className="text-3xl font-bold text-[#292524]">₹{(data?.trainer?.availableBalance || 0).toLocaleString('en-IN')}</p>
              <p className="text-xs text-[#78716C] mt-2">Ready to withdraw</p>
            </div>
          </div>

        </div>
      ) : (
        /* Empty state */
        <div className="bg-white border border-[#FED7AA] rounded-2xl p-12 text-center shadow-sm">
          <TrendingUp size={40} className="mx-auto text-[#CBD5E1] mb-4" />
          <h3 className="text-lg font-semibold text-[#78716C]">No Fee Configured</h3>
          <p className="text-[#78716C] text-sm mt-2">Your Gym Owner needs to configure your fee before earnings can be calculated.</p>
        </div>
      )}
    </div>
  );
};

export default TrainerEarnings;