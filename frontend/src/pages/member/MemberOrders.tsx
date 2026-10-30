import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShoppingBag, Eye, X, MapPin, Truck, XCircle, Navigation } from 'lucide-react';
import api from '../../utils/api';
import MemberStoreTabs from '../../components/Member/MemberStoreTabs';

const statusColor: Record<string, string> = {
  'Pending': 'bg-yellow-100 text-yellow-700',
  'Confirmed': 'bg-[#F3E8E8] text-[#B76E79]',
  'Preparing': 'bg-[#F3E8E8] text-[#B76E79]',
  'Ready for Pickup': 'bg-[#F3E8E8] text-[#B76E79]',
  'Out for Delivery': 'bg-indigo-100 text-indigo-700',
  'Completed': 'bg-[#F3E8E8]/10 text-[#B76E79]',
  'Cancelled': 'bg-red-100 text-red-700',
  'Refunded': 'bg-[#F3E8E8] text-[#B76E79]',
};

/* ── Zigzag Timeline Component ─────────────────────────────── */
const ZigzagTimeline = ({ order }: { order: any }) => {
  const isCancelFlow = order.status === 'Cancelled' || order.status === 'Refunded';
  const steps = isCancelFlow
    ? order.statusHistory
    : [
        ...order.statusHistory,
        ...[
          'Pending', 'Confirmed', 'Preparing',
          order.fulfilmentType === 'Delivery' ? 'Out for Delivery' : 'Ready for Pickup',
          'Completed'
        ]
          .filter((step: string) => !order.statusHistory.some((h: any) => h.status === step))
          .map((step: string) => ({ status: step, future: true }))
      ];

  return (
    <div className="relative">
      {/* Center vertical line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[#E7DADD] -translate-x-1/2" />
      <div className="space-y-6">
        {steps.map((h: any, i: number, arr: any[]) => {
          const isReached = !h.future;
          const isLastReached = isReached && (i === arr.length - 1 || arr[i + 1]?.future);
          const isLeft = i % 2 === 0;
          const isCancelStatus = isCancelFlow && isLastReached;

          const dotColor = isCancelStatus
            ? 'bg-red-500 shadow-[0_0_0_4px_rgba(220,38,38,0.15)]'
            : isLastReached
            ? 'bg-[#B76E79] shadow-[0_0_0_4px_rgba(22,74,74,0.15)]'
            : isReached
            ? 'bg-[#F3E8E8]'
            : 'bg-[#E7DADD]';

          const cardBg = isReached
            ? isCancelStatus
              ? 'bg-red-50 border-red-200'
              : isLastReached
              ? 'bg-[#F3E8E8] border-[#F3E8E8]'
              : 'bg-[#F3E8E8] border-[#E7DADD]'
            : 'bg-[#F3E8E8] border-[#E7DADD] opacity-50';

          const labelColor = isCancelStatus
            ? 'text-red-600'
            : isLastReached
            ? 'text-[#B76E79]'
            : isReached
            ? 'text-[#57534E]'
            : 'text-[#57534E]';

          return (
            <div key={i} className="relative flex items-center justify-between gap-2">
              {/* LEFT CARD or spacer */}
              <div className="w-[44%]">
                {isLeft ? (
                  <div className={`rounded-xl border p-3 text-right ${cardBg}`}>
                    <p className={`font-bold text-sm ${labelColor}`}>{h.status}</p>
                    {isReached ? (
                      <p className="text-[11px] text-[#57534E] mt-0.5 leading-snug">
                        {new Date(h.at).toLocaleString()}
                        {h.note && h.note !== h.status ? <><br /><span className="italic">{h.note}</span></> : ''}
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#57534E] mt-0.5">Upcoming step</p>
                    )}
                  </div>
                ) : <div />}
              </div>

              {/* CENTER DOT */}
              <div className="relative z-10 flex-shrink-0">
                <div className={`w-9 h-9 rounded-full border-2 border-white flex items-center justify-center ${dotColor}`}>
                  {isReached ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-[#FFFFFF]/60" />
                  )}
                </div>
              </div>

              {/* RIGHT CARD or spacer */}
              <div className="w-[44%]">
                {!isLeft ? (
                  <div className={`rounded-xl border p-3 ${cardBg}`}>
                    <p className={`font-bold text-sm ${labelColor}`}>{h.status}</p>
                    {isReached ? (
                      <p className="text-[11px] text-[#57534E] mt-0.5 leading-snug">
                        {new Date(h.at).toLocaleString()}
                        {h.note && h.note !== h.status ? <><br /><span className="italic">{h.note}</span></> : ''}
                      </p>
                    ) : (
                      <p className="text-[11px] text-[#57534E] mt-0.5">Upcoming step</p>
                    )}
                  </div>
                ) : <div />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Main Component ─────────────────────────────────────────── */
const MemberOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('all');

  // View Details modal
  const [selected, setSelected] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelPrompt, setCancelPrompt] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Track Order modal (separate)
  const [tracking, setTracking] = useState<any>(null);

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
      <MemberStoreTabs />
      <div>
        <h1 className="text-3xl font-bold text-[#292524] tracking-tight">My Orders</h1>
        <p className="text-[#57534E] mt-1">Track your gym store orders from placement to pickup/delivery.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E7DADD] space-x-6 overflow-x-auto">
        {['all', 'Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Completed', 'Cancelled'].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${status === s ? 'border-[#B76E79] text-[#B76E79]' : 'border-transparent text-[#57534E] hover:text-[#FFFFFF]'}`}>
            {s === 'all' ? 'All Orders' : s === 'Cancelled' ? 'Cancelled / Refunded' : s}
          </button>
        ))}
      </div>

      {/* Order List */}
      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#B76E79]" size={40} /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl">
          <ShoppingBag className="mx-auto text-[#B76E79]/30 mb-4" size={52} />
          <p className="text-[#57534E] font-medium mb-4">No orders here yet.</p>
          <button onClick={() => navigate('/member/store')} className="px-5 py-2.5 bg-gradient-to-r from-[#B76E79] to-[#9F5965] text-[#FFFFFF] font-bold font-bold rounded-xl shadow-lg shadow-[#B76E79]/15 hover:opacity-90 transition-opacity">
            Browse Store
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-5 hover:border-[#B76E79]/30 hover:shadow-md transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                {/* Left: item count + order info */}
                <div className="flex items-start sm:items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 ${o.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-200' : o.status === 'Cancelled' || o.status === 'Refunded' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-[#F3E8E8] text-[#B76E79] border border-[#E7DADD]'}`}>
                    <span className="text-lg font-black leading-none mb-0.5">{o.items.reduce((s: number, i: any) => s + i.quantity, 0)}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Items</span>
                  </div>
                  <div>
                    <p className="font-black text-[#292524] text-lg mb-1 tracking-tight">{o.orderNumber}</p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#57534E]">
                      <span className="font-medium">{new Date(o.createdAt).toLocaleDateString()} at {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300" />
                      <span className={`font-semibold inline-flex items-center gap-1 ${o.fulfilmentType === 'Delivery' ? 'text-[#B76E79]' : 'text-amber-600'}`}>
                        {o.fulfilmentType === 'Delivery' ? <Truck size={12} /> : <MapPin size={12} />}
                        {o.fulfilmentType === 'Delivery' ? 'Delivery' : 'Gym Pickup'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: price + status + TWO BUTTONS */}
                <div className="flex items-center justify-between sm:justify-end gap-4 sm:border-l sm:border-[#E7DADD] sm:pl-6 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-[#E7DADD] sm:border-t-0">
                  <div className="flex flex-col gap-1.5 min-w-[90px]">
                    <p className="font-black text-[#B76E79] text-xl leading-none">₹{o.total}</p>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block text-center w-fit ${statusColor[o.status] || 'bg-[#F3E8E8] text-[#292524]'}`}>{o.status}</span>
                  </div>

                  {/* ── TWO SEPARATE BUTTONS ── */}
                  <div className="flex flex-col gap-2">
                    {/* View Details */}
                    <button
                      onClick={() => { setSelected(o); setCancelPrompt(false); setCancelReason(''); }}
                      className="px-4 py-2 bg-[#FFFFFF] border border-[#E7DADD] text-[#292524] rounded-xl hover:bg-[#F3E8E8] hover:border-[#B76E79] transition-all text-xs font-bold inline-flex items-center gap-1.5 shadow-sm group"
                    >
                      <Eye size={14} className="text-[#9F5965] group-hover:text-[#B76E79] transition-colors" />
                      View Details
                    </button>

                    {/* Track Order */}
                    <button
                      onClick={() => setTracking(o)}
                      className="px-4 py-2 bg-gradient-to-r from-[#B76E79] to-[#9F5965] text-[#FFFFFF] font-bold rounded-xl hover:opacity-90 transition-opacity text-xs font-bold inline-flex items-center gap-1.5 shadow-sm shadow-[#B76E79]/15"
                    >
                      <Navigation size={14} />
                      Track Order
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════
          MODAL 1 — VIEW DETAILS (no timeline)
      ══════════════════════════════════════ */}
      {selected && (
        <div className="fixed inset-0 z-50 p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative mx-auto mt-16 mb-16">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-[#57534E] hover:text-[#292524]"><X size={22} /></button>

            {/* Header */}
            <div className="flex items-center justify-between pr-8 mb-2">
              <h2 className="text-2xl font-bold text-[#292524]">{selected.orderNumber}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor[selected.status]}`}>
                {selected.status === 'Cancelled' ? 'Cancelled / Refunded' : selected.status}
              </span>
            </div>
            <p className="text-sm text-[#57534E] mb-5">
              Placed {new Date(selected.createdAt).toLocaleString()} ·{' '}
              {selected.fulfilmentType === 'Delivery'
                ? <span className="inline-flex items-center gap-1 font-semibold"><Truck size={14} /> Delivery</span>
                : <span className="inline-flex items-center gap-1 font-semibold"><MapPin size={14} /> Gym Pickup</span>}
            </p>

            {selected.cancellationReason && (
              <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-4">Reason: {selected.cancellationReason}</p>
            )}

            {/* Items */}
            <div className="border border-[#E7DADD] rounded-xl overflow-hidden mb-4">
              <div className="px-4 py-3 bg-[#F3E8E8] font-bold text-[#292524] text-sm border-b border-[#E7DADD]">Items Ordered</div>
              {selected.items.map((it: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between px-4 py-3 border-b border-[#F3E8E8] last:border-0">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap my-0.5">
                      <p className="font-semibold text-[#292524] text-sm mr-2">{it.name}</p>
                      {it.attributes && Object.entries(it.attributes).map(([k, v]) => (
                        <span key={k} className="text-[10px] bg-[#F3E8E8] text-[#292524] px-1.5 py-0.5 rounded font-medium">{String(v)}</span>
                      ))}
                    </div>
                    <p className="text-xs text-[#57534E]">Qty {it.quantity} × ₹{it.unitPrice}</p>
                  </div>
                  <p className="font-bold text-[#292524]">₹{it.total}</p>
                </div>
              ))}
              <div className="px-4 py-3 bg-[#F3E8E8] flex justify-between text-sm">
                <span className="text-[#57534E]">{selected.discount ? `Subtotal ₹${selected.subtotal} − discount ₹${selected.discount}` : 'Total'}</span>
                <span className="font-black text-[#292524]">₹{selected.total}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-[#F3E8E8] border border-[#E7DADD] rounded-xl p-4 mb-4">
              <p className="text-xs text-[#57534E] font-semibold uppercase mb-2">Payment</p>
              <p className="font-bold text-[#292524]">{selected.paymentMethod} · ₹{selected.total}</p>
              {selected.paymentMethod === 'Net Banking' && selected.bankName && (
                <p className="text-sm text-[#57534E] mt-0.5">Bank: <span className="font-semibold">{selected.bankName}</span></p>
              )}
              <p className="text-xs text-[#292524] font-medium mt-1 font-semibold">{selected.paymentStatus}</p>
            </div>

            {/* Delivery Address */}
            {selected.deliveryDetails && (
              <div className="bg-[#F3E8E8] border border-[#E7DADD] rounded-xl p-4 mb-4">
                <p className="text-xs text-[#57534E] font-semibold uppercase mb-2">Delivery Address</p>
                <p className="text-sm text-[#57534E]">
                  {selected.deliveryDetails.name} · {selected.deliveryDetails.phone}<br />
                  {selected.deliveryDetails.address}, {selected.deliveryDetails.city}, {selected.deliveryDetails.state} — {selected.deliveryDetails.pinCode}
                </p>
              </div>
            )}

            {/* Cancel Order (Pending only) */}
            {selected.status === 'Pending' && (
              <div className="mt-4 pt-4 border-t border-[#E7DADD]">
                {!cancelPrompt ? (
                  <button onClick={() => setCancelPrompt(true)} className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2">
                    <XCircle size={17} /> Cancel Order
                  </button>
                ) : (
                  <div className="space-y-3 bg-red-50/50 p-4 rounded-xl border border-red-100">
                    <p className="text-sm font-semibold text-red-800">Why are you cancelling?</p>
                    <select value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="w-full px-3 py-2.5 bg-[#FFFFFF] border border-red-200 text-red-900 rounded-lg text-sm font-medium focus:outline-none focus:ring-1 focus:ring-red-400">
                      <option value="">Select a reason...</option>
                      <option value="Ordered by mistake">Ordered by mistake</option>
                      <option value="Changed my mind">Changed my mind</option>
                      <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                      <option value="Item not needed anymore">Item not needed anymore</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="flex gap-2 pt-1">
                      <button onClick={() => { setCancelPrompt(false); setCancelReason(''); }} className="flex-1 py-2 bg-[#FFFFFF] text-[#292524] border border-[#E7DADD] font-bold rounded-lg hover:bg-[#F3E8E8] transition-colors text-sm">Nevermind</button>
                      <button onClick={() => cancelOrder(selected._id, cancelReason)} disabled={cancelling || !cancelReason} className="flex-1 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2">
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

      {/* ══════════════════════════════════════
          MODAL 2 — TRACK ORDER (timeline only)
      ══════════════════════════════════════ */}
      {tracking && (
        <div className="fixed inset-0 z-50 p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative mx-auto mt-16 mb-16">
            <button onClick={() => setTracking(null)} className="absolute top-4 right-4 text-[#57534E] hover:text-[#292524]"><X size={22} /></button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B76E79] to-[#9F5965] flex items-center justify-center">
                <Navigation size={17} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#292524]">Track Order</h2>
                <p className="text-xs text-[#57534E] font-semibold">{tracking.orderNumber}</p>
              </div>
              <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${statusColor[tracking.status]}`}>{tracking.status}</span>
            </div>

            <p className="text-xs text-[#57534E] mb-6 mt-2">
              {tracking.fulfilmentType === 'Delivery'
                ? <span className="inline-flex items-center gap-1"><Truck size={12} /> Delivery order</span>
                : <span className="inline-flex items-center gap-1"><MapPin size={12} /> Gym Pickup order</span>}
              {' · '}Placed {new Date(tracking.createdAt).toLocaleDateString()}
            </p>

            {/* Zigzag Timeline */}
            <ZigzagTimeline order={tracking} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberOrders;