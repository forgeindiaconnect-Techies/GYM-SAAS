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
      <div className="w-10 h-10 border-4 border-[#B76E79] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#292524]">Trainer Earnings Overview</h1>
        <p className="text-[#57534E] text-sm mt-1">Summary of all trainer fee configurations and payments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#FFFFFF] border border-[#F3E8E8] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={16} className="text-[#B76E79]" />
            </div>
            <p className="text-xs font-semibold text-[#57534E] uppercase tracking-wide">Total Paid Out</p>
          </div>
          <p className="text-2xl font-bold text-[#292524]">₹{(data?.totalPaidOut || 0).toLocaleString('en-IN')}</p>
          <p className="text-xs text-[#57534E] mt-1">{data?.paymentsCount || 0} payments</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#F3E8E8] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#F3E8E8] rounded-lg flex items-center justify-center">
              <Users size={16} className="text-[#B76E79]" />
            </div>
            <p className="text-xs font-semibold text-[#57534E] uppercase tracking-wide">Active Trainers</p>
          </div>
          <p className="text-2xl font-bold text-[#292524]">{fees.length}</p>
          <p className="text-xs text-[#57534E] mt-1">With active fee config</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#F3E8E8] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-[#F3E8E8] rounded-lg flex items-center justify-center">
              <IndianRupee size={16} className="text-[#B76E79]" />
            </div>
            <p className="text-xs font-semibold text-[#57534E] uppercase tracking-wide">Monthly Commitment</p>
          </div>
          <p className="text-2xl font-bold text-[#292524]">₹{totalConfiguredMonthly.toLocaleString('en-IN')}</p>
          <p className="text-xs text-[#57534E] mt-1">Monthly trainers only</p>
        </div>
        <div className="bg-[#FFFFFF] border border-[#F3E8E8] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-amber-600" />
            </div>
            <p className="text-xs font-semibold text-[#57534E] uppercase tracking-wide">Avg Payout</p>
          </div>
          <p className="text-2xl font-bold text-[#292524]">
            ₹{data?.paymentsCount ? Math.round((data?.totalPaidOut || 0) / data.paymentsCount).toLocaleString('en-IN') : '0'}
          </p>
          <p className="text-xs text-[#57534E] mt-1">Per payment</p>
        </div>
      </div>

      {/* Per-Trainer Breakdown */}
      <div className="bg-[#FFFFFF] border border-[#F3E8E8] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#F3E8E8]">
          <h2 className="font-bold text-[#292524]">Trainer Earnings Breakdown</h2>
        </div>
        {trainerSummary.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 rounded-full bg-[#F3E8E8] flex items-center justify-center mx-auto mb-4">
              <TrendingUp size={28} className="text-[#F3E8E8]" />
            </div>
            <p className="text-[#292524] font-bold text-lg">No trainer fee data yet</p>
            <p className="text-[#57534E] text-sm mt-2 max-w-sm mx-auto">
              Earnings overview will populate once you configure fees for your trainers.
            </p>
            <Link
              to="/admin/trainer-fees/settings"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-[#B76E79] text-white font-bold rounded-xl text-sm font-bold hover:bg-[#9F5965] transition-colors shadow-lg shadow-[#B76E79]/15"
            >
              Configure Trainer Fees
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F3E8E8] border-b border-[#F3E8E8]">
                  <th className="px-5 py-3.5 font-semibold text-[#57534E]">Trainer</th>
                  <th className="px-5 py-3.5 font-semibold text-[#57534E]">Training Type</th>
                  <th className="px-5 py-3.5 font-semibold text-[#57534E] text-right">Configured Fee</th>
                  <th className="px-5 py-3.5 font-semibold text-[#57534E]">Billing Cycle</th>
                  <th className="px-5 py-3.5 font-semibold text-[#57534E] text-right">Total Paid</th>
                  <th className="px-5 py-3.5 font-semibold text-[#57534E]">Payments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3E8E8]">
                {trainerSummary.map(({ fee, paid, paymentsCount }) => (
                  <tr key={fee._id} className="hover:bg-[#F3E8E8] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#B76E79] to-[#9F5965] flex items-center justify-center text-[#FFFFFF] font-bold font-bold text-sm shrink-0">
                          {fee.trainerId?.name?.[0] || 'T'}
                        </div>
                        <div>
                          <p className="font-semibold text-[#292524]">{fee.trainerId?.name || 'Unknown'}</p>
                          <p className="text-xs text-[#57534E]">{fee.trainerId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#57534E]">{fee.trainingType}</td>
                    <td className="px-5 py-4 text-right font-bold text-[#292524]">₹{fee.feeAmount?.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-[#F3E8E8] text-[#B76E79] text-xs font-semibold">{fee.billingCycle}</span>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-[#B76E79]">₹{paid.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-[#57534E]">{paymentsCount} payments</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedTrainer(fee.trainerId)}
                        className="px-3 py-1.5 text-xs font-semibold text-[#9F5965] hover:bg-[#F3E8E8] rounded-lg transition-colors"
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
            <div className="flex items-center justify-between p-5 border-b border-[#F3E8E8] bg-[#F3E8E8]">
              <div>
                <h3 className="text-lg font-bold text-[#292524]">{selectedTrainer.name}'s Payments</h3>
                <p className="text-xs text-[#57534E]">{selectedTrainer.email}</p>
              </div>
              <button
                onClick={() => setSelectedTrainer(null)}
                className="text-[#57534E] hover:text-[#FFFFFF] bg-[#FFFFFF] rounded-full p-1 border border-[#E7DADD]"
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
                      <p className="text-[#57534E]">No payments recorded for this trainer yet.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {trainerPayments.map((p, i) => (
                      <div key={i} className="bg-[#FFFFFF] border border-[#F3E8E8] rounded-xl overflow-hidden shadow-sm hover:border-[#E7DADD] transition-colors">
                        <div className="flex justify-between items-center bg-[#F3E8E8] p-4 border-b border-[#F3E8E8]">
                          <div>
                            <span className="text-[#57534E] text-xs font-semibold uppercase tracking-wider mb-1 block">Payment Amount</span>
                            <span className="text-xl font-bold text-[#292524]">₹{p.amount?.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit ${
                              p.paymentStatus === 'Paid' ? 'bg-[#F3E8E8]/10 text-[#B76E79]' :
                              p.paymentStatus === 'Pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-[#F3E8E8] text-[#292524]'
                            }`}>
                              {p.paymentStatus}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-4 grid grid-cols-2 gap-4 text-sm bg-[#FFFFFF]">
                          <div>
                            <p className="text-[#57534E] text-xs mb-1">Date</p>
                            <p className="font-semibold text-[#292524]">
                              {p.createdAt ? new Date(p.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[#57534E] text-xs mb-1">Payment Method</p>
                            <p className="font-semibold text-[#292524]">{p.paymentMethod || '-'}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-[#57534E] text-xs mb-1">Transaction ID / Reference</p>
                            <p className="font-semibold text-[#292524]">{p.transactionId || <span className="text-[#57534E] italic">Not provided</span>}</p>
                          </div>
                        </div>
                        
                        {p.notes && (
                          <div className="px-4 pb-4 bg-[#FFFFFF]">
                            <p className="text-[#57534E] text-xs mb-1.5">Notes</p>
                            <p className="text-sm text-[#292524] bg-[#F3E8E8] p-3 rounded-lg border border-[#E7DADD]">{p.notes}</p>
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
