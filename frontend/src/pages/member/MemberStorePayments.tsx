import { useState, useEffect } from 'react';
import { Loader2, Receipt, CheckCircle, Clock, XCircle, CreditCard, Banknote, Eye, X, Download } from 'lucide-react';
import api from '../../utils/api';
import MemberStoreTabs from '../../components/Member/MemberStoreTabs';

const statusColor: Record<string, string> = {
  'Paid': 'bg-[#F3E8E8]/10 text-[#B76E79]',
  'Pending': 'bg-yellow-100 text-yellow-700',
  'Failed': 'bg-red-100 text-red-700',
  'Refunded': 'bg-[#F3E8E8] text-[#B76E79]',
};

const getStatusBadge = (status: string) => {
  const cls = statusColor[status] || 'bg-[#F3E8E8] text-[#292524]';
  if (status === 'Paid') return <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 w-fit ${cls}`}><CheckCircle size={12} /> {status}</span>;
  if (status === 'Pending') return <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 w-fit ${cls}`}><Clock size={12} /> {status}</span>;
  if (status === 'Failed') return <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 w-fit ${cls}`}><XCircle size={12} /> {status}</span>;
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 w-fit ${cls}`}>{status}</span>;
};

const getMethodIcon = (method: string) => {
  if (method === 'UPI' || method === 'Cash at Gym') return <Banknote size={16} className="text-[#B76E79]" />;
  return <CreditCard size={16} className="text-[#B76E79]" />;
};

