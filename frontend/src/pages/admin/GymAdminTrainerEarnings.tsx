import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, IndianRupee, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const GymAdminTrainerEarnings = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [fees, setFees] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const branchParam = user?.branchId ? `?branchId=${user.branchId}` : '';
      const [earningsRes, feesRes, historyRes] = await Promise.all([
        api.get(`/trainer-payments/gym-earnings${branchParam}`),
        api.get(`/trainer-payments/fees${branchParam}`),
        api.get(`/trainer-payments/history${branchParam}`),
      ]);
      setData(earningsRes.data);
      setFees(feesRes.data.fees || []);
      setPayments(historyRes.data.payments || []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [user?.branchId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalConfiguredMonthly = fees
    .filter(f => f.billingCycle === 'Monthly')
    .reduce((s, f) => s + (f.feeAmount || 0), 0);

  const trainerSummary = fees.map(fee => {
    const trainerPayments = payments.filter(p =>
      (p.trainerId?._id || p.trainerId)?.toString() === (fee.trainerId?._id || fee.trainerId)?.toString()
    );
    const paid = trainerPayments.filter(p => p.paymentStatus === 'Paid').reduce((s, p) => s + p.amount, 0);
    return { fee, paid, paymentsCount: trainerPayments.length };
  });

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-10 h-10 border-4 border-[#FDBA74] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#111827]">Trainer Earnings Overview</h1>
        <p className="text-[#64748B] text-sm mt-1">Summary of all trainer fee configurations and payments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#F8FAFC] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={16} className="text-[#EA580C]" />
            </div>
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Total Paid Out</p>
          </div>
          <p className="text-2xl font-bold text-[#111827]">₹{(data?.totalPaidOut || 0).toLocaleString('en-IN')}</p>
          <p className="text-xs text-[#64748B] mt-1">{data?.paymentsCount || 0} payments</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#F8FAFC] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#F8FAFC] rounded-lg flex items-center justify-center">
              <Users size={16} className="text-[#EA580C]" />
            </div>
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Active Trainers</p>
          </div>
          <p className="text-2xl font-bold text-[#111827]">{fees.length}</p>
          <p className="text-xs text-[#64748B] mt-1">With active fee config</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#F8FAFC] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#F8FAFC] rounded-lg flex items-center justify-center">
              <IndianRupee size={16} className="text-[#EA580C]" />
            </div>
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Monthly Commitment</p>
          </div>
          <p className="text-2xl font-bold text-[#111827]">₹{totalConfiguredMonthly.toLocaleString('en-IN')}</p>
          <p className="text-xs text-[#64748B] mt-1">Monthly trainers only</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#F8FAFC] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-amber-600" />
            </div>
            <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Avg Payout</p>
          </div>
          <p className="text-2xl font-bold text-[#111827]">
            ₹{data?.paymentsCount ? Math.round((data?.totalPaidOut || 0) / data.paymentsCount).toLocaleString('en-IN') : '0'}
          </p>
          <p className="text-xs text-[#64748B] mt-1">Per payment</p>
        </div>
      </div>

      {/* Per-Trainer Breakdown */}
      <div className="bg-[#FFFFFF] border border-[#F8FAFC] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#F8FAFC]">
          <h2 className="font-bold text-[#111827]">Trainer Earnings Breakdown</h2>
        </div>
        {trainerSummary.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 rounded-full bg-[#F8FAFC] flex items-center justify-center mx-auto mb-4">
              <TrendingUp size={28} className="text-[#F8FAFC]" />
            </div>
            <p className="text-[#111827] font-bold text-lg">No trainer fee data yet</p>
            <p className="text-[#64748B] text-sm mt-2 max-w-sm mx-auto">
              Earnings overview will populate once you configure fees for your trainers.
            </p>
            <Link
              to="/admin/trainer-fees/settings"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-[#C2410C] text-white font-bold rounded-xl text-sm font-bold hover:bg-[#9A3412] transition-colors shadow-lg shadow-orange-500/15"
            >
              Configure Trainer Fees
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#F8FAFC]">
                  <th className="px-5 py-3.5 font-semibold text-[#64748B]">Trainer</th>
                  <th className="px-5 py-3.5 font-semibold text-[#64748B]">Training Type</th>
                  <th className="px-5 py-3.5 font-semibold text-[#64748B] text-right">Configured Fee</th>
                  <th className="px-5 py-3.5 font-semibold text-[#64748B]">Billing Cycle</th>
                  <th className="px-5 py-3.5 font-semibold text-[#64748B] text-right">Total Paid</th>
                  <th className="px-5 py-3.5 font-semibold text-[#64748B]">Payments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFC]">
                {trainerSummary.map(({ fee, paid, paymentsCount }) => (
                  <tr key={fee._id} className="hover:bg-[#FFF7ED] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#EA580C] to-[#C2410C] flex items-center justify-center text-[#FFFFFF] font-bold font-bold text-sm shrink-0">
                          {fee.trainerId?.name?.[0] || 'T'}
                        </div>
                        <div>
                          <p className="font-semibold text-[#111827]">{fee.trainerId?.name || 'Unknown'}</p>
                          <p className="text-xs text-[#64748B]">{fee.trainerId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#64748B]">{fee.trainingType}</td>
                    <td className="px-5 py-4 text-right font-bold text-[#111827]">₹{fee.feeAmount?.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-[#F8FAFC] text-[#EA580C] text-xs font-semibold">{fee.billingCycle}</span>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-[#EA580C]">₹{paid.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-[#64748B]">{paymentsCount} payments</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedTrainer(fee.trainerId)}
                        className="px-3 py-1.5 text-xs font-semibold text-[#9A3412] hover:bg-[#FFF7ED] rounded-lg transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trainer Details Modal */}
      {selectedTrainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-5 border-b border-[#F8FAFC] bg-[#F8FAFC]">
              <div>
                <h3 className="text-lg font-bold text-[#111827]">{selectedTrainer.name}'s Payments</h3>
                <p className="text-xs text-[#64748B]">{selectedTrainer.email}</p>
              </div>
              <button
                onClick={() => setSelectedTrainer(null)}
                className="text-[#64748B] hover:text-[#C2410C] bg-[#FFFFFF] rounded-full p-1 border border-[#E2E8F0]"
              >
                ✕
              </button>
            </div>
            
            <div className="overflow-y-auto p-5">
              {(() => {
                const trainerPayments = payments.filter(p => 
                  (p.trainerId?._id || p.trainerId)?.toString() === selectedTrainer._id?.toString()
                );

                if (trainerPayments.length === 0) {
                  return (
                    <div className="text-center py-10">
                      <p className="text-[#64748B]">No payments recorded for this trainer yet.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {trainerPayments.map((p, i) => (
                      <div key={i} className="bg-[#FFFFFF] border border-[#F8FAFC] rounded-xl overflow-hidden shadow-sm hover:border-[#E2E8F0] transition-colors">
                        <div className="flex justify-between items-center bg-[#F8FAFC] p-4 border-b border-[#F8FAFC]">
                          <div>
                            <span className="text-[#64748B] text-xs font-semibold uppercase tracking-wider mb-1 block">Payment Amount</span>
                            <span className="text-xl font-bold text-[#111827]">₹{p.amount?.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit ${
                              p.paymentStatus === 'Paid' ? 'bg-[#FFF7ED] text-[#EA580C]' :
                              p.paymentStatus === 'Pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-[#F8FAFC] text-[#111827]'
                            }`}>
                              {p.paymentStatus}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-4 grid grid-cols-2 gap-4 text-sm bg-[#FFFFFF]">
                          <div>
                            <p className="text-[#64748B] text-xs mb-1">Date</p>
                            <p className="font-semibold text-[#111827]">
                              {p.createdAt ? new Date(p.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#64748B] text-xs mb-1">Payment Method</p>
                            <p className="font-semibold text-[#111827]">{p.paymentMethod || '-'}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[#64748B] text-xs mb-1">Transaction ID / Reference</p>
                            <p className="font-semibold text-[#111827]">{p.transactionId || <span className="text-[#64748B] italic">Not provided</span>}</p>
                          </div>
                        </div>
                        
                        {p.notes && (
                          <div className="px-4 pb-4 bg-[#FFFFFF]">
                            <p className="text-[#64748B] text-xs mb-1.5">Notes</p>
                            <p className="text-sm text-[#111827] bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">{p.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminTrainerEarnings;
