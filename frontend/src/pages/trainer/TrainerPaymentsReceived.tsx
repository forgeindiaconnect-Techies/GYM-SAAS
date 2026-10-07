import { useState, useEffect, useCallback } from 'react';
import { History, Search, Filter, CheckCircle, Clock, AlertCircle, Eye, X, CreditCard, Calendar, Hash, IndianRupee, Smartphone } from 'lucide-react';
import api from '../../utils/api';

const STATUS_ICONS: Record<string, any> = {
  Paid: CheckCircle,
  Pending: Clock,
  Failed: AlertCircle,
};

// dateStr = for the date display (paymentDate — may be date-only midnight UTC)
// timeStr = for the time display (createdAt — always has real timestamp)
const formatDateTime = (dateStr: string, timeStr?: string) => {
  if (!dateStr) return { date: 'N/A', time: 'N/A' };

  // Parse date: if it's a date-only string (YYYY-MM-DD) or midnight UTC,
  // treat it as local date to avoid timezone shift (00:00 UTC → 05:30 IST)
  let datePart = 'N/A';
  const dateOnly = /^\d{4}-\d{2}-\d{2}(T00:00:00(\.000)?Z?)?$/.test(dateStr);
  if (dateOnly) {
    // Parse as local: take just the date portion
    const [year, month, day] = dateStr.substring(0, 10).split('-').map(Number);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    datePart = `${String(day).padStart(2, '0')} ${months[month - 1]} ${year}`;
  } else {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      datePart = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  }

  // Parse time from timeStr (createdAt) if provided, else fall back to dateStr
  let timePart = 'N/A';
  const tSrc = timeStr || dateStr;
  const tDate = new Date(tSrc);
  if (!isNaN(tDate.getTime())) {
    // Only show time if it's not midnight (i.e., has real time info)
    const hours = tDate.getHours();
    const mins = tDate.getMinutes();
    if (hours !== 0 || mins !== 0) {
      timePart = tDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    } else {
      timePart = '—';
    }
  }

  return { date: datePart, time: timePart };
};

const METHOD_COLORS: Record<string, string> = {
  UPI:          'bg-emerald-50 text-emerald-700 border-emerald-200',
  Cash:         'bg-amber-50 text-amber-700 border-amber-200',
  'Bank Transfer': 'bg-blue-50 text-blue-700 border-blue-200',
  Cheque:       'bg-purple-50 text-purple-700 border-purple-200',
};

