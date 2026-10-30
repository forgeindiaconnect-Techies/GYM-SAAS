import { useState, useEffect, useCallback } from 'react';
import { History, CheckCircle, XCircle, Clock, AlertCircle, Lock } from 'lucide-react';
import api from '../../utils/api';

const STATUS_COLORS: Record<string, string> = {
  Paid: 'bg-[#FFF7ED] text-[#EA580C]',
  Pending: 'bg-amber-100 text-amber-700',
  Failed: 'bg-red-100 text-red-700',
  Cancelled: 'bg-[#F8FAFC] text-[#64748B]',
};

const STATUS_ICONS: Record<string, any> = {
  Paid: CheckCircle,
  Pending: Clock,
  Failed: XCircle,
  Cancelled: AlertCircle,
};

const TrainerPaymentHistoryPage = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/trainer-payments/my-history');
      setPayments(res.data.payments || []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const totalReceived = payments.filter(p => p.paymentStatus === 'Paid').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Payment History</h1>
          <p className="text-[#64748B] text-sm mt-1">Your complete payment record from your Gym Owner</p>
        </div>
        {totalReceived > 0 && (
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-5 py-3 text-right">
            <p className="text-xs text-[#64748B]">Total Received</p>
            <p className="text-xl font-bold text-[#EA580C]">₹{totalReceived.toLocaleString('en-IN')}</p>
          </div>
        )}
      </div>

      {/* Read-only notice */}
      <div className="flex items-start gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-5 py-3">
        <Lock size={15} className="text-[#EA580C] mt-0.5 shrink-0" />
        <p className="text-[#EA580C] text-sm">Payment records are maintained by your Gym Owner and are <strong>read-only</strong>.</p>
      </div>

      {/* Table */}
      <div className="bg-[#FFFFFF] border border-[#F8FAFC] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#FDBA74] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-20">
            <History size={40} className="mx-auto text-[#E2E8F0] mb-3" />
            <p className="text-[#64748B] font-semibold">No payment records yet</p>
            <p className="text-[#64748B] text-sm mt-1">Your payment history will appear here once your Gym Owner processes payments</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#F8FAFC]">
                  <th className="px-5 py-3.5 font-semibold text-[#64748B]">Date</th>
                  <th className="px-5 py-3.5 font-semibold text-[#64748B]">Training Type</th>
                  <th className="px-5 py-3.5 font-semibold text-[#64748B] text-right">Amount</th>
                  <th className="px-5 py-3.5 font-semibold text-[#64748B]">Payment Method</th>
                  <th className="px-5 py-3.5 font-semibold text-[#64748B]">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-[#64748B] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFC]">
                {payments.map(p => {
                  const Icon = STATUS_ICONS[p.paymentStatus] || Clock;
                  return (
                    <tr key={p._id} className="hover:bg-[#FFF7ED] transition-colors">
                      <td className="px-5 py-4 text-[#64748B] whitespace-nowrap">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
                          : '-'}
                      </td>
                      <td className="px-5 py-4 text-[#64748B]">{p.trainerFeeId?.trainingType || '-'}</td>
                      <td className="px-5 py-4 text-right font-bold text-[#111827]">₹{p.amount?.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 text-[#64748B]">{p.paymentMethod}</td>

                      <td className="px-5 py-4">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit ${STATUS_COLORS[p.paymentStatus] || 'bg-[#F8FAFC] text-[#64748B]'}`}>
                          <Icon size={12} />
                          {p.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="px-3 py-1.5 text-xs font-semibold text-[#9A3412] hover:bg-[#FFF7ED] rounded-lg transition-colors"
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
          <div className="bg-[#FFFFFF] rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#F8FAFC] bg-[#F8FAFC]">
              <h3 className="font-bold text-[#111827]">Payment Details</h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-[#64748B] hover:text-[#C2410C]"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <span className="text-[#64748B] text-sm font-medium">Amount</span>
                <span className="text-2xl font-bold text-[#111827]">₹{selectedPayment.amount?.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#64748B] mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit ${STATUS_COLORS[selectedPayment.paymentStatus] || 'bg-[#F8FAFC] text-[#64748B]'}`}>
                    {selectedPayment.paymentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-[#64748B] mb-1">Date</p>
                  <p className="font-semibold text-[#111827]">
                    {selectedPayment.createdAt ? new Date(selectedPayment.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[#64748B] mb-1">Payment Method</p>
                  <p className="font-semibold text-[#111827]">{selectedPayment.paymentMethod || '-'}</p>
                </div>
                <div>
                  <p className="text-[#64748B] mb-1">Transaction ID</p>
                  <p className="font-semibold text-[#111827] break-all">{selectedPayment.transactionId || 'N/A'}</p>
                </div>
              </div>
              
              {selectedPayment.notes && (
                <div className="pt-3 border-t border-[#E2E8F0]">
                  <p className="text-[#64748B] mb-1 text-sm">Notes from Gym Owner</p>
                  <p className="text-sm text-[#111827] bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">{selectedPayment.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerPaymentHistoryPage;
