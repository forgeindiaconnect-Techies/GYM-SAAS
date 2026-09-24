import { useState, useEffect, useCallback } from 'react';
import { History, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

const STATUS_COLORS: Record<string, string> = {
  Approved: 'bg-[#D2B48C]/10 text-[#164A4A]',
  Rejected: 'bg-red-100 text-red-700',
};

const STATUS_ICONS: Record<string, any> = {
  Approved: CheckCircle,
  Rejected: XCircle,
};

const TrainerWithdrawals = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/trainer-payments/my-withdrawals');
      const past = (res.data.withdrawals || []).filter((w: any) => w.status !== 'Pending');
      setHistory(past);
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
          <h1 className="text-2xl font-bold text-[#202828]">Withdrawal History</h1>
          <p className="text-[#687B78] text-sm mt-1">Your past payout requests and their status</p>
        </div>
      </div>

      <div className="bg-white border border-[#E8E5DA] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#164A4A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20">
            <History size={40} className="mx-auto text-[#CBD5E1] mb-3" />
            <p className="text-[#687B78] font-semibold">No withdrawal history</p>
            <p className="text-[#A8ADA9] text-sm mt-1">You haven't had any processed withdrawals yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F2EFE8] border-b border-[#E8E5DA]">
                  <th className="px-5 py-3.5 font-semibold text-[#687B78]">Date Requested</th>
                  <th className="px-5 py-3.5 font-semibold text-[#687B78]">Processed At</th>
                  <th className="px-5 py-3.5 font-semibold text-[#687B78] text-right">Amount</th>
                  <th className="px-5 py-3.5 font-semibold text-[#687B78] text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {history.map((h, idx) => {
                  const Icon = STATUS_ICONS[h.status] || AlertCircle;
                  return (
                    <tr key={idx} className="hover:bg-[#F2EFE8] transition-colors">
                      <td className="px-5 py-4 text-[#455250] whitespace-nowrap">
                        {new Date(h.requestedAt || h.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                      </td>
                      <td className="px-5 py-4 text-[#455250] whitespace-nowrap">
                        {h.processedAt ? new Date(h.processedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-[#202828]">₹{h.amount?.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[h.status] || 'bg-gray-100 text-gray-500'}`}>
                          <Icon size={12} />
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerWithdrawals;