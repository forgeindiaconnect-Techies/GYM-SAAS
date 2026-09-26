import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShoppingBag, Eye, X, MapPin, Truck, XCircle } from 'lucide-react';
import api from '../../utils/api';

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

const MemberOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelPrompt, setCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (status !== 'all') params.set('status', status);
      params.set('limit', '50');
      const res = await api.get(`/store/customer/orders?${params.toString()}`);
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [status]);

  const cancelOrder = async (id: string, reason: string) => {
    try {
      setCancelling(true);
      await api.post(`/store/customer/orders/${id}/cancel`, { reason });
      setSelected(null);
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#202828] tracking-tight">My Orders</h1>
        <p className="text-[#455250] mt-1">Track your gym store orders from placement to pickup/delivery.</p>
      </div>

      <div className="flex border-b border-[#D3DFDA] space-x-6 overflow-x-auto">
        {['all', 'Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Completed', 'Cancelled'].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${status === s ? 'border-[#164A4A] text-[#164A4A]' : 'border-transparent text-[#455250] hover:text-[#202828]'}`}>
            {s === 'all' ? 'All Orders' : s === 'Cancelled' ? 'Cancelled / Refunded' : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#164A4A]" size={40} /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#D3DFDA] rounded-2xl">
          <ShoppingBag className="mx-auto text-[#164A4A]/30 mb-4" size={52} />
          <p className="text-[#687B78] font-medium mb-4">No orders here yet.</p>
          <button onClick={() => navigate('/member/store')} className="px-5 py-2.5 bg-gradient-to-r from-[#164A4A] to-[#6fa3a0] text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:opacity-90 transition-opacity">
            Browse Store
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-white border border-[#D3DFDA] rounded-2xl p-5 hover:border-[#164A4A]/30 hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                <div className="flex items-start sm:items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${o.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-200' : o.status === 'Cancelled' || o.status === 'Refunded' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-[#F1F5F3] text-[#164A4A] border border-[#D3DFDA]'}`}>
                    <span className="text-lg font-black leading-none mb-0.5">{o.items.reduce((s: number, i: any) => s + i.quantity, 0)}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-opacity-80">Items</span>
                  </div>
                  
                  <div>
                    <p className="font-black text-[#202828] text-lg mb-1 tracking-tight">{o.orderNumber}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#455250]">
                      <span className="font-medium">{new Date(o.createdAt).toLocaleDateString()} at {new Date(o.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      <span className={`font-semibold inline-flex items-center gap-1 ${o.fulfilmentType === 'Delivery' ? 'text-[#164A4A]' : 'text-amber-600'}`}>
                        {o.fulfilmentType === 'Delivery' ? <Truck size={12} /> : <MapPin size={12} />} 
                        {o.fulfilmentType === 'Delivery' ? 'Delivery' : 'Gym Pickup'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 sm:border-l sm:border-gray-200 sm:pl-6 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-gray-100 sm:border-t-0">
                  <div className="flex flex-col gap-1.5 min-w-[90px]">
                    <p className="font-black text-[#164A4A] text-xl leading-none">₹{o.total}</p>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block text-center w-fit ${statusColor[o.status] || 'bg-gray-100 text-gray-700'}`}>{o.status}</span>
                  </div>
                  
                  <button onClick={() => setSelected(o)} className="px-4 py-2.5 bg-white border border-[#D3DFDA] text-[#202828] rounded-xl hover:bg-[#F1F5F3] hover:border-[#164A4A] transition-all text-sm font-bold inline-flex items-center gap-2 shadow-sm shrink-0 group">
                    <Eye size={16} className="text-[#6fa3a0] group-hover:text-[#164A4A] transition-colors" /> View Details
                  </button>
                </div>
                
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative mx-auto mt-16 mb-16">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={22} /></button>
            <div className="flex items-center justify-between pr-8 mb-2">
              <h2 className="text-2xl font-bold text-[#202828]">{selected.orderNumber}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor[selected.status]}`}>{selected.status === 'Cancelled' ? 'Cancelled / Refunded' : selected.status}</span>
            </div>
            <p className="text-sm text-[#455250] mb-4">
              Placed {new Date(selected.createdAt).toLocaleString()} ·{' '}
              {selected.fulfilmentType === 'Delivery' ? <span className="inline-flex items-center gap-1 font-semibold"><Truck size={14} /> Delivery</span> : <span className="inline-flex items-center gap-1 font-semibold"><MapPin size={14} /> Gym Pickup</span>}
            </p>

            {selected.cancellationReason && (
              <p className="text-sm text-[#6fa3a0] bg-red-50 rounded-xl px-4 py-3 mb-4">Reason: {selected.cancellationReason}</p>
            )}

            <div className="border border-[#D3DFDA] rounded-xl overflow-hidden mb-4">
              <div className="px-4 py-3 bg-[#F1F5F3] font-bold text-[#202828] text-sm border-b border-[#D3DFDA]">Items</div>
              {selected.items.map((it: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between px-4 py-3 border-b border-[#F1F5F9] last:border-0">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap my-0.5">
                      <p className="font-semibold text-[#202828] text-sm mr-2">{it.name}</p>
                      {it.attributes && Object.entries(it.attributes).map(([k, v]) => (
                         <span key={k} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">{String(v)}</span>
                      ))}
                    </div>
                    <p className="text-xs text-[#455250]">Qty {it.quantity} × ₹{it.unitPrice}</p>
                  </div>
                  <p className="font-bold text-[#202828]">₹{it.total}</p>
                </div>
              ))}
              <div className="px-4 py-3 bg-[#F2EFE8] flex justify-between text-sm">
                <span className="text-[#455250]">{selected.discount ? `Subtotal ₹${selected.subtotal} − discount ₹${selected.discount}` : 'Total'}</span>
                <span className="font-black text-[#202828]">₹{selected.total}</span>
              </div>
            </div>

            {selected.deliveryDetails && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Delivery Address</p>
                <p className="text-sm text-[#455250]">
                  {selected.deliveryDetails.name} · {selected.deliveryDetails.phone}<br />
                  {selected.deliveryDetails.address}, {selected.deliveryDetails.city}, {selected.deliveryDetails.state} — {selected.deliveryDetails.pinCode}
                </p>
              </div>
            )}

            <div className="mb-5">
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

            {selected.status === 'Pending' && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                {!cancelPrompt ? (
                  <button
                    onClick={() => setCancelPrompt(true)}
                    className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle size={17} /> Cancel Order
                  </button>
                ) : (
                  <div className="space-y-3 bg-red-50/50 p-4 rounded-xl border border-red-100">
                    <p className="text-sm font-semibold text-red-800">Why are you cancelling?</p>
                    <select
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-red-200 text-red-900 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-400"
                    >
                      <option value="">Select a reason...</option>
                      <option value="Ordered by mistake">Ordered by mistake</option>
                      <option value="Changed my mind">Changed my mind</option>
                      <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                      <option value="Item not needed anymore">Item not needed anymore</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => { setCancelPrompt(false); setCancelReason(''); }}
                        className="flex-1 py-2 bg-white text-gray-600 border border-gray-200 font-bold rounded-lg hover:bg-gray-50 transition-colors text-sm"
                      >
                        Nevermind
                      </button>
                      <button
                        onClick={() => cancelOrder(selected._id, cancelReason)}
                        disabled={cancelling || !cancelReason}
                        className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                      >
                        {cancelling ? <Loader2 className="animate-spin" size={14} /> : 'Confirm Cancel'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberOrders;