import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, IndianRupee, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const GymAdminTrainerEarnings = () => {
  const [data, setData] = useState<any>(null);
  const [fees, setFees] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [earningsRes, feesRes, historyRes] = await Promise.all([
        api.get('/trainer-payments/gym-earnings'),
        api.get('/trainer-payments/fees'),
        api.get('/trainer-payments/history'),
      ]);
      setData(earningsRes.data);
      setFees(feesRes.data.fees || []);
      setPayments(historyRes.data.payments || []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

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
      <div className="w-10 h-10 border-4 border-[#164A4A] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#202828]">Trainer Earnings Overview</h1>
        <p className="text-[#687B78] text-sm mt-1">Summary of all trainer fee configurations and payments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8E5DA] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={16} className="text-[#164A4A]" />
            </div>
            <p className="text-xs font-semibold text-[#687B78] uppercase tracking-wide">Total Paid Out</p>
          </div>
          <p className="text-2xl font-bold text-[#202828]">₹{(data?.totalPaidOut || 0).toLocaleString('en-IN')}</p>
          <p className="text-xs text-[#A8ADA9] mt-1">{data?.paymentsCount || 0} payments</p>
        </div>
        <div className="bg-white border border-[#E8E5DA] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users size={16} className="text-[#D2B48C]" />
            </div>
            <p className="text-xs font-semibold text-[#687B78] uppercase tracking-wide">Active Trainers</p>
          </div>
          <p className="text-2xl font-bold text-[#202828]">{fees.length}</p>
          <p className="text-xs text-[#A8ADA9] mt-1">With active fee config</p>
        </div>
        <div className="bg-white border border-[#E8E5DA] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <IndianRupee size={16} className="text-purple-600" />
            </div>
            <p className="text-xs font-semibold text-[#687B78] uppercase tracking-wide">Monthly Commitment</p>
          </div>
          <p className="text-2xl font-bold text-[#202828]">₹{totalConfiguredMonthly.toLocaleString('en-IN')}</p>
          <p className="text-xs text-[#A8ADA9] mt-1">Monthly trainers only</p>
        </div>
        <div className="bg-white border border-[#E8E5DA] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={16} className="text-amber-600" />
            </div>
            <p className="text-xs font-semibold text-[#687B78] uppercase tracking-wide">Avg Payout</p>
          </div>
          <p className="text-2xl font-bold text-[#202828]">
            ₹{data?.paymentsCount ? Math.round((data?.totalPaidOut || 0) / data.paymentsCount).toLocaleString('en-IN') : '0'}
          </p>
          <p className="text-xs text-[#A8ADA9] mt-1">Per payment</p>
        </div>
      </div>

      {/* Per-Trainer Breakdown */}
      <div className="bg-white border border-[#E8E5DA] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#E8E5DA]">
          <h2 className="font-bold text-[#202828]">Trainer Earnings Breakdown</h2>
        </div>
        {trainerSummary.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-4">
              <TrendingUp size={28} className="text-purple-300" />
            </div>
            <p className="text-[#202828] font-bold text-lg">No trainer fee data yet</p>
            <p className="text-[#687B78] text-sm mt-2 max-w-sm mx-auto">
              Earnings overview will populate once you configure fees for your trainers.
            </p>
            <Link
              to="/admin/trainer-fees/settings"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-[#164A4A] text-white rounded-xl text-sm font-bold hover:bg-[#C6A77D] transition-colors shadow-lg shadow-green-200"
            >
              Configure Trainer Fees
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F2EFE8] border-b border-[#E8E5DA]">
                  <th className="px-5 py-3.5 font-semibold text-[#687B78]">Trainer</th>
                  <th className="px-5 py-3.5 font-semibold text-[#687B78]">Training Type</th>
                  <th className="px-5 py-3.5 font-semibold text-[#687B78] text-right">Configured Fee</th>
                  <th className="px-5 py-3.5 font-semibold text-[#687B78]">Billing Cycle</th>
                  <th className="px-5 py-3.5 font-semibold text-[#687B78] text-right">Total Paid</th>
                  <th className="px-5 py-3.5 font-semibold text-[#687B78]">Payments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {trainerSummary.map(({ fee, paid, paymentsCount }) => (
                  <tr key={fee._id} className="hover:bg-[#F2EFE8] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#164A4A] to-[#6fa3a0] flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {fee.trainerId?.name?.[0] || 'T'}
                        </div>
                        <div>
                          <p className="font-semibold text-[#202828]">{fee.trainerId?.name || 'Unknown'}</p>
                          <p className="text-xs text-[#A8ADA9]">{fee.trainerId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[#455250]">{fee.trainingType}</td>
                    <td className="px-5 py-4 text-right font-bold text-[#202828]">₹{fee.feeAmount?.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold">{fee.billingCycle}</span>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-[#164A4A]">₹{paid.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-[#687B78]">{paymentsCount} payments</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelectedTrainer(fee.trainerId)}
                        className="px-3 py-1.5 text-xs font-semibold text-[#3B82F6] hover:bg-blue-50 rounded-lg transition-colors"
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-5 border-b border-[#E8E5DA] bg-[#F2EFE8]">
              <div>
                <h3 className="text-lg font-bold text-[#202828]">{selectedTrainer.name}'s Payments</h3>
                <p className="text-xs text-[#687B78]">{selectedTrainer.email}</p>
              </div>
              <button
                onClick={() => setSelectedTrainer(null)}
                className="text-[#687B78] hover:text-[#202828] bg-white rounded-full p-1 border border-gray-200"
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
                      <p className="text-[#687B78]">No payments recorded for this trainer yet.</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {trainerPayments.map((p, i) => (
                      <div key={i} className="bg-white border border-[#E8E5DA] rounded-xl overflow-hidden shadow-sm hover:border-[#CBD5E1] transition-colors">
                        <div className="flex justify-between items-center bg-[#F2EFE8] p-4 border-b border-[#E8E5DA]">
                          <div>
                            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1 block">Payment Amount</span>
                            <span className="text-xl font-bold text-[#202828]">₹{p.amount?.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit ${
                              p.paymentStatus === 'Paid' ? 'bg-[#D2B48C]/10 text-[#164A4A]' :
                              p.paymentStatus === 'Pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {p.paymentStatus}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-4 grid grid-cols-2 gap-4 text-sm bg-white">
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Date</p>
                            <p className="font-semibold text-gray-900">
                              {p.createdAt ? new Date(p.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs mb-1">Payment Method</p>
                            <p className="font-semibold text-gray-900">{p.paymentMethod || '-'}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-500 text-xs mb-1">Transaction ID / Reference</p>
                            <p className="font-semibold text-gray-900">{p.transactionId || <span className="text-gray-400 italic">Not provided</span>}</p>
                          </div>
                        </div>
                        
                        {p.notes && (
                          <div className="px-4 pb-4 bg-white">
                            <p className="text-gray-500 text-xs mb-1.5">Notes</p>
                            <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">{p.notes}</p>
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