/* ── Download PDF Receipt ─────────────────────────────────── */
const downloadReceipt = (p: any) => {
  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <title>Receipt - ${p.orderNumber}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #FFFFFF; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #B76E79; padding-bottom: 20px; margin-bottom: 24px; }
        .logo { font-size: 24px; font-weight: 900; color: #B76E79; letter-spacing: -0.5px; }
        .logo span { color: #F3E8E8; }
        .receipt-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #F3E8E8; text-align: right; }
        .order-num { font-size: 18px; font-weight: 900; color: #B76E79; text-align: right; margin-top: 4px; }
        .section-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #57534E; margin-bottom: 10px; }
        .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #F3E8E8; font-size: 14px; }
        .row:last-child { border-bottom: none; }
        .label { color: #57534E; font-weight: 500; }
        .value { font-weight: 700; color: #FFFFFF; text-align: right; }
        .total-box { background: #F3E8E8; border-radius: 12px; padding: 16px; margin-top: 24px; }
        .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
        .total-final { display: flex; justify-content: space-between; padding-top: 12px; margin-top: 8px; border-top: 2px solid #E7DADD; }
        .total-final .label { font-size: 16px; font-weight: 900; color: #FFFFFF; }
        .total-final .value { font-size: 22px; font-weight: 900; color: #B76E79; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; background: ${p.status === 'Paid' ? '#F3E8E8' : p.status === 'Refunded' ? '#F3E8E8' : '#fef9c3'}; color: ${p.status === 'Paid' ? '#B76E79' : p.status === 'Refunded' ? '#B76E79' : '#B45309'}; }
        .footer { margin-top: 40px; text-align: center; color: #57534E; font-size: 12px; border-top: 1px solid #F3E8E8; padding-top: 20px; }
        .watermark { font-size: 11px; font-weight: 600; color: #E7DADD; text-align: center; margin-top: 8px; text-transform: uppercase; letter-spacing: 3px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">AI<span>Gym</span></div>
          <div style="font-size:12px;color:#57534E;margin-top:4px;">Gym Store · Payment Receipt</div>
        </div>
        <div>
          <div class="receipt-label">Receipt</div>
          <div class="order-num">${p.orderNumber}</div>
          <div style="font-size:11px;color:#57534E;text-align:right;margin-top:2px;">${new Date(p.date).toLocaleString()}</div>
        </div>
      </div>

      <div class="section-title">Payment Information</div>
      <div class="row">
        <span class="label">Payment Method</span>
        <span class="value">${p.method}</span>
      </div>
      ${p.bankName ? `<div class="row"><span class="label">Bank Name</span><span class="value">${p.bankName}</span></div>` : ''}
      <div class="row">
        <span class="label">Fulfilment Type</span>
        <span class="value">${p.type}</span>
      </div>
      <div class="row">
        <span class="label">Payment Status</span>
        <span class="value"><span class="status-badge">${p.status}</span></span>
      </div>
      <div class="row">
        <span class="label">Transaction Date</span>
        <span class="value">${new Date(p.date).toLocaleString()}</span>
      </div>

      <div class="total-box">
        <div class="total-row">
          <span class="label" style="color:#57534E;font-size:13px;">Subtotal</span>
          <span style="font-weight:700;">₹${p.subtotal || p.amount}</span>
        </div>
        ${(p.discount || 0) > 0 ? `<div class="total-row"><span class="label" style="color:#57534E;font-size:13px;">Discount (Premium)</span><span style="font-weight:700;color:#B76E79;">-₹${p.discount}</span></div>` : ''}
        <div class="total-final">
          <span class="label">Total Paid</span>
          <span class="value">₹${p.amount}</span>
        </div>
      </div>

      ${p.status === 'Refunded' && p.refundDetails ? `
      <div style="margin-top:20px;background:#F3E8E8;border:1px solid #F3E8E8;border-radius:12px;padding:16px;">
        <div class="section-title" style="color:#B76E79;margin-bottom:8px;">Refund Details</div>
        <div class="row" style="border-color:#F3E8E8;"><span class="label" style="color:#B76E79;">Amount Refunded</span><span class="value" style="color:#B76E79;">₹${p.refundDetails.amount}</span></div>
        <div class="row" style="border-color:#F3E8E8;"><span class="label" style="color:#B76E79;">Refund Date</span><span class="value" style="color:#B76E79;">${new Date(p.refundDetails.refundedAt).toLocaleString()}</span></div>
        <div class="row" style="border-color:#F3E8E8;border-bottom:none;"><span class="label" style="color:#B76E79;">Reason</span><span class="value" style="color:#B76E79;">${p.refundDetails.reason}</span></div>
      </div>` : ''}

      <div class="footer">
        Thank you for your purchase at Gymora Store!<br />
        For support, contact your gym admin.
      </div>
      <div class="watermark">Gymora · Official Receipt</div>
    </body>
    </html>
  `;

  const win = window.open('', '_blank', 'width=700,height=900');
  if (win) {
    win.document.write(receiptHTML);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  }
};

/* ── Main Component ─────────────────────────────────────────── */
const MemberStorePayments = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const res = await api.get('/store/customer/orders?limit=100');
        const paymentData = (res.data.orders || []).map((o: any) => ({
          _id: o._id,
          orderNumber: o.orderNumber,
          date: o.createdAt,
          amount: o.total,
          method: o.paymentMethod || 'Online',
          bankName: o.bankName || null,
          status: o.paymentStatus || 'Pending',
          type: o.fulfilmentType,
          subtotal: o.subtotal,
          discount: o.discount,
          refundDetails: o.refundDetails,
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

  const filtered = payments.filter(p => activeTab === 'All' ? true : p.status === activeTab);

  return (
    <div className="space-y-6">
      <MemberStoreTabs />
      <div>
        <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Store Payment History</h1>
        <p className="text-[#57534E] mt-1">Track your payments for all Gym Store orders.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E7DADD] space-x-6 overflow-x-auto">
        {['All', 'Paid', 'Refunded', 'Failed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-[#B76E79] text-[#B76E79]' : 'border-transparent text-[#57534E] hover:text-[#FFFFFF]'}`}
          >
            {tab === 'All' ? 'All Payments' : tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#B76E79]" size={40} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl">
          <Receipt className="mx-auto text-[#B76E79]/30 mb-4" size={52} />
          <p className="text-[#57534E] font-medium mb-1">No payments found.</p>
          <p className="text-sm text-[#57534E]">Your store transactions will appear here.</p>
        </div>
      ) : (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7DADD] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-[#F3E8E8] border-b border-[#E7DADD]">
                  <th className="p-4 text-xs font-black text-[#57534E] uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-black text-[#57534E] uppercase tracking-wider">Order ID</th>
                  <th className="p-4 text-xs font-black text-[#57534E] uppercase tracking-wider">Method</th>
                  <th className="p-4 text-xs font-black text-[#57534E] uppercase tracking-wider">Amount</th>
                  <th className="p-4 text-xs font-black text-[#57534E] uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-black text-[#57534E] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3E8E8]">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-[#F3E8E8]/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[#292524] text-sm">{new Date(p.date).toLocaleDateString()}</p>
                      <p className="text-xs text-[#57534E]">{new Date(p.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-[#B76E79]">{p.orderNumber}</p>
                      <p className="text-[10px] uppercase font-bold text-[#57534E] mt-0.5 tracking-wider">{p.type}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#F3E8E8] rounded-lg">{getMethodIcon(p.method)}</div>
                        <div>
                          <span className="font-semibold text-sm text-[#57534E]">{p.method}</span>
                          {p.bankName && <p className="text-[10px] text-[#57534E] font-medium">{p.bankName}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-black text-[#292524] text-lg">₹{p.amount}</span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {/* View button */}
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="px-3 py-1.5 bg-[#F3E8E8] text-[#57534E] rounded-lg hover:bg-[#E7DADD] transition-colors text-xs font-bold inline-flex items-center gap-1"
                        >
                          <Eye size={13} /> View
                        </button>
                        {/* Download PDF button */}
                        <button
                          onClick={() => downloadReceipt(p)}
                          className="px-3 py-1.5 bg-gradient-to-r from-[#B76E79] to-[#9F5965] text-[#FFFFFF] font-bold rounded-lg hover:opacity-90 transition-opacity text-xs font-bold inline-flex items-center gap-1 shadow-sm"
                        >
                          <Download size={13} /> PDF
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Payment Details Modal ─────────────────────────── */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button onClick={() => setSelectedPayment(null)} className="absolute top-4 right-4 text-[#57534E] hover:text-[#292524]"><X size={22} /></button>

            <div className="flex items-start justify-between pr-8 mb-1">
              <div>
                <h2 className="text-xl font-bold text-[#292524]">Payment Details</h2>
                <p className="text-sm text-[#57534E]">Order #{selectedPayment.orderNumber}</p>
              </div>
              {/* Download PDF inside modal too */}
              <button
                onClick={() => downloadReceipt(selectedPayment)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#B76E79] to-[#9F5965] text-[#FFFFFF] font-bold font-bold rounded-xl text-sm hover:opacity-90 transition-opacity shadow-md shadow-[#B76E79]/15 mt-1"
              >
                <Download size={15} /> Download PDF
              </button>
            </div>

            <div className="space-y-4 mt-6">
              <div className="flex justify-between items-center py-3 border-b border-[#E7DADD]">
                <span className="text-[#57534E] font-medium">Date</span>
                <span className="font-bold text-[#292524]">{new Date(selectedPayment.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-[#E7DADD]">
                <span className="text-[#57534E] font-medium">Payment Method</span>
                <div className="flex items-center gap-1.5 font-bold text-[#292524]">
                  {getMethodIcon(selectedPayment.method)} {selectedPayment.method}
                </div>
              </div>
              {selectedPayment.method === 'Net Banking' && selectedPayment.bankName && (
                <div className="flex justify-between items-center py-3 border-b border-[#E7DADD]">
                  <span className="text-[#57534E] font-medium">Bank Name</span>
                  <span className="font-bold text-[#292524]">{selectedPayment.bankName}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-3 border-b border-[#E7DADD]">
                <span className="text-[#57534E] font-medium">Status</span>
                {getStatusBadge(selectedPayment.status)}
              </div>

              {selectedPayment.status === 'Refunded' && selectedPayment.refundDetails && (
                <div className="mt-4 bg-[#F3E8E8] border border-[#E7DADD] rounded-xl p-4">
                  <p className="text-xs font-bold text-[#B76E79] uppercase tracking-wider mb-2">Refund Details</p>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#B76E79]/70 text-sm">Amount Refunded</span>
                    <span className="font-bold text-[#B76E79]">₹{selectedPayment.refundDetails.amount}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#B76E79]/70 text-sm">Refund Date</span>
                    <span className="font-semibold text-[#B76E79] text-sm">{new Date(selectedPayment.refundDetails.refundedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[#B76E79]/70 text-sm">Reason</span>
                    <span className="font-medium text-[#B76E79] text-sm text-right">{selectedPayment.refundDetails.reason}</span>
                  </div>
                </div>
              )}

              <div className="bg-[#F3E8E8] p-4 rounded-xl mt-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#57534E] font-medium">Subtotal</span>
                  <span className="font-bold text-[#292524]">₹{selectedPayment.subtotal || selectedPayment.amount}</span>
                </div>
                {(selectedPayment.discount || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#57534E] font-medium">Discount</span>
                    <span className="font-bold text-[#B76E79]">-₹{selectedPayment.discount}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#E7DADD] flex justify-between mt-2">
                  <span className="font-bold text-[#292524]">Total Paid</span>
                  <span className="font-black text-[#B76E79] text-lg">₹{selectedPayment.amount}</span>
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
