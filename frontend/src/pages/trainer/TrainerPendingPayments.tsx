import { useState, useEffect, useCallback } from 'react';
import { History, XCircle, Clock, AlertCircle, Lock } from 'lucide-react';
import api from '../../utils/api';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Processing: 'bg-[#1B2728] text-[#2DD4BF]',
  Failed: 'bg-red-100 text-red-700',
  Cancelled: 'bg-[#1B2728] text-[#9AAEAE]',
};

const STATUS_ICONS: Record<string, any> = {
  Pending: Clock,
  Processing: Clock,
  Failed: XCircle,
  Cancelled: AlertCircle,
};

const TrainerPendingPayments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/trainer-payments/my-pending');
      setPayments(res.data.pending || []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const totalPending = payments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F5FAFA]">Pending Payments</h1>
          <p className="text-[#9AAEAE] text-sm mt-1">Payments that are pending, processing, or have failed</p>
        </div>
        {totalPending > 0 && (
          <div className="bg-[#1B2728] border border-[#FEF3C7] rounded-xl px-5 py-3 text-right">
            <p className="text-xs text-[#9AAEAE]">Total Pending</p>
            <p className="text-xl font-bold text-[#2DD4BF]">₹{totalPending.toLocaleString('en-IN')}</p>
          </div>
        )}
      </div>

      {/* Read-only notice */}
      <div className="flex items-start gap-3 bg-[#1B2728] border border-[#2A3A3A] rounded-xl px-5 py-3">
        <Lock size={15} className="text-[#2DD4BF] mt-0.5 shrink-0" />
        <p className="text-[#2DD4BF] text-sm">Payment records are maintained by your Gym Owner and are <strong>read-only</strong>.</p>
      </div>

      {/* Table */}
      <div className="bg-[#141D1E] border border-[#1B2728] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#2DD4BF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-20">
            <History size={40} className="mx-auto text-[#2A3A3A] mb-3" />
            <p className="text-[#9AAEAE] font-semibold">No pending payments</p>
            <p className="text-[#9AAEAE] text-sm mt-1">All your payments from Gym Owners are currently up to date</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#0E1415] border-b border-[#1B2728]">
                  <th className="px-5 py-3.5 font-semibold text-[#9AAEAE]">Gym Details</th>
                  <th className="px-5 py-3.5 font-semibold text-[#9AAEAE]">Training Type</th>
                  <th className="px-5 py-3.5 font-semibold text-[#9AAEAE]">Date</th>
                  <th className="px-5 py-3.5 font-semibold text-[#9AAEAE] text-right">Amount</th>
                  <th className="px-5 py-3.5 font-semibold text-[#9AAEAE]">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-[#9AAEAE] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0E1415]">
                {payments.map(p => {
                  const Icon = STATUS_ICONS[p.paymentStatus] || Clock;
                  return (
                    <tr key={p._id} className="hover:bg-[#0E1415] transition-colors">
                      <td className="px-5 py-4">
                          <p className="font-bold text-[#F5FAFA]">{p.gymId?.name || 'Unknown Gym'}</p>
                          <p className="text-xs text-[#9AAEAE]">{p.branchId ? 'Branch ID: ' + p.branchId : 'Main Branch'}</p>
                      </td>
                      <td className="px-5 py-4 text-[#9AAEAE]">{p.trainerFeeId?.trainingType || '-'}</td>
                      <td className="px-5 py-4 text-[#9AAEAE] whitespace-nowrap">
                        {p.paymentDate
                          ? new Date(p.paymentDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '-'}
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-[#F5FAFA]">₹{p.amount?.toLocaleString('en-IN')}</td>
                      
                      <td className="px-5 py-4">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit ${STATUS_COLORS[p.paymentStatus] || 'bg-[#1B2728] text-[#9AAEAE]'}`}>
                          <Icon size={12} />
                          {p.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="px-3 py-1.5 text-xs font-semibold text-[#5EEAD4] hover:bg-[#1B2728] rounded-lg transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#141D1E] rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#1B2728] bg-[#0E1415]">
              <h3 className="font-bold text-[#F5FAFA]">Payment Details</h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-[#9AAEAE] hover:text-[#FFFFFF]"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center bg-[#0E1415] p-4 rounded-xl border border-[#2A3A3A]">
                <span className="text-[#9AAEAE] text-sm font-medium">Amount</span>
                <span className="text-2xl font-bold text-[#F5FAFA]">₹{selectedPayment.amount?.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#9AAEAE] mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit ${STATUS_COLORS[selectedPayment.paymentStatus] || 'bg-[#1B2728] text-[#9AAEAE]'}`}>
                    {selectedPayment.paymentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-[#9AAEAE] mb-1">Date</p>
                  <p className="font-semibold text-[#F5FAFA]">
                    {selectedPayment.paymentDate ? new Date(selectedPayment.paymentDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[#9AAEAE] mb-1">Training Type</p>
                  <p className="font-semibold text-[#F5FAFA]">{selectedPayment.trainerFeeId?.trainingType || '-'}</p>
                </div>
                <div>
                  <p className="text-[#9AAEAE] mb-1">Payment Method</p>
                  <p className="font-semibold text-[#F5FAFA]">{selectedPayment.paymentMethod || '-'}</p>
                </div>
              </div>
              
              {selectedPayment.notes && (
                <div className="pt-3 border-t border-[#2A3A3A]">
                  <p className="text-[#9AAEAE] mb-1 text-sm">Notes from Gym Owner</p>
                  <p className="text-sm text-[#C1D0D0] bg-[#0E1415] p-3 rounded-lg border border-[#2A3A3A]">{selectedPayment.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerPendingPayments;
