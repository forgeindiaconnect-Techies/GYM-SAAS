import { useState, useEffect } from 'react';
import { Loader2, Receipt, CheckCircle, Clock, XCircle, CreditCard, Banknote, Eye, X } from 'lucide-react';
import api from '../../utils/api';

const statusColor: Record<string, string> = {
  'Paid': 'bg-[#D2B48C]/10 text-[#164A4A]',
  'Pending': 'bg-yellow-100 text-yellow-700',
  'Failed': 'bg-red-100 text-red-700',
  'Refunded': 'bg-orange-100 text-orange-700',
};

const getStatusBadge = (status: string) => {
  const cls = statusColor[status] || 'bg-gray-100 text-gray-700';
  if (status === 'Paid') return <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 w-fit ${cls}`}><CheckCircle size={12} /> {status}</span>;
  if (status === 'Pending') return <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 w-fit ${cls}`}><Clock size={12} /> {status}</span>;
  if (status === 'Failed') return <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 w-fit ${cls}`}><XCircle size={12} /> {status}</span>;
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 w-fit ${cls}`}>{status}</span>;
};

const getMethodIcon = (method: string) => {
  if (method === 'UPI' || method === 'Cash at Gym') return <Banknote size={16} className="text-[#6fa3a0]" />;
  return <CreditCard size={16} className="text-[#6fa3a0]" />;
};

const MemberStorePayments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        // We use orders API because store payments are tied directly to orders
        const res = await api.get('/store/customer/orders?limit=100');
        // Extract payment information from orders
        const paymentData = (res.data.orders || []).map((o: any) => ({
          _id: o._id,
          orderNumber: o.orderNumber,
          date: o.createdAt,
          amount: o.total,
          method: o.paymentMethod || 'Online',
          status: o.paymentStatus || 'Pending',
          type: o.fulfilmentType,
          subtotal: o.subtotal,
          discount: o.discount,
          refundDetails: o.refundDetails
        }));
        setPayments(paymentData);
      } catch (err) {
        console.error('Error fetching store payments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Store Payment History</h1>
        <p className="text-[#455250] mt-1">Track your payments for all Gym Store orders.</p>
      </div>

      <div className="flex border-b border-[#D3DFDA] space-x-6 overflow-x-auto">
        {['All', 'Paid', 'Refunded', 'Failed'].map((tab) => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)} 
            className={`py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-[#164A4A] text-[#164A4A]' : 'border-transparent text-[#455250] hover:text-[#202828]'}`}
          >
            {tab === 'All' ? 'All Payments' : tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#164A4A]" size={40} /></div>
      ) : payments.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#D3DFDA] rounded-2xl">
          <Receipt className="mx-auto text-[#164A4A]/30 mb-4" size={52} />
          <p className="text-[#687B78] font-medium mb-1">No payments found.</p>
          <p className="text-sm text-gray-400">Your store transactions will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#D3DFDA] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-[#F1F5F3] border-b border-[#D3DFDA]">
                  <th className="p-4 text-xs font-black text-[#687B78] uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-black text-[#687B78] uppercase tracking-wider">Order ID</th>
                  <th className="p-4 text-xs font-black text-[#687B78] uppercase tracking-wider">Method</th>
                  <th className="p-4 text-xs font-black text-[#687B78] uppercase tracking-wider">Amount</th>
                  <th className="p-4 text-xs font-black text-[#687B78] uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-black text-[#687B78] uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {payments.filter(p => activeTab === 'All' ? true : p.status === activeTab).map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[#202828] text-sm">{new Date(p.date).toLocaleDateString()}</p>
                      <p className="text-xs text-[#687B78]">{new Date(p.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-[#164A4A]">{p.orderNumber}</p>
                      <p className="text-[10px] uppercase font-bold text-gray-500 mt-0.5 tracking-wider">{p.type}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#F1F5F3] rounded-lg">
                          {getMethodIcon(p.method)}
                        </div>
                        <span className="font-semibold text-sm text-[#455250]">{p.method}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-black text-[#202828] text-lg">₹{p.amount}</span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => setSelectedPayment(p)} className="px-3 py-1.5 bg-blue-50 text-[#D2B48C] rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold inline-flex items-center gap-1 shrink-0">
                        <Eye size={13} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button onClick={() => setSelectedPayment(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={22} /></button>
            <h2 className="text-xl font-bold text-[#202828] mb-1">Payment Details</h2>
            <p className="text-sm text-[#455250] mb-6">Order #{selectedPayment.orderNumber}</p>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-[#687B78] font-medium">Date</span>
                <span className="font-bold text-[#202828]">{new Date(selectedPayment.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-[#687B78] font-medium">Payment Method</span>
                <div className="flex items-center gap-1.5 font-bold text-[#202828]">
                  {getMethodIcon(selectedPayment.method)} {selectedPayment.method}
                </div>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-[#687B78] font-medium">Status</span>
                {getStatusBadge(selectedPayment.status)}
              </div>

            {selectedPayment.status === 'Refunded' && selectedPayment.refundDetails && (
              <div className="mt-4 bg-orange-50 border border-orange-100 rounded-xl p-4">
                <p className="text-xs font-bold text-orange-800 uppercase tracking-wider mb-2">Refund Details</p>
                <div className="flex justify-between items-center py-1">
                  <span className="text-orange-900/70 text-sm">Amount Refunded</span>
                  <span className="font-bold text-orange-900">₹{selectedPayment.refundDetails.amount}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-orange-900/70 text-sm">Refund Date</span>
                  <span className="font-semibold text-orange-900 text-sm">{new Date(selectedPayment.refundDetails.refundedAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-orange-900/70 text-sm">Reason</span>
                  <span className="font-medium text-orange-900 text-sm text-right">{selectedPayment.refundDetails.reason}</span>
                </div>
              </div>
            )}
              
              <div className="bg-[#F1F5F3] p-4 rounded-xl mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#687B78] font-medium">Subtotal</span>
                  <span className="font-bold text-[#202828]">₹{selectedPayment.subtotal || selectedPayment.amount}</span>
                </div>
                {(selectedPayment.discount || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#687B78] font-medium">Discount</span>
                    <span className="font-bold text-[#164A4A]">-₹{selectedPayment.discount}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#D3DFDA] flex justify-between mt-2">
                  <span className="font-bold text-[#202828]">Total Paid</span>
                  <span className="font-black text-[#164A4A] text-lg">₹{selectedPayment.amount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberStorePayments;
