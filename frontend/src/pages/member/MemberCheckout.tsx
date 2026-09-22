import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, MapPin, Truck, CreditCard, CheckCircle2, ArrowLeft } from 'lucide-react';
import api from '../../utils/api';

const PAYMENT_METHODS = ['UPI', 'Credit / Debit Card', 'Net Banking', 'Cash at Gym'];

const MemberCheckout = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [fulfilmentType, setFulfilmentType] = useState<'Gym Pickup' | 'Delivery'>('Gym Pickup');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [delivery, setDelivery] = useState({ name: '', phone: '', address: '', city: '', state: '', pinCode: '' });
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/store/customer/cart');
      const cart = res.data.cart || [];
      setItems(cart);
      setSubtotal(res.data.subtotal || 0);
      if (cart.length && cart.every((row: any) => row.product?.fulfilmentType === 'Delivery')) {
        setFulfilmentType('Delivery');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const placeOrder = async () => {
    if (items.length === 0) { alert('Your cart is empty.'); return; }
    if (fulfilmentType === 'Delivery') {
      for (const key of ['name', 'phone', 'address', 'city', 'state', 'pinCode'] as const) {
        if (!delivery[key].trim()) {
          alert(`Please fill in the delivery ${key === 'pinCode' ? 'pincode' : key}.`);
          return;
        }
      }
    }
    try {
      setPlacing(true);
      const res = await api.post('/store/customer/checkout', {
        fulfilmentType,
        deliveryDetails: fulfilmentType === 'Delivery' ? delivery : undefined,
        paymentMethod,
        discount: 0,
      });
      setPlacedOrder(res.data.order);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center bg-white border border-[#CCFBF1] rounded-3xl p-10">
        <CheckCircle2 className="mx-auto text-[#16A34A] mb-4" size={64} />
        <h1 className="text-3xl font-bold text-[#1E293B] mb-2">Order Placed!</h1>
        <p className="text-[#475569] mb-2">
          Order <span className="font-bold text-[#1E293B]">{placedOrder.orderNumber}</span> is confirmed.
        </p>
        <p className="text-[#475569] mb-6">
          Paid <span className="font-black text-[#16A34A]">₹{placedOrder.total}</span> via {placedOrder.paymentMethod}. Track it under My Orders.
        </p>
        <button onClick={() => navigate('/member/orders')} className="w-full py-3 bg-gradient-to-r from-[#16A34A] to-[#0D9488] text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:opacity-90 transition-opacity">
          Go to My Orders
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#16A34A]" size={40} /></div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center bg-white border border-[#CCFBF1] rounded-3xl p-10">
        <h1 className="text-2xl font-bold text-[#1E293B] mb-2">Nothing to checkout</h1>
        <p className="text-[#475569] mb-6">Your cart is empty.</p>
        <Link to="/member/store" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#16A34A] to-[#0D9488] text-white font-bold rounded-xl shadow-lg shadow-green-200">
          <ArrowLeft size={17} /> Browse Store
        </Link>
      </div>
    );
  }

  const inputCls = 'w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-3 py-2 text-sm text-[#1E293B] focus:border-[#16A34A] outline-none';

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate('/member/cart')} className="flex items-center gap-1 text-sm font-bold text-[#0D9488] hover:underline mb-2">
          <ArrowLeft size={15} /> Back to cart
        </button>
        <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Checkout</h1>
        <p className="text-[#475569] mt-1">Confirm your order and payment.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Fulfilment */}
          <div className="bg-white border border-[#CCFBF1] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[#1E293B] mb-4">How would you like to receive it?</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFulfilmentType('Gym Pickup')}
                className={`border-2 rounded-2xl p-4 text-left transition-colors ${fulfilmentType === 'Gym Pickup' ? 'border-[#16A34A] bg-[#F0FDFA]' : 'border-[#CCFBF1] hover:border-[#16A34A]/40'}`}
              >
                <MapPin className="text-[#16A34A]" size={22} />
                <p className="font-bold text-[#1E293B] mt-2">Gym Pickup</p>
                <p className="text-xs text-[#475569]">Collect from the gym at your convenience.</p>
              </button>
              <button
                onClick={() => setFulfilmentType('Delivery')}
                className={`border-2 rounded-2xl p-4 text-left transition-colors ${fulfilmentType === 'Delivery' ? 'border-[#16A34A] bg-[#F0FDFA]' : 'border-[#CCFBF1] hover:border-[#16A34A]/40'}`}
              >
                <Truck className="text-[#16A34A]" size={22} />
                <p className="font-bold text-[#1E293B] mt-2">Delivery</p>
                <p className="text-xs text-[#475569]">Get it delivered to your address.</p>
              </button>
            </div>

            {fulfilmentType === 'Delivery' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase mb-1 block">Full Name *</label>
                  <input value={delivery.name} onChange={(e) => setDelivery({ ...delivery, name: e.target.value })} className={inputCls} placeholder="Receiver name" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase mb-1 block">Phone *</label>
                  <input value={delivery.phone} onChange={(e) => setDelivery({ ...delivery, phone: e.target.value })} className={inputCls} placeholder="10-digit mobile" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-[#64748B] uppercase mb-1 block">Address *</label>
                  <input value={delivery.address} onChange={(e) => setDelivery({ ...delivery, address: e.target.value })} className={inputCls} placeholder="House no, street, area" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase mb-1 block">City *</label>
                  <input value={delivery.city} onChange={(e) => setDelivery({ ...delivery, city: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#64748B] uppercase mb-1 block">State *</label>
                  <input value={delivery.state} onChange={(e) => setDelivery({ ...delivery, state: e.target.value })} className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-[#64748B] uppercase mb-1 block">Pincode *</label>
                  <input value={delivery.pinCode} onChange={(e) => setDelivery({ ...delivery, pinCode: e.target.value })} className={`${inputCls} sm:max-w-48`} />
                </div>
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="bg-white border border-[#CCFBF1] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[#1E293B] mb-4 flex items-center gap-2"><CreditCard size={19} className="text-[#16A34A]" /> Payment Method</h3>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className={`${inputCls} max-w-xs`}>
              {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
            <p className="text-xs text-[#64748B] mt-3">
              Payment is processed securely and instantly. You'll receive confirmation notifications as your order is fulfilled.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 self-start bg-white border border-[#CCFBF1] rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[#1E293B] mb-4">Order Summary</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {items.map((row) => {
              const p = row.product;
              const price = p.discountPrice ?? p.sellingPrice;
              return (
                <div key={p._id} className="flex justify-between items-center text-sm">
                  <span className="text-[#475569]">{p.name} <span className="text-[#94A3B8]">× {row.quantity}</span></span>
                  <span className="font-bold text-[#1E293B]">₹{price * row.quantity}</span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-[#CCFBF1] pt-3 mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-[#475569]">
              <span>Subtotal</span>
              <span className="font-bold text-[#1E293B]">₹{subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-bold text-[#1E293B]">Total</span>
              <span className="font-black text-[#16A34A] text-lg">₹{subtotal}</span>
            </div>
          </div>
          <button
            onClick={placeOrder}
            disabled={placing}
            className="mt-6 w-full py-3 bg-gradient-to-r from-[#16A34A] to-[#0D9488] text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {placing ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
            {placing ? 'Placing Order...' : `Pay ₹${subtotal} & Place Order`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberCheckout;