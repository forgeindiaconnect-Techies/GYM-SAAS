import { useState, useEffect, useCallback } from 'react';
import { History, CheckCircle, XCircle, Clock, AlertCircle, Lock } from 'lucide-react';
import api from '../../utils/api';

const STATUS_COLORS: Record<string, string> = {
  Paid: 'bg-[#D2B48C]/10 text-[#164A4A]',
  Pending: 'bg-amber-100 text-amber-700',
  Failed: 'bg-red-100 text-red-700',
  Cancelled: 'bg-gray-100 text-gray-500',
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
          <h1 className="text-2xl font-bold text-[#202828]">Payment History</h1>
          <p className="text-[#687B78] text-sm mt-1">Your complete payment record from your Gym Owner</p>
        </div>
        {totalReceived > 0 && (
          <div className="bg-[#F1F5F3] border border-[#D3DFDA] rounded-xl px-5 py-3 text-right">
            <p className="text-xs text-[#687B78]">Total Received</p>
            <p className="text-xl font-bold text-[#164A4A]">₹{totalReceived.toLocaleString('en-IN')}</p>
          </div>
        )}
      </div>

      {/* Read-only notice */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-3">
        <Lock size={15} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-blue-800 text-sm">Payment records are maintained by your Gym Owner and are <strong>read-only</strong>.</p>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E8E5DA] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#164A4A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-20">
            <History size={40} className="mx-auto text-[#CBD5E1] mb-3" />
            <p className="text-[#687B78] font-semibold">No payment records yet</p>
            <p className="text-[#A8ADA9] text-sm mt-1">Your payment history will appear here once your Gym Owner processes payments</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F2EFE8] border-b border-[#E8E5DA]">
                  <th className="px-5 py-3.5 font-semibold text-[#687B78]">Date</th>
                  <th className="px-5 py-3.5 font-semibold text-[#687B78]">Training Type</th>
                  <th className="px-5 py-3.5 font-semibold text-[#687B78] text-right">Amount</th>
                  <th className="px-5 py-3.5 font-semibold text-[#687B78]">Payment Method</th>
                  <th className="px-5 py-3.5 font-semibold text-[#687B78]">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-[#687B78] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {payments.map(p => {
                  const Icon = STATUS_ICONS[p.paymentStatus] || Clock;
                  return (
                    <tr key={p._id} className="hover:bg-[#F2EFE8] transition-colors">
                      <td className="px-5 py-4 text-[#455250] whitespace-nowrap">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
                          : '-'}
                      </td>
                      <td className="px-5 py-4 text-[#455250]">{p.trainerFeeId?.trainingType || '-'}</td>
                      <td className="px-5 py-4 text-right font-bold text-[#202828]">₹{p.amount?.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 text-[#455250]">{p.paymentMethod}</td>

                      <td className="px-5 py-4">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit ${STATUS_COLORS[p.paymentStatus] || 'bg-gray-100 text-gray-500'}`}>
                          <Icon size={12} />
                          {p.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="px-3 py-1.5 text-xs font-semibold text-[#3B82F6] hover:bg-blue-50 rounded-lg transition-colors"
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#E8E5DA] bg-[#F2EFE8]">
              <h3 className="font-bold text-[#202828]">Payment Details</h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-[#687B78] hover:text-[#202828]"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-gray-500 text-sm font-medium">Amount</span>
                <span className="text-2xl font-bold text-[#202828]">₹{selectedPayment.amount?.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit ${STATUS_COLORS[selectedPayment.paymentStatus] || 'bg-gray-100 text-gray-500'}`}>
                    {selectedPayment.paymentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Date</p>
                  <p className="font-semibold text-gray-900">
                    {selectedPayment.createdAt ? new Date(selectedPayment.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Payment Method</p>
                  <p className="font-semibold text-gray-900">{selectedPayment.paymentMethod || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Transaction ID</p>
                  <p className="font-semibold text-gray-900">{selectedPayment.transactionId || 'N/A'}</p>
                </div>
              </div>
              
              {selectedPayment.notes && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-gray-500 mb-1 text-sm">Notes from Gym Owner</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">{selectedPayment.notes}</p>
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
