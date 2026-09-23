import { useState, useEffect, useCallback } from 'react';
import { History, Filter, Search, CheckCircle, XCircle, Clock, AlertCircle, ArrowRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const STATUS_COLORS: Record<string, string> = {
  Paid: 'bg-green-100 text-green-700',
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

const GymAdminTrainerPaymentHistory = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/trainer-payments/history');
      setPayments(res.data.payments || []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const filtered = payments.filter(p => {
    const name = p.trainerId?.name?.toLowerCase() || '';
    const matchSearch = name.includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.paymentStatus === statusFilter;
    const matchMethod = methodFilter === 'All' || p.paymentMethod === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  });

  const totalPaid = filtered.filter(p => p.paymentStatus === 'Paid').reduce((s, p) => s + p.amount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#202522]">Trainer Payment History</h1>
          <p className="text-[#727975] text-sm mt-1">Complete record of all trainer payments</p>
        </div>
        <div className="bg-[#F5F3EE] border border-[#DCD9CD] rounded-xl px-5 py-3 text-right">
          <p className="text-xs text-[#727975]">Total Paid Out</p>
          <p className="text-xl font-bold text-[#34483F]">₹{totalPaid.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8ADA9]" />
          <input
            type="text"
            placeholder="Search trainer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 border border-[#E8E5DA] rounded-xl text-sm outline-none focus:border-[#34483F] focus:ring-1 focus:ring-[#34483F]/30 w-48"
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-[#E8E5DA] rounded-xl px-3 py-2">
          <Filter size={14} className="text-[#A8ADA9]" />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm outline-none bg-transparent text-[#4A514D]">
            <option value="All">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div className="flex items-center gap-2 bg-white border border-[#E8E5DA] rounded-xl px-3 py-2">
          <Filter size={14} className="text-[#A8ADA9]" />
          <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="text-sm outline-none bg-transparent text-[#4A514D]">
            <option value="All">All Methods</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="UPI">UPI</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E8E5DA] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#34483F] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
              <History size={28} className="text-slate-300" />
            </div>
            <p className="text-[#202522] font-bold text-lg">No payment records yet</p>
            <p className="text-[#727975] text-sm mt-2 max-w-sm mx-auto">
              Payment records appear here after you process trainer payments. Start by configuring trainer fees.
            </p>
            <Link
              to="/admin/trainer-fees/settings"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-[#34483F] text-white rounded-xl text-sm font-bold hover:bg-[#C6A77D] transition-colors shadow-lg shadow-green-200"
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
                  <th className="px-5 py-3.5 font-semibold text-[#727975]">Date</th>
                  <th className="px-5 py-3.5 font-semibold text-[#727975]">Trainer</th>
                  <th className="px-5 py-3.5 font-semibold text-[#727975]">Training Type</th>
                  <th className="px-5 py-3.5 font-semibold text-[#727975] text-right">Amount</th>
                  <th className="px-5 py-3.5 font-semibold text-[#727975]">Payment Method</th>
                  <th className="px-5 py-3.5 font-semibold text-[#727975]">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-[#727975] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {filtered.map(p => {
                  const Icon = STATUS_ICONS[p.paymentStatus] || Clock;
                  return (
                    <tr key={p._id} className="hover:bg-[#F2EFE8] transition-colors">
                      <td className="px-5 py-4 text-[#4A514D] whitespace-nowrap">
                        {p.createdAt ? new Date(p.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#34483F] to-[#8FA89B] flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {p.trainerId?.name?.[0] || 'T'}
                          </div>
                          <span className="font-semibold text-[#202522]">{p.trainerId?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#4A514D]">{p.trainerFeeId?.trainingType || '-'}</td>
                      <td className="px-5 py-4 text-right font-bold text-[#202522]">₹{p.amount?.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-4 text-[#4A514D]">{p.paymentMethod}</td>

                      <td className="px-5 py-4">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit ${STATUS_COLORS[p.paymentStatus] || 'bg-gray-100 text-gray-500'}`}>
                          <Icon size={12} />
                          {p.paymentStatus}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="px-3 py-1.5 text-xs font-semibold text-[#3B82F6] hover:bg-blue-50 rounded-lg transition-colors whitespace-nowrap"
                        >
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

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[#E8E5DA] bg-[#F2EFE8]">
              <h3 className="font-bold text-[#202522]">Payment Details</h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-[#727975] hover:text-[#202522]"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                <span className="text-gray-500 text-sm font-medium">Amount</span>
                <span className="text-2xl font-bold text-[#202522]">₹{selectedPayment.amount?.toLocaleString('en-IN')}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Trainer</p>
                  <p className="font-semibold text-gray-900">
                    {selectedPayment.trainerId?.name || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Training Type</p>
                  <p className="font-semibold text-gray-900">{selectedPayment.trainerFeeId?.trainingType || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit ${STATUS_COLORS[selectedPayment.paymentStatus] || 'bg-gray-100 text-gray-500'}`}>
                    {selectedPayment.paymentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Date</p>
                  <p className="font-semibold text-gray-900">
                    {selectedPayment.paymentDate || selectedPayment.createdAt
                      ? new Date(selectedPayment.paymentDate || selectedPayment.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Payment Method</p>
                  <p className="font-semibold text-gray-900">{selectedPayment.paymentMethod || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Transaction ID</p>
                  <p className="font-mono font-semibold text-gray-900">{selectedPayment.transactionId || 'N/A'}</p>
                </div>
              </div>

              {selectedPayment.paymentProof ? (
                <div className="pt-3 border-t border-gray-100">
                  <a
                    href={selectedPayment.paymentProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-sm font-bold rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <FileText size={16} />
                    View Payment Proof
                  </a>
                </div>
              ) : null}

              {selectedPayment.notes && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-gray-500 mb-1 text-sm">Notes</p>
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

export default GymAdminTrainerPaymentHistory;
