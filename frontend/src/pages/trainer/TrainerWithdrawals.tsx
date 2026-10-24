import { useState, useEffect, useCallback } from 'react';
import { History, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

const STATUS_COLORS: Record<string, string> = {
  Approved: 'bg-[#1B2728]/10 text-[#2DD4BF]',
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
          <h1 className="text-2xl font-bold text-[#F5FAFA]">Withdrawal History</h1>
          <p className="text-[#9AAEAE] text-sm mt-1">Your past payout requests and their status</p>
        </div>
      </div>

      <div className="bg-[#141D1E] border border-[#1B2728] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#2DD4BF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <div className="text-center py-20">
            <History size={40} className="mx-auto text-[#2A3A3A] mb-3" />
            <p className="text-[#9AAEAE] font-semibold">No withdrawal history</p>
            <p className="text-[#9AAEAE] text-sm mt-1">You haven't had any processed withdrawals yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#0E1415] border-b border-[#1B2728]">
                  <th className="px-5 py-3.5 font-semibold text-[#9AAEAE]">Date Requested</th>
                  <th className="px-5 py-3.5 font-semibold text-[#9AAEAE]">Processed At</th>
                  <th className="px-5 py-3.5 font-semibold text-[#9AAEAE] text-right">Amount</th>
                  <th className="px-5 py-3.5 font-semibold text-[#9AAEAE] text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0E1415]">
                {history.map((h, idx) => {
                  const Icon = STATUS_ICONS[h.status] || AlertCircle;
                  return (
                    <tr key={idx} className="hover:bg-[#0E1415] transition-colors">
                      <td className="px-5 py-4 text-[#9AAEAE] whitespace-nowrap">
                        {new Date(h.requestedAt || h.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })}
                      </td>
                      <td className="px-5 py-4 text-[#9AAEAE] whitespace-nowrap">
                        {h.processedAt ? new Date(h.processedAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-[#F5FAFA]">₹{h.amount?.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 text-right">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[h.status] || 'bg-[#1B2728] text-[#9AAEAE]'}`}>
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