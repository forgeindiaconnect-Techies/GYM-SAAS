import { useState, useEffect } from 'react';
import { IndianRupee, Download, Search, CheckCircle, XCircle, Loader2, FileText, RotateCcw } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

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
      const res = await api.get('/payments/gym');
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Payments & Subscriptions</h1>
          <p className="text-[#455250] mt-1">Manage member payments and configure payment settings.</p>
        </div>
      </div>

      <div className="flex border-b border-[#D3DFDA] space-x-8 mb-6">
        <button 
          onClick={() => setActiveTab('all')}
          className={`py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'all' ? 'border-[#164A4A] text-[#164A4A]' : 'border-transparent text-[#455250] hover:text-[#202828]'}`}
        >
          All Payments
        </button>
        <button 
          onClick={() => setActiveTab('manual')}
          className={`py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'manual' ? 'border-[#164A4A] text-[#164A4A]' : 'border-transparent text-[#455250] hover:text-[#202828]'}`}
        >
          Manual Payments
        </button>
        <button 
          onClick={() => setActiveTab('qr')}
          className={`py-3 font-semibold text-sm transition-colors border-b-2 ${activeTab === 'qr' ? 'border-[#164A4A] text-[#164A4A]' : 'border-transparent text-[#455250] hover:text-[#202828]'}`}
        >
          QR Code Payments
        </button>
      </div>

      <div className="space-y-6">
          <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6 relative overflow-hidden flex items-center justify-between">
            <div>
              <p className="text-[#455250] text-sm font-semibold mb-1">Total Revenue</p>
              <h3 className="text-3xl font-black text-[#202828]">₹{payments.filter(p => p.status === 'Approved').reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString('en-IN')}</h3>
            </div>
            <IndianRupee size={48} className="text-[#164A4A]/20" />
          </div>

          <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-[#D3DFDA] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h3 className="text-lg font-bold text-[#202828]">Payment Verification</h3>
              <div className="flex gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-72">
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl pl-9 pr-4 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none"
                  />
                  <Search className="absolute left-2.5 top-2.5 text-[#455250]" size={16} />
                </div>
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-[#FFFFFF] border border-[#D3DFDA] text-[#202828] font-bold rounded-xl hover:bg-[#F1F5F3] transition-colors flex items-center gap-2 text-sm shrink-0"
                >
                  <Download size={16} /> Export
                </button>
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#164A4A]" size={40} /></div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm text-[#455250] whitespace-nowrap">
                  <thead className="bg-[#FFFFFF] border-b border-[#D3DFDA] text-[#202828]">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Date</th>
                      <th className="px-6 py-4 font-semibold">Customer</th>
                      <th className="px-6 py-4 font-semibold">Plan & Amount</th>
                      <th className="px-6 py-4 font-semibold">Method & TRX ID</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D3DFDA]">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-[#455250]">No transactions match your search.</td>
                      </tr>
                    ) : filtered.map((trx) => (
                      <tr key={trx._id} className="hover:bg-[#F1F5F3] transition-colors">
                        <td className="px-6 py-4">{new Date(trx.paymentDate || trx.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 font-semibold text-[#202828]">{trx.customerId?.firstName} {trx.customerId?.lastName}</td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-[#202828]">{trx.planName}</p>
                          <p className="text-[#164A4A] font-bold">₹{trx.amount}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[#202828] font-medium">{trx.paymentMethod}</p>
                          <p className="font-mono text-xs text-gray-500">{trx.transactionId || 'N/A'}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            trx.status === 'Approved' ? 'bg-[#D2B48C]/10 text-[#164A4A]' :
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
                              className="px-3 py-1.5 bg-blue-50 text-[#D2B48C] rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold whitespace-nowrap"
                            >
                              View Details
                            </button>
                            {trx.status === 'Pending Verification' ? (
                              <>
                                <button onClick={() => handleVerify(trx._id, 'Approve')} className="p-1.5 bg-green-50 text-[#164A4A] rounded-lg hover:bg-green-100 transition-colors" title="Approve">
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
                <button onClick={() => setSelectedTrx(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                  <XCircle size={24} />
                </button>
                <h2 className="text-2xl font-bold text-[#202828] mb-6 border-b pb-4">Transaction Details</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Customer</p>
                      <p className="font-bold text-[#202828]">{selectedTrx.customerId?.firstName} {selectedTrx.customerId?.lastName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Date</p>
                      <p className="font-bold text-[#202828]">{new Date(selectedTrx.paymentDate || selectedTrx.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Plan</p>
                      <p className="font-bold text-[#202828]">{selectedTrx.planName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Amount</p>
                      <p className="font-bold text-[#164A4A]">₹{selectedTrx.amount}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Payment Method</p>
                      <p className="font-bold text-[#202828]">{selectedTrx.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase">Status</p>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        selectedTrx.status === 'Approved' ? 'bg-[#D2B48C]/10 text-[#164A4A]' :
                        selectedTrx.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {selectedTrx.status}
                      </span>
                    </div>
                  </div>

                  {selectedTrx.paymentMethod === 'Bank Transfer' ? (
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500 font-semibold uppercase mb-3 border-b border-gray-200 pb-2">Customer Bank Details</p>
                      <div className="grid grid-cols-2 gap-y-2">
                        <p className="text-sm"><span className="text-gray-500">Bank Name:</span> <span className="font-semibold">{selectedTrx.customerBankDetails?.bankName || 'N/A'}</span></p>
                        <p className="text-sm"><span className="text-gray-500">Account:</span> <span className="font-semibold">{selectedTrx.customerBankDetails?.accountNumber || 'N/A'}</span></p>
                        <p className="text-sm"><span className="text-gray-500">IFSC:</span> <span className="font-semibold">{selectedTrx.customerBankDetails?.ifscCode || 'N/A'}</span></p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Transaction ID / Reference Number</p>
                      <p className="font-mono bg-gray-50 p-2 rounded border border-gray-200 break-all">{selectedTrx.transactionId || 'Not Provided'}</p>
                    </div>
                  )}

                  {selectedTrx.notes && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Additional Notes</p>
                      <p className="bg-gray-50 p-3 rounded border border-gray-200 text-sm text-[#202828] italic">{selectedTrx.notes}</p>
                    </div>
                  )}

                  {selectedTrx.paymentMethod !== 'Bank Transfer' && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Payment Proof</p>
                      {selectedTrx.paymentProofUrl ? (
                        <a href={selectedTrx.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-2 bg-blue-50 text-[#D2B48C] font-bold rounded-lg hover:bg-blue-100 transition-colors">
                          <FileText size={18} className="mr-2"/> View Attached Proof Document
                        </a>
                      ) : (
                        <p className="text-gray-400 italic bg-gray-50 p-3 rounded border border-gray-200">No proof document uploaded for this transaction.</p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <button 
                    onClick={() => setSelectedTrx(null)} 
                    className="w-full py-3 bg-gray-100 text-[#455250] font-bold rounded-xl hover:bg-gray-200 transition-colors"
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
                <h2 className="text-xl font-bold text-[#202828] mb-4">Reject Payment</h2>
                <p className="text-[#455250] mb-4 text-sm">Please provide a reason for rejecting this payment (optional). This will be shown to the customer.</p>
                <textarea
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  placeholder="e.g., The payment screenshot is blurry or invalid."
                  rows={4}
                  className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl p-3 text-[#202828] focus:border-red-500 outline-none resize-none mb-6 text-sm"
                ></textarea>
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setRejectingPaymentId(null);
                      setRejectionReasonInput('');
                    }}
                    className="flex-1 py-2.5 bg-gray-100 text-[#455250] font-bold rounded-xl hover:bg-gray-200 transition-colors"
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
