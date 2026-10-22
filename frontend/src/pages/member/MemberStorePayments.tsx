import { useState, useEffect } from 'react';
import { Loader2, Receipt, CheckCircle, Clock, XCircle, CreditCard, Banknote, Eye, X, Download } from 'lucide-react';
import api from '../../utils/api';
import MemberStoreTabs from '../../components/Member/MemberStoreTabs';

const statusColor: Record<string, string> = {
  'Paid': 'bg-[#D8EAE7]/10 text-[#167D78]',
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
  if (method === 'UPI' || method === 'Cash at Gym') return <Banknote size={16} className="text-[#167D78]" />;
  return <CreditCard size={16} className="text-[#167D78]" />;
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
        body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #344B4A; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #167D78; padding-bottom: 20px; margin-bottom: 24px; }
        .logo { font-size: 24px; font-weight: 900; color: #167D78; letter-spacing: -0.5px; }
        .logo span { color: #D8EAE7; }
        .receipt-label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #D8EAE7; text-align: right; }
        .order-num { font-size: 18px; font-weight: 900; color: #167D78; text-align: right; margin-top: 4px; }
        .section-title { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #697778; margin-bottom: 10px; }
        .row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E8EFF0; font-size: 14px; }
        .row:last-child { border-bottom: none; }
        .label { color: #697778; font-weight: 500; }
        .value { font-weight: 700; color: #344B4A; text-align: right; }
        .total-box { background: #E8EFF0; border-radius: 12px; padding: 16px; margin-top: 24px; }
        .total-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
        .total-final { display: flex; justify-content: space-between; padding-top: 12px; margin-top: 8px; border-top: 2px solid #D9E2E3; }
        .total-final .label { font-size: 16px; font-weight: 900; color: #344B4A; }
        .total-final .value { font-size: 22px; font-weight: 900; color: #167D78; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; background: ${p.status === 'Paid' ? '#D8EAE7' : p.status === 'Refunded' ? '#E8EFF0' : '#fef9c3'}; color: ${p.status === 'Paid' ? '#167D78' : p.status === 'Refunded' ? '#167D78' : '#D99A27'}; }
        .footer { margin-top: 40px; text-align: center; color: #697778; font-size: 12px; border-top: 1px solid #E8EFF0; padding-top: 20px; }
        .watermark { font-size: 11px; font-weight: 600; color: #D9E2E3; text-align: center; margin-top: 8px; text-transform: uppercase; letter-spacing: 3px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">AI<span>Gym</span></div>
          <div style="font-size:12px;color:#697778;margin-top:4px;">Gym Store · Payment Receipt</div>
        </div>
        <div>
          <div class="receipt-label">Receipt</div>
          <div class="order-num">${p.orderNumber}</div>
          <div style="font-size:11px;color:#697778;text-align:right;margin-top:2px;">${new Date(p.date).toLocaleString()}</div>
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
          <span class="label" style="color:#697778;font-size:13px;">Subtotal</span>
          <span style="font-weight:700;">₹${p.subtotal || p.amount}</span>
        </div>
        ${(p.discount || 0) > 0 ? `<div class="total-row"><span class="label" style="color:#697778;font-size:13px;">Discount (Premium)</span><span style="font-weight:700;color:#167D78;">-₹${p.discount}</span></div>` : ''}
        <div class="total-final">
          <span class="label">Total Paid</span>
          <span class="value">₹${p.amount}</span>
        </div>
      </div>

      ${p.status === 'Refunded' && p.refundDetails ? `
      <div style="margin-top:20px;background:#E8EFF0;border:1px solid #D8EAE7;border-radius:12px;padding:16px;">
        <div class="section-title" style="color:#167D78;margin-bottom:8px;">Refund Details</div>
        <div class="row" style="border-color:#D8EAE7;"><span class="label" style="color:#167D78;">Amount Refunded</span><span class="value" style="color:#167D78;">₹${p.refundDetails.amount}</span></div>
        <div class="row" style="border-color:#D8EAE7;"><span class="label" style="color:#167D78;">Refund Date</span><span class="value" style="color:#167D78;">${new Date(p.refundDetails.refundedAt).toLocaleString()}</span></div>
        <div class="row" style="border-color:#D8EAE7;border-bottom:none;"><span class="label" style="color:#167D78;">Reason</span><span class="value" style="color:#167D78;">${p.refundDetails.reason}</span></div>
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
        <h1 className="text-3xl font-bold text-[#344B4A] tracking-tight">Store Payment History</h1>
        <p className="text-[#697778] mt-1">Track your payments for all Gym Store orders.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#D9E2E3] space-x-6 overflow-x-auto">
        {['All', 'Paid', 'Refunded', 'Failed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-[#167D78] text-[#167D78]' : 'border-transparent text-[#697778] hover:text-[#344B4A]'}`}
          >
            {tab === 'All' ? 'All Payments' : tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#167D78]" size={40} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#D9E2E3] rounded-2xl">
          <Receipt className="mx-auto text-[#167D78]/30 mb-4" size={52} />
          <p className="text-[#697778] font-medium mb-1">No payments found.</p>
          <p className="text-sm text-gray-400">Your store transactions will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#D9E2E3] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="bg-[#E8EFF0] border-b border-[#D9E2E3]">
                  <th className="p-4 text-xs font-black text-[#697778] uppercase tracking-wider">Date</th>
                  <th className="p-4 text-xs font-black text-[#697778] uppercase tracking-wider">Order ID</th>
                  <th className="p-4 text-xs font-black text-[#697778] uppercase tracking-wider">Method</th>
                  <th className="p-4 text-xs font-black text-[#697778] uppercase tracking-wider">Amount</th>
                  <th className="p-4 text-xs font-black text-[#697778] uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-black text-[#697778] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EFF0]">
                {filtered.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-[#344B4A] text-sm">{new Date(p.date).toLocaleDateString()}</p>
                      <p className="text-xs text-[#697778]">{new Date(p.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-[#167D78]">{p.orderNumber}</p>
                      <p className="text-[10px] uppercase font-bold text-gray-500 mt-0.5 tracking-wider">{p.type}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-[#E8EFF0] rounded-lg">{getMethodIcon(p.method)}</div>
                        <div>
                          <span className="font-semibold text-sm text-[#697778]">{p.method}</span>
                          {p.bankName && <p className="text-[10px] text-gray-400 font-medium">{p.bankName}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-black text-[#344B4A] text-lg">₹{p.amount}</span>
                    </td>
                    <td className="p-4">
                      {getStatusBadge(p.status)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        {/* View button */}
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="px-3 py-1.5 bg-[#E8EFF0] text-[#697778] rounded-lg hover:bg-[#D9E2E3] transition-colors text-xs font-bold inline-flex items-center gap-1"
                        >
                          <Eye size={13} /> View
                        </button>
                        {/* Download PDF button */}
                        <button
                          onClick={() => downloadReceipt(p)}
                          className="px-3 py-1.5 bg-gradient-to-r from-[#167D78] to-[#116660] text-white rounded-lg hover:opacity-90 transition-opacity text-xs font-bold inline-flex items-center gap-1 shadow-sm"
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
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button onClick={() => setSelectedPayment(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={22} /></button>

            <div className="flex items-start justify-between pr-8 mb-1">
              <div>
                <h2 className="text-xl font-bold text-[#344B4A]">Payment Details</h2>
                <p className="text-sm text-[#697778]">Order #{selectedPayment.orderNumber}</p>
              </div>
              {/* Download PDF inside modal too */}
              <button
                onClick={() => downloadReceipt(selectedPayment)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#167D78] to-[#116660] text-white font-bold rounded-xl text-sm hover:opacity-90 transition-opacity shadow-md shadow-teal-900/10 mt-1"
              >
                <Download size={15} /> Download PDF
              </button>
            </div>

            <div className="space-y-4 mt-6">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-[#697778] font-medium">Date</span>
                <span className="font-bold text-[#344B4A]">{new Date(selectedPayment.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-[#697778] font-medium">Payment Method</span>
                <div className="flex items-center gap-1.5 font-bold text-[#344B4A]">
                  {getMethodIcon(selectedPayment.method)} {selectedPayment.method}
                </div>
              </div>
              {selectedPayment.method === 'Net Banking' && selectedPayment.bankName && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-[#697778] font-medium">Bank Name</span>
                  <span className="font-bold text-[#344B4A]">{selectedPayment.bankName}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-[#697778] font-medium">Status</span>
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

              <div className="bg-[#E8EFF0] p-4 rounded-xl mt-2 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#697778] font-medium">Subtotal</span>
                  <span className="font-bold text-[#344B4A]">₹{selectedPayment.subtotal || selectedPayment.amount}</span>
                </div>
                {(selectedPayment.discount || 0) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#697778] font-medium">Discount</span>
                    <span className="font-bold text-[#167D78]">-₹{selectedPayment.discount}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#D9E2E3] flex justify-between mt-2">
                  <span className="font-bold text-[#344B4A]">Total Paid</span>
                  <span className="font-black text-[#167D78] text-lg">₹{selectedPayment.amount}</span>
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
