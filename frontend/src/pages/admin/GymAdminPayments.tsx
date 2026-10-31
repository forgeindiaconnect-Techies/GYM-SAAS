import { useState, useEffect } from 'react';
import {
  IndianRupee, Download, Search, CheckCircle, XCircle, Loader2,
  FileText, RotateCcw, Mail, Send, Check
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { exportToPDF } from '../../utils/export';

const GymAdminPayments = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTrx, setSelectedTrx] = useState<any>(null);
  const [rejectingPaymentId, setRejectingPaymentId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    fetchPayments();
  }, [user]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/payments/gym' + (user?.branchId ? `?branchId=${user.branchId}` : ''));
      setPayments(res.data.payments || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const handleVerify = async (id: string, status: 'Approve' | 'Reject' | 'Pending', reason?: string) => {
    if (status !== 'Reject' && !window.confirm(`Are you sure you want to ${status.toLowerCase()} this payment?`)) return;

    try {
      await api.post(`/payments/verify/${id}`, { status, rejectionReason: reason || '' });
      showToast(`Payment ${status.toLowerCase()}d successfully.`);
      fetchPayments();
      setRejectingPaymentId(null);
      setRejectionReasonInput('');
      if (selectedTrx && selectedTrx._id === id) {
        setSelectedTrx(null);
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      alert(err.response?.data?.message || 'Verification failed');
    }
  };

  const handleResendConfirmationEmail = async (membershipRecordId: string) => {
    if (!membershipRecordId) {
      alert('No customer membership record linked to this transaction.');
      return;
    }
    try {
      setResendingId(membershipRecordId);
      const res = await api.post(`/memberships/${membershipRecordId}/resend-email`);
      if (res.data?.success) {
        showToast('Membership confirmation email dispatched to customer successfully!');
        fetchPayments();
      } else {
        alert(res.data?.message || 'Failed to dispatch confirmation email');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error triggering email dispatch');
    } finally {
      setResendingId(null);
    }
  };

  const exportToCSV = () => {
    const headers = ['Transaction ID', 'Customer', 'Email', 'Plan', 'Membership ID', 'Date', 'Amount (₹)', 'Method', 'Email Status', 'Status'];
    const rows = filtered.map(trx => [
      trx.transactionId || 'N/A',
      `${trx.customerId?.firstName || ''} ${trx.customerId?.lastName || ''}`.trim(),
      trx.customerId?.email || 'N/A',
      trx.planName,
      trx.membershipId?.membershipId || 'N/A',
      new Date(trx.paymentDate || trx.createdAt).toLocaleDateString(),
      trx.amount,
      trx.paymentMethod,
      trx.membershipId?.confirmationEmailStatus || 'N/A',
      trx.status,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filtered = payments.filter(trx => {
    const isTrial = (trx.planName || '').toLowerCase().includes('trial') || trx.paymentMethod === 'Trial' || trx.amount === 0;
    if (activeTab === 'manual' && (trx.paymentMethod !== 'Bank Transfer' || isTrial)) return false;
    if (activeTab === 'qr' && (trx.paymentMethod === 'Bank Transfer' || isTrial)) return false;
    if (activeTab === 'trial' && !isTrial) return false;

    const s = search.toLowerCase();
    const fullName = `${trx.customerId?.firstName || ''} ${trx.customerId?.lastName || ''}`.toLowerCase();
    const custEmail = (trx.customerId?.email || '').toLowerCase();
    const memId = (trx.membershipId?.membershipId || '').toLowerCase();
    
    return (
      (trx.transactionId || '').toLowerCase().includes(s) ||
      fullName.includes(s) ||
      custEmail.includes(s) ||
      memId.includes(s) ||
      (trx.planName || '').toLowerCase().includes(s) ||
      (trx.status || '').toLowerCase().includes(s) ||
      (trx.paymentMethod || '').toLowerCase().includes(s) ||
      (trx.customerBankDetails?.accountNumber || '').toLowerCase().includes(s) ||
      (trx.customerBankDetails?.bankName || '').toLowerCase().includes(s)
    );
  });

  const handleDownloadPDF = () => {
    const columns = ['Date', 'Customer', 'Plan', 'Membership ID', 'Amount (INR)', 'Method', 'Status'];
    const data = filtered.map((p: any) => {
      const customerName = `${p.customerId?.firstName || ''} ${p.customerId?.lastName || ''}`.trim() || p.customerBankDetails?.fullName || 'Unknown';
      const isTrial = (p.planName || '').toLowerCase().includes('trial') || p.paymentMethod === 'Trial' || p.amount === 0;
      return [
        p.paymentDate || p.createdAt ? new Date(p.paymentDate || p.createdAt).toLocaleString('en-IN') : '-',
        customerName,
        p.planName || '-',
        p.membershipId?.membershipId || 'N/A',
        isTrial ? 'Rs. 0 (Free Trial)' : `Rs. ${(p.amount || 0).toLocaleString('en-IN')}`,
        p.paymentMethod || '-',
        p.status || '-'
      ];
    });
    exportToPDF({
      filename: `Payments_Report_${new Date().toISOString().split('T')[0]}`,
      columns,
      data,
      title: 'Payments & Subscriptions Report'
    });
  };

  return (
    <div className="space-y-6 text-[#FFFFFF]">
      {toastMessage && (
        <div className="p-4 bg-[#FFF7ED] border border-[#FFEDD5] text-[#FFFFFF] font-bold rounded-2xl text-xs font-semibold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <Check className="text-[#15803D]" size={16} />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage('')} className="text-[#64748B] hover:text-[#C2410C] cursor-pointer"><XCircle size={16} /></button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#111827] tracking-tight">Customer Membership Sales &amp; Payments</h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Track customer package payments, verify offline transactions, and monitor confirmation email delivery status.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E2E8F0] space-x-6 overflow-x-auto pb-1 text-sm font-bold">
        {[
          { id: 'all', label: `All Transactions (${payments.length})` },
          { id: 'manual', label: 'Bank Transfers' },
          { id: 'qr', label: 'UPI / Online' },
          { id: 'trial', label: `Free Trials (${payments.filter(p => (p.planName || '').toLowerCase().includes('trial') || p.paymentMethod === 'Trial' || p.amount === 0).length})` }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-3 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'border-[#EA580C] text-[#EA580C] font-extrabold'
                : 'border-transparent text-[#64748B] hover:text-[#EA580C]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* Revenue Highlight Card */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-6 relative overflow-hidden flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[#64748B] text-xs font-bold uppercase tracking-wider mb-1">Total Customer Package Revenue</p>
            <h3 className="text-3xl font-black text-[#EA580C]">
              ₹{payments.filter(p => p.status === 'Approved').reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString('en-IN')}
            </h3>
            <p className="text-[11px] text-[#64748B] mt-1">Verified earnings across active member packages</p>
          </div>
          <IndianRupee size={48} className="text-[#EA580C]/20" />
        </div>

        {/* Filter and Table Container */}
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-[#E2E8F0] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-base font-bold text-[#111827]">Membership Purchase Records</h3>
            
            <div className="flex gap-3 w-full md:w-auto flex-wrap">
              <div className="relative flex-1 md:w-72">
                <input
                  type="text"
                  placeholder="Search customer, membership ID, TRX..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2 text-xs text-[#111827] placeholder-[#64748B] focus:border-[#FDBA74] outline-none"
                />
                <Search className="absolute left-3 top-2.5 text-[#64748B]" size={15} />
              </div>

              <button
                onClick={handleDownloadPDF}
                className="px-3.5 py-2 bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] hover:border-[#FDBA74] font-bold rounded-xl transition-colors flex items-center gap-1.5 text-xs shrink-0 cursor-pointer shadow-xs"
              >
                <Download size={14} className="text-[#EA580C]" /> PDF
              </button>

              <button
                onClick={exportToCSV}
                className="px-3.5 py-2 bg-[#F8FAFC] border border-[#E2E8F0] text-[#111827] hover:border-[#FDBA74] font-bold rounded-xl transition-colors flex items-center gap-1.5 text-xs shrink-0 cursor-pointer shadow-xs"
              >
                <Download size={14} className="text-[#EA580C]" /> CSV
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#EA580C]" size={40} /></div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] uppercase tracking-wider font-extrabold text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Payment Date</th>
                    <th className="px-5 py-3.5">Customer &amp; Email</th>
                    <th className="px-5 py-3.5">Membership &amp; Plan</th>
                    <th className="px-5 py-3.5">Amount Paid</th>
                    <th className="px-5 py-3.5">Email Delivery</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8FAFC]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-[#64748B]">No transactions match your search filter.</td>
                    </tr>
                  ) : filtered.map((trx) => {
                    const isTrial = (trx.planName || '').toLowerCase().includes('trial') || trx.paymentMethod === 'Trial' || trx.amount === 0;
                    const linkedMem = trx.membershipId;
                    const emailStatus = linkedMem?.confirmationEmailStatus || (trx.status === 'Approved' ? 'Sent' : 'Pending');
                    const memIdDisplay = linkedMem?.membershipId || (linkedMem?._id ? `MEM-${linkedMem._id.toString().slice(-6).toUpperCase()}` : 'N/A');

                    return (
                      <tr key={trx._id} className="hover:bg-[#FFFFFF] transition-colors">
                        <td className="px-5 py-4 text-[#64748B]">
                          {new Date(trx.paymentDate || trx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-bold text-[#111827] text-sm">
                            {trx.customerId?.firstName} {trx.customerId?.lastName}
                          </p>
                          <p className="text-[11px] text-[#64748B]">{trx.customerId?.email || 'No email'}</p>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-[#111827]">{trx.planName}</span>
                            {isTrial && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
                                Trial
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[11px] text-[#EA580C] block mt-0.5">
                            {memIdDisplay}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-bold text-[#111827] text-sm">
                            {isTrial ? '₹0' : `₹${Number(trx.amount || 0).toLocaleString('en-IN')}`}
                          </span>
                          <p className="text-[11px] text-[#64748B] mt-0.5">{trx.paymentMethod}</p>
                        </td>

                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            emailStatus === 'Sent'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : emailStatus === 'Failed'
                              ? 'bg-red-50 text-[#B91C1C] border-red-200'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}>
                            <Mail size={11} />
                            {emailStatus === 'Sent' ? 'Email Sent' : emailStatus === 'Failed' ? 'Email Failed' : 'Pending'}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            trx.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            trx.status === 'Rejected' ? 'bg-red-50 text-[#B91C1C] border-red-200' :
                            'bg-amber-50 text-amber-800 border-amber-300'
                          }`}>
                            {trx.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex justify-end gap-2 items-center">
                            {linkedMem?._id && trx.status === 'Approved' && (
                              <button
                                type="button"
                                disabled={resendingId === linkedMem._id}
                                onClick={() => handleResendConfirmationEmail(linkedMem._id)}
                                title="Resend confirmation email to customer"
                                className="p-1.5 bg-[#F8FAFC] hover:bg-[#FFF7ED] border border-[#E2E8F0] hover:border-[#FDBA74] text-[#EA580C] rounded-lg transition-colors cursor-pointer"
                              >
                                {resendingId === linkedMem._id ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                              </button>
                            )}

                            <button 
                              onClick={() => setSelectedTrx(trx)}
                              className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#FFF7ED] text-[#C2410C] border border-[#E2E8F0] hover:border-[#FDBA74] rounded-lg transition-colors text-xs font-bold whitespace-nowrap cursor-pointer"
                            >
                              Details
                            </button>

                            {trx.status === 'Pending Verification' && (
                              <>
                                <button onClick={() => handleVerify(trx._id, 'Approve')} className="p-1.5 bg-[#FFF7ED] text-[#15803D] border border-[#E2E8F0]/40 rounded-lg hover:bg-[#FFF7ED] transition-colors cursor-pointer" title="Approve">
                                  <CheckCircle size={16} />
                                </button>
                                <button onClick={() => setRejectingPaymentId(trx._id)} className="p-1.5 bg-red-50 text-[#B91C1C] border border-red-500/40 rounded-lg hover:bg-red-900 transition-colors cursor-pointer" title="Reject">
                                  <XCircle size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Transaction Details Modal */}
        {selectedTrx && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="bg-[#FFFFFF] rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E2E8F0] relative max-h-[88vh] overflow-y-auto text-[#FFFFFF]">
              <button onClick={() => setSelectedTrx(null)} className="absolute top-5 right-5 text-[#64748B] hover:text-[#C2410C] cursor-pointer">
                <XCircle size={22} />
              </button>
              
              <h2 className="text-xl font-black text-[#111827] mb-4 border-b border-[#E2E8F0] pb-3">Transaction &amp; Membership Details</h2>
              
              <div className="space-y-4 text-xs">
                <div className="border border-[#E2E8F0] rounded-2xl overflow-hidden divide-y divide-[#E2E8F0] bg-[#F8FAFC]">
                  <div className="grid grid-cols-2 divide-x divide-[#E2E8F0]">
                    <div className="p-3.5">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1 block">Customer</span>
                      <span className="font-bold text-sm text-[#111827]">{selectedTrx.customerId?.firstName} {selectedTrx.customerId?.lastName}</span>
                      <span className="text-[11px] text-[#64748B] block">{selectedTrx.customerId?.email}</span>
                    </div>
                    <div className="p-3.5">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1 block">Payment Date</span>
                      <span className="font-semibold text-[#111827]">{new Date(selectedTrx.paymentDate || selectedTrx.createdAt).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 divide-x divide-[#E2E8F0]">
                    <div className="p-3.5">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1 block">Plan Package</span>
                      <span className="font-bold text-sm text-[#111827]">{selectedTrx.planName}</span>
                    </div>
                    <div className="p-3.5">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1 block">Amount Paid</span>
                      <span className="font-black text-base text-[#EA580C]">₹{selectedTrx.amount}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 divide-x divide-[#E2E8F0]">
                    <div className="p-3.5">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1 block">Membership ID</span>
                      <span className="font-mono text-xs font-bold text-[#EA580C]">
                        {selectedTrx.membershipId?.membershipId || (selectedTrx.membershipId?._id ? `MEM-${selectedTrx.membershipId._id.toString().slice(-6).toUpperCase()}` : 'Not Linked')}
                      </span>
                    </div>
                    <div className="p-3.5">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1 block">Receipt Number</span>
                      <span className="font-mono text-xs font-bold text-[#111827]">
                        {selectedTrx.receiptNumber || selectedTrx.membershipId?.receiptNumber || selectedTrx.orderId || 'REC-CURRENT'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 divide-x divide-[#E2E8F0]">
                    <div className="p-3.5">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1 block">Payment Method</span>
                      <span className="font-semibold text-[#111827]">{selectedTrx.paymentMethod}</span>
                    </div>
                    <div className="p-3.5">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1 block">Verification Status</span>
                      <span className="text-[#15803D] font-bold">{selectedTrx.status}</span>
                    </div>
                  </div>

                  {/* Confirmation Email Delivery Status Card */}
                  <div className="p-3.5">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5 block">Confirmation Email Delivery</span>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          selectedTrx.membershipId?.confirmationEmailStatus === 'Sent'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}>
                          {selectedTrx.membershipId?.confirmationEmailStatus || 'Pending'}
                        </span>
                        {selectedTrx.membershipId?.confirmationEmailSentAt && (
                          <span className="text-[11px] text-[#64748B]">
                            Sent: {new Date(selectedTrx.membershipId.confirmationEmailSentAt).toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>

                      {selectedTrx.membershipId?._id && (
                        <button
                          type="button"
                          disabled={resendingId === selectedTrx.membershipId._id}
                          onClick={() => handleResendConfirmationEmail(selectedTrx.membershipId._id)}
                          className="px-3 py-1.5 bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          {resendingId === selectedTrx.membershipId._id ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                          Resend Email
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="p-3.5">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1 block">Transaction ID / Reference</span>
                    <span className="font-mono text-xs text-[#111827] break-all">{selectedTrx.transactionId || 'Not Provided'}</span>
                  </div>

                  {selectedTrx.paymentProofUrl && (
                    <div className="p-3.5">
                      <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-1 block">Proof Document</span>
                      <a href={selectedTrx.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="text-[#EA580C] hover:underline inline-flex items-center gap-1 font-bold">
                        <FileText size={14} /> View Attached Payment Proof
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex justify-end">
                <button 
                  onClick={() => setSelectedTrx(null)} 
                  className="px-6 py-2.5 bg-[#FFFFFF] hover:bg-[#FFF7ED] border border-[#E2E8F0] text-[#111827] font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {rejectingPaymentId && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="bg-[#FFFFFF] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E2E8F0] text-[#1F2937]">
              <h2 className="text-xl font-bold text-[#111827] mb-2">Reject Payment</h2>
              <p className="text-[#64748B] mb-4 text-xs">Please provide a reason for rejecting this payment (optional). This will be notified to the customer.</p>
              <textarea
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="e.g., Transaction reference not found in bank statement."
                rows={4}
                className="w-full bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-3 text-[#111827] text-xs focus:border-red-500 outline-none resize-none mb-5"
              ></textarea>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setRejectingPaymentId(null);
                    setRejectionReasonInput('');
                  }}
                  className="flex-1 py-2.5 bg-[#F8FAFC] hover:bg-[#222] text-[#64748B] border border-[#E2E8F0] font-bold rounded-xl text-xs cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleVerify(rejectingPaymentId, 'Reject', rejectionReasonInput)}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors shadow-lg shadow-red-900/30"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GymAdminPayments;
