import { useState, useEffect } from 'react';
import { IndianRupee, Download, Search, CheckCircle, XCircle, Loader2, FileText, RotateCcw } from 'lucide-react';
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

  const handleVerify = async (id: string, status: 'Approve' | 'Reject' | 'Pending', reason?: string) => {
    if (status !== 'Reject' && !window.confirm(`Are you sure you want to ${status.toLowerCase()} this payment?`)) return;

    try {
      await api.post(`/payments/verify/${id}`, { status, rejectionReason: reason || '' });
      alert(`Payment ${status.toLowerCase()}d successfully.`);
      fetchPayments();
      setRejectingPaymentId(null);
      setRejectionReasonInput('');
    } catch (err: any) {
      console.error('Verification error:', err);
      alert(err.response?.data?.message || 'Verification failed');
    }
  };

  const exportToCSV = () => {
    const headers = ['Transaction ID', 'Customer', 'Plan', 'Date', 'Amount (₹)', 'Method', 'Status'];
    const rows = filtered.map(trx => [
      trx.transactionId || 'N/A',
      `${trx.customerId?.firstName || ''} ${trx.customerId?.lastName || ''}`,
      trx.planName,
      new Date(trx.paymentDate || trx.createdAt).toLocaleDateString(),
      trx.amount,
      trx.paymentMethod,
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
    if (activeTab === 'manual' && trx.paymentMethod !== 'Bank Transfer') return false;
    if (activeTab === 'qr' && trx.paymentMethod === 'Bank Transfer') return false;

    const s = search.toLowerCase();
    const fullName = `${trx.customerId?.firstName || ''} ${trx.customerId?.lastName || ''}`.toLowerCase();
    
    return (
      (trx.transactionId || '').toLowerCase().includes(s) ||
      fullName.includes(s) ||
      (trx.planName || '').toLowerCase().includes(s) ||
      (trx.status || '').toLowerCase().includes(s) ||
      (trx.paymentMethod || '').toLowerCase().includes(s) ||
      (trx.customerBankDetails?.accountNumber || '').toLowerCase().includes(s) ||
      (trx.customerBankDetails?.bankName || '').toLowerCase().includes(s)
    );
  });

  const handleDownloadPDF = () => {
    const columns = ['Date', 'Customer', 'Plan', 'Amount (INR)', 'Method', 'Transaction ID', 'Status'];
    const data = filtered.map((p: any) => {
      const customerName = `${p.customerId?.firstName || ''} ${p.customerId?.lastName || ''}`.trim() || p.customerBankDetails?.fullName || p.user?.name || 'Unknown';
      return [
        p.paymentDate || p.createdAt ? new Date(p.paymentDate || p.createdAt).toLocaleString('en-IN') : '-',
        customerName,
        p.planName || '-',
        `Rs. ${(p.amount || 0).toLocaleString('en-IN')}`,
        p.paymentMethod || '-',
        p.transactionId || 'N/A',
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Payments & Subscriptions</h1>
          <p className="text-[#78716C] mt-1">Manage member payments and configure payment settings.</p>
        </div>
      </div>

      <div className="flex border-b border-[#E7E5E4] space-x-8 mb-6">
        <button 
          onClick={() => setActiveTab('all')}
          className={`py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'all' ? 'border-[#F97316] text-[#F97316]' : 'border-transparent text-[#78716C] hover:text-[#292524]'}`}
        >
          All Payments
        </button>
        <button 
          onClick={() => setActiveTab('manual')}
          className={`py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'manual' ? 'border-[#F97316] text-[#F97316]' : 'border-transparent text-[#78716C] hover:text-[#292524]'}`}
        >
          Manual Payments
        </button>
        <button 
          onClick={() => setActiveTab('qr')}
          className={`py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'qr' ? 'border-[#F97316] text-[#F97316]' : 'border-transparent text-[#78716C] hover:text-[#292524]'}`}
        >
          QR Code Payments
        </button>
      </div>

      <div className="space-y-6">
          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 relative overflow-hidden flex items-center justify-between">
            <div>
              <p className="text-[#78716C] text-sm font-semibold mb-1">Total Revenue</p>
              <h3 className="text-3xl font-black text-[#292524]">₹{payments.filter(p => p.status === 'Approved').reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString('en-IN')}</h3>
            </div>
            <IndianRupee size={48} className="text-[#F97316]/20" />
          </div>

          <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-[#E7E5E4] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-[#292524]">Payment Verification</h3>
              <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-72">
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl pl-9 pr-4 py-2 text-sm text-[#292524] focus:border-[#F97316] outline-none"
                  />
                  <Search className="absolute left-2.5 top-2.5 text-[#78716C]" size={16} />
                </div>
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-[#F97316] text-white font-bold rounded-xl hover:bg-[#EA580C] transition-colors flex items-center gap-2 text-sm shrink-0 cursor-pointer shadow-sm"
                >
                  <Download size={16} /> Download PDF
                </button>
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] font-bold rounded-xl hover:bg-[#FFFDF8] transition-colors flex items-center gap-2 text-sm shrink-0 cursor-pointer"
                >
                  <Download size={16} /> Export CSV
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#F97316]" size={40} /></div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm text-[#78716C] whitespace-nowrap">
                  <thead className="bg-[#FFFFFF] border-b border-[#E7E5E4] text-[#292524]">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold">Customer</th>
                      <th className="px-6 py-4 font-semibold">Plan & Amount</th>
                      <th className="px-6 py-4 font-semibold">Method & TRX ID</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E5E4]">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-[#78716C]">No transactions match your search.</td>
                      </tr>
                    ) : filtered.map((trx) => (
                      <tr key={trx._id} className="hover:bg-[#FFFDF8] transition-colors">
                        <td className="px-6 py-4">{new Date(trx.paymentDate || trx.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-semibold text-[#292524]">{trx.customerId?.firstName} {trx.customerId?.lastName}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-[#292524]">{trx.planName}</p>
                          <p className="text-[#F97316] font-bold">₹{trx.amount}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[#292524] font-medium">{trx.paymentMethod}</p>
                          <p className="font-mono text-xs text-gray-500">{trx.transactionId || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            trx.status === 'Approved' ? 'bg-[#FED7AA]/10 text-[#F97316]' :
                            trx.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {trx.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 items-center">
                            <button 
                              onClick={() => setSelectedTrx(trx)}
                              className="px-3 py-1.5 bg-blue-50 text-[#FED7AA] rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold whitespace-nowrap"
                            >
                              View Details
                            </button>
                            {trx.status === 'Pending Verification' ? (
                              <>
                                <button onClick={() => handleVerify(trx._id, 'Approve')} className="p-1.5 bg-green-50 text-[#F97316] rounded-lg hover:bg-green-100 transition-colors" title="Approve">
                                  <CheckCircle size={18} />
                                </button>
                                <button onClick={() => setRejectingPaymentId(trx._id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Reject">
                                  <XCircle size={18} />
                                </button>
                              </>
                            ) : (
                              <button onClick={() => handleVerify(trx._id, 'Pending')} className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors" title="Revert to Pending">
                                <RotateCcw size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          {selectedTrx && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-auto max-h-[85vh] overflow-y-auto">
                <button onClick={() => setSelectedTrx(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                  <XCircle size={24} />
                </button>
                <h2 className="text-2xl font-bold text-[#292524] mb-6 border-b pb-4">Transaction Details</h2>
                
                <div className="space-y-4">
                  <div className="border border-[#E7E5E4] rounded-xl overflow-hidden divide-y divide-[#E7E5E4] bg-white shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                      <div className="p-3.5 bg-white flex flex-col justify-center">
                        <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Customer</span>
                        <span className="font-bold text-sm text-[#292524]">{selectedTrx.customerId?.firstName} {selectedTrx.customerId?.lastName}</span>
                      </div>
                      <div className="p-3.5 bg-white flex flex-col justify-center">
                        <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Payment Date</span>
                        <span className="font-semibold text-sm text-[#292524]">{new Date(selectedTrx.paymentDate || selectedTrx.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                      <div className="p-3.5 bg-white flex flex-col justify-center">
                        <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Membership Plan</span>
                        <span className="font-bold text-sm text-[#292524]">{selectedTrx.planName}</span>
                      </div>
                      <div className="p-3.5 bg-white flex flex-col justify-center">
                        <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Amount</span>
                        <span className="font-bold text-base text-[#F97316]">₹{selectedTrx.amount}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#E7E5E4]">
                      <div className="p-3.5 bg-white flex flex-col justify-center">
                        <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Payment Method</span>
                        <span className="font-semibold text-sm text-[#292524]">{selectedTrx.paymentMethod}</span>
                      </div>
                      <div className="p-3.5 bg-white flex flex-col justify-center">
                        <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Verification Status</span>
                        <span className="inline-flex items-center">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            selectedTrx.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            selectedTrx.status === 'Rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }`}>
                            {selectedTrx.status}
                          </span>
                        </span>
                      </div>
                    </div>

                    {selectedTrx.paymentMethod === 'Bank Transfer' ? (
                      <div className="p-3.5 bg-white flex flex-col">
                        <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-2">Customer Bank Details</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                          <div><span className="text-gray-500">Bank:</span> <span className="font-bold text-[#292524]">{selectedTrx.customerBankDetails?.bankName || 'N/A'}</span></div>
                          <div><span className="text-gray-500">Account:</span> <span className="font-bold text-[#292524]">{selectedTrx.customerBankDetails?.accountNumber || 'N/A'}</span></div>
                          <div><span className="text-gray-500">IFSC:</span> <span className="font-bold text-[#292524]">{selectedTrx.customerBankDetails?.ifscCode || 'N/A'}</span></div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-white flex flex-col justify-center">
                        <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Transaction ID / Reference</span>
                        <span className="font-mono text-sm font-semibold text-[#292524] break-all">{selectedTrx.transactionId || 'Not Provided'}</span>
                      </div>
                    )}

                    {selectedTrx.notes && (
                      <div className="p-3.5 bg-white flex flex-col justify-center">
                        <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-1">Additional Notes</span>
                        <span className="text-sm text-[#292524] italic">{selectedTrx.notes}</span>
                      </div>
                    )}

                    {selectedTrx.paymentMethod !== 'Bank Transfer' && (
                      <div className="p-3.5 bg-white flex flex-col justify-center">
                        <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider mb-2">Payment Proof</span>
                        {selectedTrx.paymentProofUrl ? (
                          <a href={selectedTrx.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-blue-50 text-[#F97316] font-bold rounded-lg hover:bg-blue-100 transition-colors w-fit text-xs border border-blue-200">
                            <FileText size={16} className="mr-1.5"/> View Attached Proof Document
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No proof document uploaded for this transaction.</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <button 
                    onClick={() => setSelectedTrx(null)} 
                    className="w-full py-3 bg-gray-100 text-[#78716C] font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </div>
          )}

          {rejectingPaymentId && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
                <h2 className="text-xl font-bold text-[#292524] mb-4">Reject Payment</h2>
                <p className="text-[#78716C] mb-4 text-sm">Please provide a reason for rejecting this payment (optional). This will be shown to the customer.</p>
                <textarea
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="e.g., The payment screenshot is blurry or invalid."
                  rows={4}
                  className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl p-3 text-[#292524] focus:border-red-500 outline-none resize-none mb-6 text-sm"
                ></textarea>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setRejectingPaymentId(null);
                      setRejectionReasonInput('');
                    }}
                    className="flex-1 py-2.5 bg-gray-100 text-[#78716C] font-bold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleVerify(rejectingPaymentId, 'Reject', rejectionReasonInput)}
                    className="flex-1 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
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
