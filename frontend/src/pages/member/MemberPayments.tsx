import { useState, useEffect } from 'react';
import { CreditCard, Loader2, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import api from '../../utils/api';

const MemberPayments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'Subscriptions' | 'Sessions'>('Subscriptions');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const [payRes, sessRes] = await Promise.all([
        api.get('/payments/my-history').catch(() => ({ data: { payments: [] } })),
        api.get('/trainer-sessions/member').catch(() => ({ data: { sessions: [] } }))
      ]);
      setPayments(payRes.data.payments || []);
      setSessions(sessRes.data.sessions || []);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return <span className="px-3 py-1 bg-[#D2B48C]/10 text-[#164A4A] rounded-full text-xs font-bold flex items-center w-fit"><CheckCircle size={12} className="mr-1" /> Approved</span>;
      case 'Pending Verification':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold flex items-center w-fit"><Clock size={12} className="mr-1" /> Pending Verification</span>;
      case 'Rejected':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center w-fit"><XCircle size={12} className="mr-1" /> Rejected</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold flex items-center w-fit">{status}</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-[#202828]">Payment History</h1>
          <p className="text-[#455250]">View and track all your subscription payments.</p>
        </div>
      </div>

      <div className="flex gap-4 border-b border-[#D3DFDA] mb-6 pb-px">
        <button 
          onClick={() => setActiveTab('Subscriptions')}
          className={`px-4 py-2 border-b-2 font-medium ${activeTab === 'Subscriptions' ? 'border-[#164A4A] text-[#164A4A]' : 'border-transparent text-[#455250] hover:text-[#164A4A]'}`}
        >
          Subscription Payments
        </button>
        <button 
          onClick={() => setActiveTab('Sessions')}
          className={`px-4 py-2 border-b-2 font-medium ${activeTab === 'Sessions' ? 'border-[#164A4A] text-[#164A4A]' : 'border-transparent text-[#455250] hover:text-[#164A4A]'}`}
        >
          Trainer Sessions & Refunds
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#164A4A]" size={40} /></div>
      ) : activeTab === 'Subscriptions' && payments.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-10 text-center shadow-xl">
          <CreditCard size={48} className="mx-auto text-[#164A4A] mb-4" />
          <h2 className="text-2xl font-bold text-[#202828] mb-2">No Payments Found</h2>
          <p className="text-[#455250] max-w-md mx-auto">
            Your payment history and invoices will appear here once you make a transaction.
          </p>
        </div>
      ) : activeTab === 'Sessions' && sessions.filter(s => s.paymentStatus && s.paymentStatus !== 'Pending').length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-10 text-center shadow-xl">
          <CreditCard size={48} className="mx-auto text-[#164A4A] mb-4" />
          <h2 className="text-2xl font-bold text-[#202828] mb-2">No Session Payments Found</h2>
          <p className="text-[#455250] max-w-md mx-auto">
            Your trainer session payments and refunds will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#D3DFDA] shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            {activeTab === 'Subscriptions' ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F1F5F3] border-b border-[#D3DFDA]">
                    <th className="px-6 py-4 text-xs font-bold text-[#455250] uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#455250] uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#455250] uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#455250] uppercase tracking-wider">Method</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#455250] uppercase tracking-wider">Transaction ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#455250] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#455250] uppercase tracking-wider">Proof</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D3DFDA]">
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[#202828]">
                        {new Date(payment.paymentDate || payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#202828] font-bold">{payment.planName}</td>
                      <td className="px-6 py-4 text-sm font-bold text-[#164A4A]">₹{payment.amount.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-sm text-[#455250]">{payment.paymentMethod}</td>
                      <td className="px-6 py-4 text-sm text-[#455250] font-mono">{payment.transactionId || 'N/A'}</td>
                      <td className="px-6 py-4">
                        {getStatusBadge(payment.status)}
                        {payment.status === 'Rejected' && payment.rejectionReason && (
                          <p className="text-xs text-[#6fa3a0] mt-1 max-w-xs">{payment.rejectionReason}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {payment.paymentProofUrl ? (
                          <a href={payment.paymentProofUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 flex items-center">
                            <FileText size={16} className="mr-1"/> View
                          </a>
                        ) : (
                          <span className="text-gray-400 text-sm">None</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F1F5F3] border-b border-[#D3DFDA]">
                    <th className="px-6 py-4 text-xs font-bold text-[#455250] uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#455250] uppercase tracking-wider">Trainer</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#455250] uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#455250] uppercase tracking-wider">Session Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-[#455250] uppercase tracking-wider">Payment Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D3DFDA]">
                  {sessions.filter(s => s.paymentStatus && s.paymentStatus !== 'Pending').map((session) => (
                    <tr key={session._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-[#202828] font-mono">
                        {session.bookingId || session._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 text-sm text-[#202828] font-bold">{session.trainerId?.name || 'Trainer'}</td>
                      <td className="px-6 py-4 text-sm font-bold text-[#164A4A]">₹{session.fee.toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4">
                        <span className="text-xs px-2 py-1 bg-gray-100 rounded-md font-bold text-gray-600">{session.status}</span>
                      </td>
                      <td className="px-6 py-4">
                        {session.paymentStatus === 'Paid' ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center w-fit"><CheckCircle size={12} className="mr-1" /> Paid</span>
                        ) : session.paymentStatus === 'Refunded' ? (
                          <span className="px-3 py-1 bg-[#164A4A]/10 text-[#164A4A] rounded-full text-xs font-bold flex items-center w-fit"><CheckCircle size={12} className="mr-1" /> Refunded</span>
                        ) : (
                          <span className="text-gray-500 font-medium text-xs">{session.paymentStatus}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberPayments;
