import { useState, useEffect, useCallback } from 'react';
import { History, Filter, Search, CheckCircle, XCircle, Clock, AlertCircle, ArrowRight, FileText, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { exportToPDF } from '../../utils/export';
import TrainerNavigationTabs from '../../components/GymAdmin/TrainerNavigationTabs';

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

const GymAdminTrainerPaymentHistory = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const branchParam = user?.branchId ? `?branchId=${user.branchId}` : '';
      const res = await api.get(`/trainer-payments/history${branchParam}`);
      setPayments(res.data.payments || []);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [user?.branchId]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const filtered = payments.filter(p => {
    const name = p.trainerId?.name?.toLowerCase() || '';
    const matchSearch = name.includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || p.paymentStatus === statusFilter;
    const matchMethod = methodFilter === 'All' || p.paymentMethod === methodFilter;
    return matchSearch && matchStatus && matchMethod;
  });

  const totalPaid = filtered.filter(p => p.paymentStatus === 'Paid').reduce((s, p) => s + p.amount, 0);

  const handleDownloadAllPDF = () => {
    const columns = ['Date', 'Trainer', 'Training Type', 'Amount (INR)', 'Payment Method', 'Status', 'Transaction ID'];
    const data = filtered.map(p => [
      p.createdAt ? new Date(p.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '-',
      p.trainerId?.name || 'Unknown',
      p.trainerFeeId?.trainingType || '-',
      `Rs. ${p.amount?.toLocaleString('en-IN')}`,
      p.paymentMethod || '-',
      p.paymentStatus || '-',
      p.transactionId || 'N/A'
    ]);
    exportToPDF({
      filename: `Trainer_Payment_History_${new Date().toISOString().split('T')[0]}`,
      columns,
      data,
      title: 'Trainer Payment History'
    });
  };

  const handleDownloadSinglePDF = (p: any) => {
    const doc = new jsPDF();
    const trainerName = p.trainerId?.name || 'Unknown';
    const dateFormatted = p.createdAt || p.paymentDate
      ? new Date(p.createdAt || p.paymentDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
      : new Date().toLocaleDateString('en-IN');

    // Header banner
    doc.setFillColor(22, 74, 74);
    doc.rect(0, 0, 210, 32, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('TRAINER PAYMENT RECEIPT', 14, 21);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Receipt #: ${p.transactionId || p._id?.slice(-8).toUpperCase() || 'REC-001'}`, 140, 21);

    // Metadata
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(10);
    doc.text(`Issued Date: ${dateFormatted}`, 14, 42);
    doc.text(`Status: ${p.paymentStatus || 'Paid'}`, 14, 48);

    const infoRows: any[] = [
      ['Trainer Name', trainerName],
      ['Training Type', p.trainerFeeId?.trainingType || '-'],
      ['Amount Paid', `Rs. ${p.amount?.toLocaleString('en-IN')}`],
    ];

    infoRows.push(
      ['Payment Method', p.paymentMethod || '-'],
      ['Payment Status', p.paymentStatus || '-'],
      ['Transaction ID', p.transactionId || 'N/A'],
      ['Date & Time', dateFormatted],
      ['Notes / Remarks', p.notes || 'None']
    );

    autoTable(doc, {
      startY: 55,
      head: [['Payment Information', 'Details']],
      body: infoRows,
      theme: 'grid',
      headStyles: { fillColor: [22, 74, 74], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 5 }
    });

    const finalY = (doc as any).lastAutoTable?.finalY || 135;
    doc.setFontSize(9);
    doc.setTextColor(130, 130, 130);
    doc.text('This receipt was generated electronically and is valid without signature.', 14, finalY + 14);

    const safeName = trainerName.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Trainer_Receipt_${safeName}_${p._id?.slice(-6) || 'receipt'}.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <TrainerNavigationTabs />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">Trainer Payment History</h1>
          <p className="text-[#64748B] text-sm mt-1">Complete record of all trainer payments</p>
        </div>
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-5 py-3 text-right">
          <p className="text-xs text-[#64748B]">Total Paid Out</p>
          <p className="text-xl font-bold text-[#EA580C]">₹{totalPaid.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              placeholder="Search trainer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2.5 border border-[#F8FAFC] rounded-xl text-sm outline-none focus:border-[#FDBA74] focus:ring-1 focus:ring-[#F97316]/30 w-48"
            />
          </div>
          <div className="flex items-center gap-2 bg-[#FFFFFF] border border-[#F8FAFC] rounded-xl px-3 py-2">
            <Filter size={14} className="text-[#64748B]" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm outline-none bg-transparent text-[#64748B]">
              <option value="All">All Status</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-[#FFFFFF] border border-[#F8FAFC] rounded-xl px-3 py-2">
            <Filter size={14} className="text-[#64748B]" />
            <select value={methodFilter} onChange={e => setMethodFilter(e.target.value)} className="text-sm outline-none bg-transparent text-[#64748B]">
              <option value="All">All Methods</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="UPI">UPI</option>
            </select>
          </div>
        </div>

        {/* Global Download PDF Button */}
        <button
          onClick={handleDownloadAllPDF}
          disabled={filtered.length === 0}
          className="inline-flex items-center gap-2 bg-[#C2410C] text-white font-bold px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#9A3412] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Download size={15} />
          Download PDF
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#FFFFFF] border border-[#F8FAFC] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#FDBA74] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 rounded-full bg-[#F8FAFC] flex items-center justify-center mx-auto mb-4">
              <History size={28} className="text-[#64748B]" />
            </div>
            <p className="text-[#111827] font-bold text-lg">No payment records yet</p>
            <p className="text-[#64748B] text-sm mt-2 max-w-sm mx-auto">
              Payment records appear here after you process trainer payments. Start by configuring trainer fees.
            </p>
            <Link
              to="/admin/trainer-fees/settings"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-[#C2410C] text-white font-bold rounded-xl text-sm font-bold hover:bg-[#9A3412] transition-colors shadow-lg shadow-orange-500/15"
            >
              Configure Trainer Fees
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#F8FAFC]">
                  <th className="px-5 py-3.5 font-semibold text-[#64748B]">Date</th>
                  <th className="px-5 py-3.5 font-semibold text-[#64748B]">Trainer</th>
                  <th className="px-5 py-3.5 font-semibold text-[#64748B]">Training Type</th>
                  <th className="px-5 py-3.5 font-semibold text-[#64748B] text-right">Amount</th>
                  <th className="px-5 py-3.5 font-semibold text-[#64748B]">Payment Method</th>
                  <th className="px-5 py-3.5 font-semibold text-[#64748B]">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-[#64748B] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8FAFC]">
                {filtered.map(p => {
                  const Icon = STATUS_ICONS[p.paymentStatus] || Clock;
                  return (
                    <tr key={p._id} className="hover:bg-[#FFF7ED] transition-colors">
                      <td className="px-5 py-4 text-[#64748B] whitespace-nowrap">
                        {p.createdAt ? new Date(p.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#EA580C] to-[#C2410C] flex items-center justify-center text-[#FFFFFF] font-bold font-bold text-xs shrink-0">
                            {p.trainerId?.name?.[0] || 'T'}
                          </div>
                          <span className="font-semibold text-[#111827]">{p.trainerId?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[#64748B]">{p.trainerFeeId?.trainingType || '-'}</td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-bold text-[#111827] block">₹{p.amount?.toLocaleString('en-IN')}</span>
                      </td>
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
                          className="px-3 py-1.5 text-xs font-semibold text-[#9A3412] hover:bg-[#FFF7ED] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-[#E2E8F0] flex flex-col max-h-[calc(100vh-6rem)] mt-16 sm:mt-20 mb-12 shrink-0">
            <div className="flex items-center justify-between p-4 border-b border-[#F8FAFC] bg-[#F8FAFC] shrink-0">
              <h3 className="font-bold text-[#111827]">Payment Details</h3>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-[#64748B] hover:text-[#C2410C] p-1.5 hover:bg-[#FFF7ED] rounded-lg transition-colors cursor-pointer"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0]">
                <div className="flex justify-between items-center">
                  <span className="text-[#EA580C] text-sm font-semibold">Amount Paid</span>
                  <span className="text-2xl font-black text-[#EA580C]">₹{selectedPayment.amount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-[#64748B] mb-1">Trainer</p>
                  <p className="font-semibold text-[#111827]">
                    {selectedPayment.trainerId?.name || 'Unknown'}
                  </p>
                </div>
                <div>
                  <p className="text-[#64748B] mb-1">Training Type</p>
                  <p className="font-semibold text-[#111827]">{selectedPayment.trainerFeeId?.trainingType || '-'}</p>
                </div>
                <div>
                  <p className="text-[#64748B] mb-1">Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold w-fit ${STATUS_COLORS[selectedPayment.paymentStatus] || 'bg-[#F8FAFC] text-[#64748B]'}`}>
                    {selectedPayment.paymentStatus}
                  </span>
                </div>
                <div>
                  <p className="text-[#64748B] mb-1">Date</p>
                  <p className="font-semibold text-[#111827]">
                    {selectedPayment.paymentDate || selectedPayment.createdAt
                      ? new Date(selectedPayment.paymentDate || selectedPayment.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
                      : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-[#64748B] mb-1">Payment Method</p>
                  <p className="font-semibold text-[#111827]">{selectedPayment.paymentMethod || '-'}</p>
                </div>
                <div>
                  <p className="text-[#64748B] mb-1">Transaction ID</p>
                  <p className="font-mono font-semibold text-[#111827]">{selectedPayment.transactionId || 'N/A'}</p>
                </div>
              </div>

              {selectedPayment.paymentProof ? (
                <div className="pt-3 border-t border-[#E2E8F0]">
                  <a
                    href={selectedPayment.paymentProof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#F8FAFC] text-[#EA580C] text-sm font-bold rounded-lg hover:bg-[#FFF7ED] transition-colors"
                  >
                    <FileText size={16} />
                    View Payment Proof
                  </a>
                </div>
              ) : null}

              {selectedPayment.notes && (
                <div className="pt-3 border-t border-[#E2E8F0]">
                  <p className="text-[#64748B] mb-1 text-sm">Notes</p>
                  <p className="text-sm text-[#111827] bg-[#F8FAFC] p-3 rounded-lg border border-[#E2E8F0]">{selectedPayment.notes}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-[#F8FAFC] border-t border-[#F8FAFC] flex justify-end gap-3 shrink-0">
              <button
                onClick={() => handleDownloadSinglePDF(selectedPayment)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#C2410C] text-white font-bold rounded-xl text-sm font-bold hover:bg-[#9A3412] transition-colors shadow-sm cursor-pointer"
              >
                <Download size={15} />
                Download PDF
              </button>
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-4 py-2 bg-[#FFFFFF] border border-[#F8FAFC] text-[#64748B] rounded-xl text-sm font-bold hover:bg-[#FFF7ED] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminTrainerPaymentHistory;
