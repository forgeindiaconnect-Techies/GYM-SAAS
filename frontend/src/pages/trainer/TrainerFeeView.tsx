import { useState, useEffect, useCallback } from 'react';
import { IndianRupee, Activity, Tag, Calendar, Bell, ShieldAlert, Clock, Lock } from 'lucide-react';
import api from '../../utils/api';

const TrainerFeeView = () => {
  const [fee, setFee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchFee = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/trainer-payments/my-fee');
      setFee(res.data.fee);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFee(); }, [fetchFee]);

  const cycleSuffix = (cycle: string) => {
    const m: Record<string, string> = { 'Per Session': '/ Session', 'Weekly': '/ Week', 'Monthly': '/ Month', 'Custom': '' };
    return m[cycle] || '';
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-10 h-10 border-4 border-[#164A4A] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#202828]">My Trainer Fee</h1>
        <p className="text-[#687B78] text-sm mt-1">Fee configuration set by your Gym Owner</p>
      </div>

      {/* Read-only notice */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-3">
        <Lock size={15} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-blue-800 text-sm">
          This information is <strong>configured by your Gym Owner</strong> and is read-only. Contact your gym management to update your fee details.
        </p>
      </div>

      {!fee ? (
        <div className="bg-white border border-[#E8E5DA] rounded-2xl p-12 text-center shadow-sm">
          <IndianRupee size={40} className="mx-auto text-[#CBD5E1] mb-4" />
          <h3 className="text-lg font-semibold text-[#455250]">No Fee Configured Yet</h3>
          <p className="text-[#A8ADA9] text-sm mt-2">Your Gym Owner has not configured your fee yet. Please contact them for more information.</p>
        </div>
      ) : fee.status !== 'Active' ? (
        <div className="bg-white border border-[#E8E5DA] rounded-2xl p-12 text-center shadow-sm">
          <Clock size={40} className="mx-auto text-amber-500 mb-4" />
          <h3 className="text-lg font-semibold text-[#455250]">Fee Status: {fee.status}</h3>
          <p className="text-[#A8ADA9] text-sm mt-2">Your fee configuration is currently marked as {fee.status.toLowerCase()}. The details will be visible once it becomes Active.</p>
        </div>
      ) : (
        <>
          {/* Main Fee Card */}
          <div className="bg-white border border-[#E8E5DA] rounded-2xl shadow-sm overflow-hidden">
            {/* Top Banner */}
            <div className="bg-gradient-to-r from-[#164A4A] to-[#6fa3a0] px-6 py-5">
              <p className="text-green-100 text-sm font-medium mb-1">Current Fee</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-white">₹{fee.feeAmount?.toLocaleString('en-IN')}</span>
                <span className="text-green-200 text-lg font-medium mb-1">{cycleSuffix(fee.billingCycle)}</span>
              </div>
              <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold ${fee.status === 'Active' ? 'bg-white/20 text-white' : 'bg-red-500/30 text-red-100'}`}>
                ● {fee.status}
              </span>
            </div>

            {/* Details Grid */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                  <Activity size={16} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-[#A8ADA9] font-medium uppercase tracking-wide mb-0.5">Training Type</p>
                  <p className="font-semibold text-[#202828]">{fee.trainingType}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Tag size={16} className="text-[#D2B48C]" />
                </div>
                <div>
                  <p className="text-xs text-[#A8ADA9] font-medium uppercase tracking-wide mb-0.5">Billing Cycle</p>
                  <p className="font-semibold text-[#202828]">{fee.billingCycle}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                  <Calendar size={16} className="text-[#164A4A]" />
                </div>
                <div>
                  <p className="text-xs text-[#A8ADA9] font-medium uppercase tracking-wide mb-0.5">Effective From</p>
                  <p className="font-semibold text-[#202828]">
                    {fee.effectiveFrom ? new Date(fee.effectiveFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '-'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                  <IndianRupee size={16} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-[#A8ADA9] font-medium uppercase tracking-wide mb-0.5">Payment Method</p>
                  <p className="font-semibold text-[#202828]">{fee.paymentMethod}</p>
                </div>
              </div>
            </div>

            {fee.notes && (
              <div className="px-6 pb-6">
                <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4">
                  <p className="text-xs text-[#A8ADA9] font-medium mb-1">Notes from Gym Owner</p>
                  <p className="text-sm text-[#455250]">{fee.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-[#F1F5F3] border border-[#D3DFDA] rounded-xl px-5 py-4">
            <p className="text-sm text-[#164A4A] font-semibold mb-1">How your fee works</p>
            <p className="text-sm text-[#455250]">
              {fee.billingCycle === 'Per Session' && 'You earn ₹' + fee.feeAmount?.toLocaleString('en-IN') + ' per completed session. Your Gym Owner will record payment after confirming sessions.'}
              {fee.billingCycle === 'Weekly' && 'You receive ₹' + fee.feeAmount?.toLocaleString('en-IN') + ' every week. Payments are processed by your Gym Owner.'}
              {fee.billingCycle === 'Monthly' && 'You receive ₹' + fee.feeAmount?.toLocaleString('en-IN') + ' every month. Your Gym Owner will initiate the payment at the end of each month.'}
              {fee.billingCycle === 'Custom' && 'Your fee arrangement is custom. Contact your Gym Owner for the payment schedule details.'}
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default TrainerFeeView;
