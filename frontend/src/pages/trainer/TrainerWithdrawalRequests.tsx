import { useState, useEffect, useCallback } from 'react';
import { CreditCard, Clock, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

const STATUS_COLORS: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

const TrainerWithdrawalRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/trainer-payments/my-withdrawals');
      const pending = (res.data.withdrawals || []).filter((w: any) => w.status === 'Pending');
      setRequests(pending);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWithdrawals(); }, [fetchWithdrawals]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1E293B]">Withdrawal Requests</h1>
          <p className="text-[#64748B] text-sm mt-1">Track your pending payout requests</p>
        </div>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#16A34A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-20">
            <CreditCard size={40} className="mx-auto text-[#CBD5E1] mb-3" />
            <p className="text-[#64748B] font-semibold">No pending requests</p>
            <p className="text-[#94A3B8] text-sm mt-1">You don't have any pending withdrawal requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <th className="px-5 py-3.5 font-semibold text-[#64748B]">Date Requested</th>
                  <th className="px-5 py-3.5 font-semibold text-[#64748B] text-right">Amount</th>
                  <th className="px-5 py-3.5 font-semibold text-[#64748B] text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {requests.map((r, idx) => (
                  <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="px-5 py-4 text-[#475569] whitespace-nowrap">
                      {new Date(r.requestedAt || r.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-[#1E293B]">₹{r.amount?.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-right">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-500'}`}>
                        <Clock size={12} />
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex gap-3 text-blue-800 text-sm">
        <AlertCircle size={20} className="shrink-0 mt-0.5" />
        <p>Your Gym Owner will review and process your pending withdrawal requests. Once approved, the funds will be transferred to your configured bank account.</p>
      </div>
    </div>
  );
};

export default TrainerWithdrawalRequests;
