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
  'Completed': 'bg-green-100 text-green-700',
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

  const cancelOrder = async (id: string) => {
    if (!window.confirm('Cancel this order? The amount will be refunded and stock returned.')) return;
    try {
      setCancelling(true);
      await api.post(`/store/customer/orders/${id}/cancel`);
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
        <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">My Orders</h1>
        <p className="text-[#475569] mt-1">Track your gym store orders from placement to pickup/delivery.</p>
      </div>

      <div className="flex border-b border-[#CCFBF1] space-x-6 overflow-x-auto">
        {['all', 'Pending', 'Confirmed', 'Preparing', 'Ready for Pickup', 'Out for Delivery', 'Completed', 'Cancelled', 'Refunded'].map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`py-3 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap ${status === s ? 'border-[#16A34A] text-[#16A34A]' : 'border-transparent text-[#475569] hover:text-[#1E293B]'}`}>
            {s === 'all' ? 'All Orders' : s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#16A34A]" size={40} /></div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#CCFBF1] rounded-2xl">
          <ShoppingBag className="mx-auto text-[#16A34A]/30 mb-4" size={52} />
          <p className="text-[#64748B] font-medium mb-4">No orders here yet.</p>
          <button onClick={() => navigate('/member/store')} className="px-5 py-2.5 bg-gradient-to-r from-[#16A34A] to-[#0D9488] text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:opacity-90 transition-opacity">
            Browse Store
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-white border border-[#CCFBF1] rounded-2xl p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xs font-black ${o.status === 'Completed' ? 'bg-green-100 text-green-700' : o.status === 'Cancelled' || o.status === 'Refunded' ? 'bg-red-100 text-red-700' : 'bg-[#F0FDFA] text-[#16A34A]'}`}>
                    {o.items.reduce((s: number, i: any) => s + i.quantity, 0)}
                  </div>
                  <div>
                    <p className="font-bold text-[#1E293B]">{o.orderNumber}</p>
                    <p className="text-xs text-[#475569]">
                      {new Date(o.createdAt).toLocaleString()} · {o.fulfilmentType === 'Delivery' ? 'Delivery' : 'Gym Pickup'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-black text-[#16A34A] text-lg">₹{o.total}</p>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold inline-block ${statusColor[o.status] || 'bg-gray-100'}`}>{o.status}</span>
                  </div>
                  <button onClick={() => setSelected(o)} className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-bold inline-flex items-center gap-1">
                    <Eye size={14} /> Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative my-8">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={22} /></button>
            <div className="flex items-center justify-between pr-8 mb-2">
              <h2 className="text-2xl font-bold text-[#1E293B]">{selected.orderNumber}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColor[selected.status]}`}>{selected.status}</span>
            </div>
            <p className="text-sm text-[#475569] mb-4">
              Placed {new Date(selected.createdAt).toLocaleString()} ·{' '}
              {selected.fulfilmentType === 'Delivery' ? <span className="inline-flex items-center gap-1 font-semibold"><Truck size={14} /> Delivery</span> : <span className="inline-flex items-center gap-1 font-semibold"><MapPin size={14} /> Gym Pickup</span>}
            </p>

            {selected.cancellationReason && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3 mb-4">Reason: {selected.cancellationReason}</p>
            )}

            <div className="border border-[#CCFBF1] rounded-xl overflow-hidden mb-4">
              <div className="px-4 py-3 bg-[#F0FDFA] font-bold text-[#1E293B] text-sm border-b border-[#CCFBF1]">Items</div>
              {selected.items.map((it: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between px-4 py-3 border-b border-[#F1F5F9] last:border-0">
                  <div>
                    <p className="font-semibold text-[#1E293B] text-sm">{it.name}</p>
                    <p className="text-xs text-[#475569]">Qty {it.quantity} × ₹{it.unitPrice}</p>
                  </div>
                  <p className="font-bold text-[#1E293B]">₹{it.total}</p>
                </div>
              ))}
              <div className="px-4 py-3 bg-[#F8FAFC] flex justify-between text-sm">
                <span className="text-[#475569]">{selected.discount ? `Subtotal ₹${selected.subtotal} − discount ₹${selected.discount}` : 'Total'}</span>
                <span className="font-black text-[#1E293B]">₹{selected.total}</span>
              </div>
            </div>

            {selected.deliveryDetails && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-500 font-semibold uppercase mb-2">Delivery Address</p>
                <p className="text-sm text-[#475569]">
                  {selected.deliveryDetails.name} · {selected.deliveryDetails.phone}<br />
                  {selected.deliveryDetails.address}, {selected.deliveryDetails.city}, {selected.deliveryDetails.state} — {selected.deliveryDetails.pinCode}
                </p>
              </div>
            )}

            <div className="mb-5">
              <p className="text-xs font-bold text-[#64748B] uppercase mb-2">Status Timeline</p>
              <div className="space-y-2">
                {selected.statusHistory.map((h: any, i: number) => (
                  <div key={i} className={`flex items-start gap-3 text-sm ${i === selected.statusHistory.length - 1 ? '' : ''}`}>
                    <span className={`w-2.5 h-2.5 mt-1.5 rounded-full shrink-0 ${i === selected.statusHistory.length - 1 ? 'bg-[#16A34A]' : 'bg-[#CCFBF1]'}`} />
                    <div>
                      <p className="font-semibold text-[#1E293B]">{h.status}</p>
                      <p className="text-xs text-[#475569]">{new Date(h.at).toLocaleString()}{h.note && (h.note !== h.status ? ` — ${h.note}` : '')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selected.status === 'Pending' && (
              <button
                onClick={() => cancelOrder(selected._id)}
                disabled={cancelling}
                className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelling ? <Loader2 className="animate-spin" size={17} /> : <XCircle size={17} />}
                Cancel Order
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberOrders;