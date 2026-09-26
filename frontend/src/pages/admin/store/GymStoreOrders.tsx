import { useState, useEffect } from 'react';
import { Search, Loader2, Eye, X, MapPin, Truck, PackageCheck, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../../utils/api';

const statusColor: Record<string, string> = {
  'Pending': 'bg-yellow-100 text-yellow-700',
  'Confirmed': 'bg-blue-100 text-blue-700',
  'Preparing': 'bg-purple-100 text-purple-700',
  'Ready for Pickup': 'bg-teal-100 text-teal-700',
  'Out for Delivery': 'bg-indigo-100 text-indigo-700',
  'Completed': 'bg-[#D2B48C]/10 text-[#164A4A]',
  'Cancelled': 'bg-red-100 text-red-700',
  'Refunded': 'bg-orange-100 text-orange-700',
};

const paymentColor: Record<string, string> = {
  'Paid': 'bg-[#D2B48C]/10 text-[#164A4A]',
  'Pending': 'bg-yellow-100 text-yellow-700',
  'Failed': 'bg-red-100 text-red-700',
  'Refunded': 'bg-orange-100 text-orange-700',
};

const nextActions: Record<string, string[]> = {
  'Pending': ['Confirmed', 'Cancelled'],
  'Confirmed': ['Preparing', 'Cancelled'],
  'Preparing': ['Ready for Pickup', 'Out for Delivery', 'Cancelled'],
  'Ready for Pickup': ['Completed'],
  'Out for Delivery': ['Completed'],
  'Completed': ['Refunded'],
};

const GymStoreOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [paymentStatus, setPaymentStatus] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [refundPrompt, setRefundPrompt] = useState<any>(null);
  const [refundReason, setRefundReason] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      if (paymentStatus !== 'all') params.set('paymentStatus', paymentStatus);
      if (search.trim()) params.set('search', search.trim());
      params.set('limit', '100');
      const res = await api.get(`/store/admin/orders?${params.toString()}`);
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status, paymentStatus, search]);

  const changeStatus = async (id: string, next: string, explicitReason?: string) => {
    let reason = explicitReason || '';
    if (!explicitReason && next === 'Cancelled') {
      const p = window.prompt(`Are you sure you want to cancel this order? Provide a reason (optional):`);
      if (p === null) return;
      reason = p;
    }

    try {
      setUpdatingId(id);
      await api.patch(`/store/admin/orders/${id}/status`, { status: next, note: reason });
      if (selected && selected._id === id) {
        setSelected({ ...selected, status: next });
      }
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Orders</h1>
        <p className="text-[#455250] mt-1">Manage online orders from your members.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order number or transaction id..." className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl pl-9 pr-4 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none" />
          <Search className="absolute left-3 top-2.5 text-[#455250]" size={16} />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-3 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none lg:w-48">
          <option value="all">All Status</option>
          {Object.keys(nextActions).map((s) => <option key={s} value={s}>{s}</option>)}
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Refunded">Refunded</option>
        </select>
        <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-3 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none lg:w-44">
          <option value="all">All Payments</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Failed">Failed</option>
          <option value="Refunded">Refunded</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#164A4A]" size={40} /></div>
      ) : (
        <div className="bg-white border border-[#D3DFDA] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm text-[#455250] whitespace-nowrap">
              <thead className="bg-[#FFFFFF] border-b border-[#D3DFDA] text-[#202828]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Order</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Items</th>
                  <th className="px-6 py-4 font-semibold">Total</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Payment</th>
                  <th className="px-6 py-4 font-semibold">Fulfilment</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D3DFDA]">
                {orders.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-10 text-center">No orders found.</td></tr>
                ) : orders.map((o) => (
                  <tr key={o._id} className="hover:bg-[#F1F5F3] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#202828]">{o.orderNumber}</p>
                      <p className="text-xs text-[#455250]">{new Date(o.createdAt).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#202828]">
                      {o.customerId && (o.customerId.firstName || o.customerId.lastName) 
                        ? `${o.customerId.firstName || ''} ${o.customerId.lastName || ''}`.trim()
                        : 'Unknown Customer'}
                    </td>
                    <td className="px-6 py-4">{o.items.reduce((s: number, i: any) => s + i.quantity, 0)} item(s)</td>
                    <td className="px-6 py-4 font-black text-[#164A4A]">₹{o.total}</td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColor[o.status] || 'bg-gray-100'}`}>{o.status}</span></td>
                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${paymentColor[o.paymentStatus] || 'bg-gray-100'}`}>{o.paymentStatus}</span></td>
                    <td className="px-6 py-4">
                      <p className="flex items-center gap-1 font-medium">{o.fulfilmentType === 'Delivery' ? <><Truck size={14} /> Delivery</> : <><MapPin size={14} /> Pickup</>}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <select 
                          className="px-2 py-1.5 bg-white border border-[#D3DFDA] text-[#202828] rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#164A4A] disabled:opacity-50"
                          value=""
                          onChange={(e) => {
                            if (e.target.value) {
                              if (e.target.value === 'Refunded') {
                                setRefundPrompt(o);
                                setRefundReason('');
                              } else {
                                changeStatus(o._id, e.target.value);
                              }
                            }
                          }}
                          disabled={updatingId === o._id}
                        >
                          <option value="">Update Status...</option>
                          {['Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Completed', 'Cancelled', 'Refunded'].map(st => (
                            <option key={st} value={st} disabled={st === o.status}>{st}</option>
                          ))}
                        </select>
                        <button onClick={() => setSelected(o)} className="px-3 py-1.5 bg-blue-50 text-[#D2B48C] rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold inline-flex items-center gap-1 shrink-0">
                          <Eye size={13} /> View
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

      {selected && (
        <div className="fixed inset-0 z-50 p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative mx-auto mt-12 mb-12">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={22} /></button>
            <div className="flex items-center justify-between pr-8 mb-2">
              <h2 className="text-2xl font-bold text-[#202828]">{selected.orderNumber}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor[selected.status]}`}>{selected.status}</span>
            </div>
            <p className="text-sm text-[#455250] mb-4">Placed on {new Date(selected.createdAt).toLocaleString()}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-[#F1F5F3] border border-[#D3DFDA] rounded-xl p-4">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Customer</p>
                <p className="font-bold text-[#202828]">
                  {selected.customerId && (selected.customerId.firstName || selected.customerId.lastName)
                    ? `${selected.customerId.firstName || ''} ${selected.customerId.lastName || ''}`.trim()
                    : 'Unknown Customer'}
                </p>
                <p className="text-sm text-[#455250]">{selected.customerId?.email || 'No email'}</p>
                <p className="text-sm text-[#455250]">{selected.customerId?.mobile || 'No mobile'}</p>
              </div>
              <div className="bg-[#F1F5F3] border border-[#D3DFDA] rounded-xl p-4">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Payment</p>
                <p className="font-bold text-[#202828]">{selected.paymentMethod} · ₹{selected.total}</p>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-block mt-1 ${paymentColor[selected.paymentStatus]}`}>{selected.paymentStatus}</span>
                {selected.transactionId && <p className="font-mono text-xs mt-1 text-gray-500">{selected.transactionId}</p>}
              </div>
            </div>

            {selected.fulfilmentType === 'Delivery' && selected.deliveryDetails && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-2 flex items-center gap-1"><Truck size={14} /> Delivery Details</p>
                <p className="font-bold text-[#202828]">{selected.deliveryDetails.name} · {selected.deliveryDetails.phone}</p>
                <p className="text-sm text-[#455250]">{selected.deliveryDetails.address}, {selected.deliveryDetails.city}, {selected.deliveryDetails.state} — {selected.deliveryDetails.pinCode}</p>
              </div>
            )}

            <div className="border border-[#D3DFDA] rounded-xl overflow-hidden mb-4">
              <div className="px-4 py-3 bg-[#F1F5F3] font-bold text-[#202828] text-sm border-b border-[#D3DFDA]">Items</div>
              {selected.items.map((it: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between px-4 py-3 border-b border-[#F1F5F9] last:border-0">
                  <div className="flex items-center gap-3">
                    {it.image ? <img src={it.image} alt={it.name} className="w-10 h-10 rounded-lg object-cover" /> : <PackageCheck className="text-[#164A4A]" size={18} />}
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap my-0.5">
                        <p className="font-semibold text-[#202828] text-sm mr-2">{it.name}</p>
                        {it.attributes && Object.entries(it.attributes).map(([k, v]) => (
                           <span key={k} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">{String(v)}</span>
                        ))}
                      </div>
                      <p className="text-xs text-[#455250]">Qty {it.quantity} × ₹{it.unitPrice}</p>
                    </div>
                  </div>
                  <p className="font-bold text-[#202828]">₹{it.total}</p>
                </div>
              ))}
              <div className="px-4 py-3 bg-[#F2EFE8] flex justify-between text-sm">
                <span className="text-[#455250]">Subtotal <span className="text-xs">(discount ₹{selected.discount})</span></span>
                <span className="font-bold text-[#202828]">₹{selected.total}</span>
              </div>
            </div>

            {selected.cancellationReason && (
              <p className="text-sm text-[#6fa3a0] bg-red-50 rounded-xl px-4 py-3 mb-4">Cancellation reason: {selected.cancellationReason}</p>
            )}

            {(nextActions[selected.status] || []).length > 0 && (
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                {nextActions[selected.status].map((next) => (
                  <button
                    key={next}
                    disabled={updatingId === selected._id}
                    onClick={() => {
                      if (next === 'Refunded') {
                        setRefundPrompt(selected);
                        setRefundReason('');
                      } else {
                        changeStatus(selected._id, next);
                      }
                    }}
                    className={`flex-1 min-w-36 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${
                      next === 'Cancelled' || next === 'Refunded'
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-gradient-to-r from-[#164A4A] to-[#6fa3a0] text-white shadow-lg shadow-green-200 hover:opacity-90'
                    }`}
                  >
                    {updatingId === selected._id ? <Loader2 className="animate-spin" size={16} /> : next === 'Cancelled' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                    Mark {next}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-4">
              <p className="text-xs font-bold text-[#687B78] uppercase mb-4">Status Timeline</p>
              <div className="relative border-l-2 border-[#D3DFDA] ml-2 space-y-6 pb-2">
                {(selected.status === 'Cancelled' || selected.status === 'Refunded' 
                  ? selected.statusHistory 
                  : [
                      ...selected.statusHistory,
                      ...[
                        'Pending',
                        'Confirmed',
                        'Preparing',
                        selected.fulfilmentType === 'Delivery' ? 'Out for Delivery' : 'Ready for Pickup',
                        'Completed'
                      ].filter(step => !selected.statusHistory.some((h: any) => h.status === step))
                       .map(step => ({ status: step, future: true }))
                    ]
                ).map((h: any, i: number, arr: any[]) => {
                  const isReached = !h.future;
                  const isLastReached = isReached && (i === arr.length - 1 || arr[i + 1].future);
                  
                  return (
                    <div key={i} className="relative pl-6">
                      <span className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white shrink-0 ${
                        isLastReached 
                          ? (selected.status === 'Cancelled' || selected.status === 'Refunded' ? 'bg-red-600 shadow-[0_0_0_3px_rgba(220,38,38,0.2)]' : 'bg-[#164A4A] shadow-[0_0_0_3px_rgba(22,74,74,0.2)]')
                          : isReached ? 'bg-[#6fa3a0]' : 'bg-[#D3DFDA]'
                      }`} />
                      <div>
                        <p className={`font-bold ${
                          isLastReached 
                            ? (selected.status === 'Cancelled' || selected.status === 'Refunded' ? 'text-red-600' : 'text-[#164A4A]') 
                            : isReached ? 'text-[#455250]' : 'text-[#A8ADA9]'
                        }`}>{h.status}</p>
                        {isReached ? (
                          <p className="text-xs text-[#687B78] mt-0.5">{new Date(h.at).toLocaleString()}{h.note && h.note !== h.status ? ` — ${h.note}` : ''}</p>
                        ) : (
                          <p className="text-xs text-[#A8ADA9] mt-0.5">Upcoming step</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {refundPrompt && (
        <div className="fixed inset-0 z-[60] p-4 bg-black/50 backdrop-blur-sm overflow-y-auto min-h-screen flex items-center justify-center">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h2 className="text-xl font-bold text-[#202828] mb-4">Refund Payment Details</h2>
            <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
               <p className="text-sm text-gray-500 mb-1">Customer</p>
               <p className="font-bold">{refundPrompt.customerId?.firstName} {refundPrompt.customerId?.lastName}</p>
               <p className="text-sm text-gray-500 mt-3 mb-1">Amount to Refund</p>
               <p className="font-bold text-xl text-[#164A4A]">₹{refundPrompt.total}</p>
               <p className="text-sm text-gray-500 mt-3 mb-1">Payment Method Used</p>
               <p className="font-bold">{refundPrompt.paymentMethod || 'Online'}</p>
            </div>
            <p className="text-sm text-gray-600 mb-3">Please process this refund via your payment gateway or manually, then confirm below.</p>
            <input type="text" placeholder="Refund Reference / Reason" value={refundReason} onChange={(e) => setRefundReason(e.target.value)} className="w-full px-4 py-2 bg-white border border-[#D3DFDA] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#164A4A]" />
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setRefundPrompt(null); setRefundReason(''); }} className="flex-1 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={() => { changeStatus(refundPrompt._id, 'Refunded', refundReason); setRefundPrompt(null); }} className="flex-1 py-2.5 bg-[#164A4A] text-white font-bold rounded-xl hover:bg-[#0f3434] transition-colors" disabled={updatingId === refundPrompt._id}>Confirm Refund</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymStoreOrders;