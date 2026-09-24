import { useState, useEffect, useCallback } from 'react';
import { History, Search, Filter, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

const STATUS_ICONS: Record<string, any> = {
  Paid: CheckCircle,
  Pending: Clock,
  Failed: AlertCircle,
};

const TrainerPaymentsReceived = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

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

  const filtered = payments.filter(p => {
    const method = p.paymentMethod?.toLowerCase() || '';
    const matchSearch = method.includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.paymentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalReceived = payments.filter(p => p.paymentStatus === 'Paid').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#202828]">Payments Received</h1>
          <p className="text-[#687B78] text-sm mt-1">History of all payments received from the Gym Owner.</p>
        </div>
        <div className="bg-[#F1F5F3] border border-[#D3DFDA] rounded-xl px-5 py-3 text-right">
          <p className="text-xs text-[#687B78]">Total Received</p>
          <p className="text-xl font-bold text-[#164A4A]">₹{totalReceived.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8ADA9]" />
          <input
            type="text"
            placeholder="Search method..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 border border-[#E8E5DA] rounded-xl text-sm outline-none focus:border-[#164A4A] focus:ring-1 focus:ring-[#164A4A]/30 w-48"
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-[#E8E5DA] rounded-xl px-3 py-2">
          <Filter size={14} className="text-[#A8ADA9]" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm outline-none bg-transparent text-[#455250]">
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-[#E8E5DA] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#164A4A]/30 border-t-[#164A4A] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <History size={48} className="text-[#CBD5E1] mb-4" />
            <h3 className="text-[#202828] font-semibold text-lg">No Payments Found</h3>
            <p className="text-[#687B78] text-sm mt-1">You haven't received any payments yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F2EFE8] border-b border-[#E8E5DA]">
                  <th className="px-6 py-4 text-xs font-bold text-[#687B78] uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#687B78] uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#687B78] uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#687B78] uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#687B78] uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filtered.map(payment => {
                  const Icon = STATUS_ICONS[payment.paymentStatus] || CheckCircle;
                  return (
                    <tr key={payment._id} className="hover:bg-[#F2EFE8] transition-colors">
                      <td className="px-6 py-4 text-sm text-[#455250]">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-[#202828]">
                        ₹{payment.amount}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#455250]">
                        {payment.paymentMethod}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#687B78]">
                        {payment.transactionId || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          payment.paymentStatus === 'Paid' ? 'bg-[#D2B48C]/10 text-[#164A4A]' : 'bg-amber-100 text-amber-700'
                        }`}>
                          <Icon size={14} /> {payment.paymentStatus}
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

export default TrainerPaymentsReceived;
