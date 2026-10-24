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
      <div className="w-10 h-10 border-4 border-[#2DD4BF] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#F5FAFA]">Trainer Earnings Overview</h1>
        <p className="text-[#9AAEAE] text-sm mt-1">Summary of all trainer fee configurations and payments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#141D1E] border border-[#1B2728] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={16} className="text-[#2DD4BF]" />
            </div>
            <p className="text-xs font-semibold text-[#9AAEAE] uppercase tracking-wide">Total Paid Out</p>
          </div>
          <p className="text-2xl font-bold text-[#F5FAFA]">₹{(data?.totalPaidOut || 0).toLocaleString('en-IN')}</p>
          <p className="text-xs text-[#9AAEAE] mt-1">{data?.paymentsCount || 0} payments</p>
        </div>
        <div className="bg-[#141D1E] border border-[#1B2728] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#1B2728] rounded-lg flex items-center justify-center">
              <Users size={16} className="text-[#2DD4BF]" />
            </div>
            <p className="text-xs font-semibold text-[#9AAEAE] uppercase tracking-wide">Active Trainers</p>
          </div>
          <p className="text-2xl font-bold text-[#F5FAFA]">{fees.length}</p>
          <p className="text-xs text-[#9AAEAE] mt-1">With active fee config</p>
        </div>
        <div className="bg-[#141D1E] border border-[#1B2728] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#1B2728] rounded-lg flex items-center justify-center">
              <IndianRupee size={16} className="text-[#2DD4BF]" />
            </div>
            <p className="text-xs font-semibold text-[#9AAEAE] uppercase tracking-wide">Monthly Commitment</p>
          </div>
          <p className="text-2xl font-bold text-[#F5FAFA]">₹{totalConfiguredMonthly.toLocaleString('en-IN')}</p>
          <p className="text-xs text-[#9AAEAE] mt-1">Monthly trainers only</p>
        </div>
        <div className="bg-[#141D1E] border border-[#1B2728] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-amber-600" />
            </div>
            <p className="text-xs font-semibold text-[#9AAEAE] uppercase tracking-wide">Avg Payout</p>
          </div>
          <p className="text-2xl font-bold text-[#F5FAFA]">
            ₹{data?.paymentsCount ? Math.round((data?.totalPaidOut || 0) / data.paymentsCount).toLocaleString('en-IN') : '0'}
          </p>
          <p className="text-xs text-[#9AAEAE] mt-1">Per payment</p>
        </div>
      </div>

      {/* Per-Trainer Breakdown */}
      <div className="bg-[#141D1E] border border-[#1B2728] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#1B2728]">
          <h2 className="font-bold text-[#F5FAFA]">Trainer Earnings Breakdown</h2>
        </div>
        {trainerSummary.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 rounded-full bg-[#0E1415] flex items-center justify-center mx-auto mb-4">
              <TrendingUp size={28} className="text-[#1B2728]" />
            </div>
            <p className="text-[#F5FAFA] font-bold text-lg">No trainer fee data yet</p>
            <p className="text-[#9AAEAE] text-sm mt-2 max-w-sm mx-auto">
              Earnings overview will populate once you configure fees for your trainers.
            </p>
            <Link
              to="/admin/trainer-fees/settings"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-[#2DD4BF] text-[#06201D] font-bold rounded-xl text-sm font-bold hover:bg-[#5EEAD4] transition-colors shadow-lg shadow-teal-900/10"
            >
              Configure Trainer Fees
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#0E1415] border-b border-[#1B2728]">
                  <th className="px-5 py-3.5 font-semibold text-[#9AAEAE]">Trainer</th>
                  <th className="px-5 py-3.5 font-semibold text-[#9AAEAE]">Training Type</th>
                  <th className="px-5 py-3.5 font-semibold text-[#9AAEAE] text-right">Configured Fee</th>
                  <th className="px-5 py-3.5 font-semibold text-[#9AAEAE]">Billing Cycle</th>
                  <th className="px-5 py-3.5 font-semibold text-[#9AAEAE] text-right">Total Paid</th>
                  <th className="px-5 py-3.5 font-semibold text-[#9AAEAE]">Payments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0E1415]">
                {trainerSummary.map(({ fee, paid, paymentsCount }) => (
                  <tr key={fee._id} className="hover:bg-[#0E1415] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2DD4BF] to-[#5EEAD4] flex items-center justify-center text-[#06201D] font-bold font-bold text-sm shrink-0">
                          {fee.trainerId?.name?.[0] || 'T'}
                        </div>
                        <div>
                          <p className="font-semibold text-[#F5FAFA]">{fee.trainerId?.name || 'Unknown'}</p>
                          <p className="text-xs text-[#9AAEAE]">{fee.trainerId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#9AAEAE]">{fee.trainingType}</td>
                    <td className="px-5 py-4 text-right font-bold text-[#F5FAFA]">₹{fee.feeAmount?.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-[#1B2728] text-[#2DD4BF] text-xs font-semibold">{fee.billingCycle}</span>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-[#2DD4BF]">₹{paid.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-[#9AAEAE]">{paymentsCount} payments</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedTrainer(fee.trainerId)}
                        className="px-3 py-1.5 text-xs font-semibold text-[#5EEAD4] hover:bg-[#1B2728] rounded-lg transition-colors"
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
          <div className="bg-[#141D1E] rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-5 border-b border-[#1B2728] bg-[#0E1415]">
              <div>
                <h3 className="text-lg font-bold text-[#F5FAFA]">{selectedTrainer.name}'s Payments</h3>
                <p className="text-xs text-[#9AAEAE]">{selectedTrainer.email}</p>
              </div>
              <button
                onClick={() => setSelectedTrainer(null)}
                className="text-[#9AAEAE] hover:text-[#FFFFFF] bg-[#141D1E] rounded-full p-1 border border-[#2A3A3A]"
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
                      <p className="text-[#9AAEAE]">No payments recorded for this trainer yet.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {trainerPayments.map((p, i) => (
                      <div key={i} className="bg-[#141D1E] border border-[#1B2728] rounded-xl overflow-hidden shadow-sm hover:border-[#2A3A3A] transition-colors">
                        <div className="flex justify-between items-center bg-[#0E1415] p-4 border-b border-[#1B2728]">
                          <div>
                            <span className="text-[#9AAEAE] text-xs font-semibold uppercase tracking-wider mb-1 block">Payment Amount</span>
                            <span className="text-xl font-bold text-[#F5FAFA]">₹{p.amount?.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit ${
                              p.paymentStatus === 'Paid' ? 'bg-[#1B2728]/10 text-[#2DD4BF]' :
                              p.paymentStatus === 'Pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-[#1B2728] text-[#C1D0D0]'
                            }`}>
                              {p.paymentStatus}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-4 grid grid-cols-2 gap-4 text-sm bg-[#141D1E]">
                          <div>
                            <p className="text-[#9AAEAE] text-xs mb-1">Date</p>
                            <p className="font-semibold text-[#F5FAFA]">
                              {p.createdAt ? new Date(p.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#9AAEAE] text-xs mb-1">Payment Method</p>
                            <p className="font-semibold text-[#F5FAFA]">{p.paymentMethod || '-'}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[#9AAEAE] text-xs mb-1">Transaction ID / Reference</p>
                            <p className="font-semibold text-[#F5FAFA]">{p.transactionId || <span className="text-[#9AAEAE] italic">Not provided</span>}</p>
                          </div>
                        </div>
                        
                        {p.notes && (
                          <div className="px-4 pb-4 bg-[#141D1E]">
                            <p className="text-[#9AAEAE] text-xs mb-1.5">Notes</p>
                            <p className="text-sm text-[#C1D0D0] bg-[#0E1415] p-3 rounded-lg border border-[#2A3A3A]">{p.notes}</p>
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