const TrainerPaymentsReceived = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);

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
    const ref = p.transactionId?.toLowerCase() || '';
    const matchSearch = method.includes(search.toLowerCase()) || ref.includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.paymentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalReceived = payments.filter(p => p.paymentStatus === 'Paid').reduce((s, p) => s + p.amount, 0);
  const pendingCount = payments.filter(p => p.paymentStatus === 'Pending').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#292524]">Payments Received</h1>
          <p className="text-[#78716C] text-sm mt-1">History of all payments received from the Gym Owner.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-5 py-3 text-right">
            <p className="text-xs text-[#78716C]">Total Received</p>
            <p className="text-xl font-bold text-[#F97316]">₹{totalReceived.toLocaleString('en-IN')}</p>
          </div>
          {pendingCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-3 text-right">
              <p className="text-xs text-amber-600">Pending</p>
              <p className="text-xl font-bold text-amber-700">{pendingCount}</p>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" />
          <input
            type="text"
            placeholder="Search method or reference..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 border border-[#FED7AA] rounded-xl text-sm outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 w-56"
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-[#FED7AA] rounded-xl px-3 py-2">
          <Filter size={14} className="text-[#78716C]" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm outline-none bg-transparent text-[#78716C]">
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#FED7AA] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#F97316]/30 border-t-[#F97316] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <History size={48} className="text-[#CBD5E1] mb-4" />
            <h3 className="text-[#292524] font-semibold text-lg">No Payments Found</h3>
            <p className="text-[#78716C] text-sm mt-1">You haven't received any payments yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFFDF8] border-b border-[#FED7AA]">
                  <th className="px-6 py-4 text-xs font-bold text-[#78716C] uppercase tracking-wider">Date &amp; Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#78716C] uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#78716C] uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#78716C] uppercase tracking-wider">Reference</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#78716C] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#78716C] uppercase tracking-wider text-center">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filtered.map(payment => {
                  const Icon = STATUS_ICONS[payment.paymentStatus] || CheckCircle;
                  const { date, time } = formatDateTime(payment.paymentDate || payment.createdAt, payment.createdAt);
                  const methodColor = METHOD_COLORS[payment.paymentMethod] || 'bg-gray-50 text-gray-600 border-gray-200';
                  return (
                    <tr key={payment._id} className="hover:bg-[#F8FAF9] transition-colors">
                      {/* Date & Time */}
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <Calendar size={14} className="text-[#78716C] mt-0.5 shrink-0" />
                          <div>
                            <div className="text-sm font-semibold text-[#292524]">{date}</div>
                            <div className="text-xs text-[#78716C] mt-0.5">{time}</div>
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <IndianRupee size={14} className="text-[#F97316]" />
                          <span className="text-sm font-bold text-[#292524]">{Number(payment.amount).toLocaleString('en-IN')}</span>
                        </div>
                      </td>

                      {/* Method */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${methodColor}`}>
                          <Smartphone size={11} />
                          {payment.paymentMethod}
                        </span>
                      </td>

                      {/* Reference */}
                      <td className="px-6 py-4 text-sm text-[#78716C] font-mono">
                        {payment.transactionId ? (
                          <span className="bg-[#FFFDF8] px-2 py-0.5 rounded text-xs">{payment.transactionId}</span>
                        ) : '-'}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          payment.paymentStatus === 'Paid'    ? 'bg-[#F97316]/10 text-[#F97316]' :
                          payment.paymentStatus === 'Failed'  ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          <Icon size={13} /> {payment.paymentStatus}
                        </span>
                      </td>

                      {/* View Details */}
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
                          title="View full payment details"
                        >
                          <Eye size={13} />
                          View Details
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

      {/* ---- View Details Modal ---- */}
      {selectedPayment && (() => {
        const Icon = STATUS_ICONS[selectedPayment.paymentStatus] || CheckCircle;
        const { date, time } = formatDateTime(selectedPayment.paymentDate || selectedPayment.createdAt, selectedPayment.createdAt);
        const methodColor = METHOD_COLORS[selectedPayment.paymentMethod] || 'bg-gray-50 text-gray-600 border-gray-200';
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-[#E7E5E4] overflow-hidden my-auto max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-3.5 bg-gradient-to-r from-[#F97316] to-[#1a5c5c] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                    <CreditCard size={18} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Payment Details</h2>
                    <p className="text-xs text-white/70">Full transaction information</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status Banner */}
              <div className={`px-6 py-2.5 flex items-center gap-2 text-sm font-semibold border-b shrink-0 ${
                selectedPayment.paymentStatus === 'Paid'   ? 'bg-green-50 text-green-700 border-green-200' :
                selectedPayment.paymentStatus === 'Failed' ? 'bg-red-50 text-red-700 border-red-200' :
                'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                <Icon size={16} />
                {selectedPayment.paymentStatus === 'Paid'   ? 'Payment Successfully Received' :
                 selectedPayment.paymentStatus === 'Failed' ? 'Payment Failed' :
                 'Payment Pending Confirmation'}
              </div>

              {/* Details Body */}
              <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 min-h-0 custom-scrollbar">
                {/* Amount */}
                <div className="bg-[#F8FAF9] border border-[#E7E5E4] rounded-xl p-3.5 text-center">
                  <p className="text-xs text-[#78716C] uppercase font-semibold tracking-wider mb-1">Exact Amount Received</p>
                  <p className="text-3xl font-bold text-[#F97316]">₹{Number(selectedPayment.amount).toLocaleString('en-IN')}</p>
                  {selectedPayment.trainerFeeId?.feeAmount && selectedPayment.trainerFeeId.feeAmount !== selectedPayment.amount && (
                    <div className="mt-2 pt-2 border-t border-[#E7E5E4]/60 flex justify-between text-xs text-[#78716C] font-medium px-2">
                      <span>Base Fee: ₹{Number(selectedPayment.trainerFeeId.feeAmount).toLocaleString('en-IN')}</span>
                      <span>Commission: –₹{(selectedPayment.trainerFeeId.feeAmount - selectedPayment.amount).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>

                {/* Grid Info */}
                <div className="border border-[#E7E5E4] rounded-xl overflow-hidden divide-y divide-[#E7E5E4] bg-white shadow-sm">
                  <div className="grid grid-cols-2 divide-x divide-[#E7E5E4]">
                    <div className="p-3 bg-white flex flex-col justify-center">
                      <div className="flex items-center gap-1.5 text-[#78716C] mb-1">
                        <Calendar size={12} />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Date</span>
                      </div>
                      <p className="text-sm font-semibold text-[#292524]">{date}</p>
                    </div>
                    <div className="p-3 bg-white flex flex-col justify-center">
                      <div className="flex items-center gap-1.5 text-[#78716C] mb-1">
                        <Clock size={12} />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Time</span>
                      </div>
                      <p className="text-sm font-semibold text-[#292524]">{time}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 divide-x divide-[#E7E5E4]">
                    <div className="p-3 bg-white flex flex-col justify-center">
                      <div className="flex items-center gap-1.5 text-[#78716C] mb-1">
                        <Smartphone size={12} />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Method</span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border w-fit ${methodColor}`}>
                        {selectedPayment.paymentMethod}
                      </span>
                    </div>
                    <div className="p-3 bg-white flex flex-col justify-center">
                      <div className="flex items-center gap-1.5 text-[#78716C] mb-1">
                        <Hash size={12} />
                        <span className="text-[10px] uppercase font-bold tracking-wider">Reference / UTR</span>
                      </div>
                      <p className="text-sm font-mono font-semibold text-[#292524] break-all">
                        {selectedPayment.transactionId || <span className="text-[#78716C] italic font-normal text-xs">Not provided</span>}
                      </p>
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedPayment.notes && (
                    <div className="p-3 bg-white flex flex-col justify-center">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#78716C] mb-1">Notes / Remarks</p>
                      <p className="text-sm text-[#78716C]">{selectedPayment.notes}</p>
                    </div>
                  )}

                  {/* UPI App if present */}
                  {selectedPayment.upiApp && (
                    <div className="p-3 bg-emerald-50/50 flex flex-col justify-center">
                      <p className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 mb-1">UPI App Used</p>
                      <p className="text-sm font-semibold text-emerald-800">{selectedPayment.upiApp}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-3.5 bg-[#F8FAF9] border-t border-[#E7E5E4] flex justify-end shrink-0">
                <button
                  onClick={() => setSelectedPayment(null)}
                  className="px-6 py-2 bg-[#F97316] hover:bg-[#EA580C] text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default TrainerPaymentsReceived;
