import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, IndianRupee, CheckCircle, Clock, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const TrainerEarnings = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

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

  const handleWithdraw = async () => {
    if (!data?.pendingAmount || data.pendingAmount <= 0) return;
    setWithdrawing(true);
    try {
      await api.post('/trainer-payments/withdraw', { amount: data.pendingAmount });
      // Refresh data to show it as requested
      await fetchEarnings();
    } catch (err) {
      console.error('Failed to withdraw', err);
    } finally {
      setWithdrawing(false);
    }
  };

  useEffect(() => { fetchEarnings(); }, [fetchEarnings]);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-10 h-10 border-4 border-[#16A34A] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const fee = data?.currentFee;
  const cycleSuffix = (cycle: string) => {
    const m: Record<string, string> = { 'Per Session': '/ Session', 'Weekly': '/ Week', 'Monthly': '/ Month', 'Custom': '' };
    return m[cycle] || '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#1E293B]">Earnings</h1>
        <p className="text-[#64748B] text-sm mt-1">Your earnings overview and payment status</p>
      </div>

      {/* Read-only notice */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-3">
        <Lock size={15} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-blue-800 text-sm">Earnings are calculated based on your configured fee and payments recorded by your Gym Owner.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <IndianRupee size={16} className="text-[#16A34A]" />
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Current Fee</p>
          </div>
          {fee ? (
            <div className="flex items-end gap-2 mt-1">
              <span className="text-3xl font-bold text-[#1E293B]">₹{fee.feeAmount?.toLocaleString('en-IN')}</span>
              <span className="text-[#64748B] text-sm mb-0.5">{cycleSuffix(fee.billingCycle)}</span>
            </div>
          ) : (
            <p className="text-[#94A3B8] mt-1 text-sm">Not configured</p>
          )}
          {fee && <p className="text-xs text-[#94A3B8] mt-1">{fee.trainingType}</p>}
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} className="text-green-500" />
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Total Earned</p>
          </div>
          <p className="text-2xl font-bold text-[#1E293B] mt-1">₹{(data?.totalEarnings || 0).toLocaleString('en-IN')}</p>
          <p className="text-xs text-[#94A3B8] mt-1">All time</p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Pending</p>
            </div>
            {data?.hasPendingWithdrawal && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                Requested
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-[#1E293B] mt-1">₹{(data?.pendingAmount || 0).toLocaleString('en-IN')}</p>
          <div className="flex justify-between items-end mt-1">
            <p className="text-xs text-[#94A3B8]">Awaiting payment</p>
            {!data?.hasPendingWithdrawal && (data?.pendingAmount || 0) > 0 && (
              <button
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="text-xs font-semibold text-white bg-[#16A34A] hover:bg-[#15803D] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {withdrawing ? 'Requesting...' : 'Withdraw'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Current Period Card */}
      {fee && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E8F0]">
            <h2 className="font-bold text-[#1E293B]">Current Period Breakdown</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-2">
                  <IndianRupee size={20} className="text-blue-600" />
                </div>
                <p className="text-lg font-bold text-[#1E293B]">₹{fee.feeAmount?.toLocaleString('en-IN')}</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">Trainer Fee</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-green-50 flex items-center justify-center mb-2">
                  <CheckCircle size={20} className="text-green-600" />
                </div>
                <p className="text-lg font-bold text-green-600">₹{(data?.paidAmount || 0).toLocaleString('en-IN')}</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">Paid</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto rounded-full bg-amber-50 flex items-center justify-center mb-2">
                  <Clock size={20} className="text-amber-600" />
                </div>
                <p className="text-lg font-bold text-amber-600">₹{(data?.pendingAmount || 0).toLocaleString('en-IN')}</p>
                <p className="text-xs text-[#94A3B8] mt-0.5">Pending</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6">
              <div className="flex justify-between text-xs text-[#64748B] mb-1.5">
                <span>Payment Progress</span>
                <span>
                  {fee.feeAmount ? Math.min(100, Math.round(((data?.paidAmount || 0) / fee.feeAmount) * 100)) : 0}%
                </span>
              </div>
              <div className="h-2 bg-[#F1F5F9] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#16A34A] to-[#0D9488] rounded-full transition-all"
                  style={{ width: `${fee.feeAmount ? Math.min(100, ((data?.paidAmount || 0) / fee.feeAmount) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment History Link */}
      {fee && (
        <div className="flex justify-center mt-4">
          <Link
            to="/trainer/payment-history"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-[#E2E8F0] text-[#475569] font-semibold rounded-xl hover:bg-[#F8FAFC] hover:text-[#1E293B] transition-colors shadow-sm"
          >
            <Clock size={16} />
            View Full Payment History
          </Link>
        </div>
      )}

      {/* Empty state */}
      {!fee && (
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center shadow-sm">
          <TrendingUp size={40} className="mx-auto text-[#CBD5E1] mb-4" />
          <h3 className="text-lg font-semibold text-[#475569]">No Fee Configured</h3>
          <p className="text-[#94A3B8] text-sm mt-2">Your Gym Owner needs to configure your fee before earnings can be calculated.</p>
        </div>
      )}
    </div>
  );
};

export default TrainerEarnings;