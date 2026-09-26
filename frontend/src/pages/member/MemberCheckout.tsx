import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, MapPin, Truck, CreditCard, CheckCircle2, ArrowLeft } from 'lucide-react';
import QRCode from 'react-qr-code';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const PAYMENT_METHODS = ['UPI', 'Credit / Debit Card', 'Net Banking', 'Cash at Gym'];

const MemberCheckout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [fulfilmentType, setFulfilmentType] = useState<'Gym Pickup' | 'Delivery'>('Gym Pickup');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [delivery, setDelivery] = useState({ name: '', phone: '', address: '', city: '', state: '', pinCode: '' });
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  const isPremium = user?.subscriptionPlan?.toLowerCase().includes('premium');
  const discountAmount = isPremium ? Math.round(subtotal * 0.3) : 0;
  const finalTotal = subtotal - discountAmount;

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
        discount: discountAmount,
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
      <div className="max-w-lg mx-auto mt-16 text-center bg-white border border-[#D3DFDA] rounded-3xl p-10">
        <CheckCircle2 className="mx-auto text-[#164A4A] mb-4" size={64} />
        <h1 className="text-3xl font-bold text-[#202828] mb-2">Order Placed!</h1>
        <p className="text-[#455250] mb-2">
          Order <span className="font-bold text-[#202828]">{placedOrder.orderNumber}</span> is confirmed.
        </p>
        <p className="text-[#455250] mb-6">
          Paid <span className="font-black text-[#164A4A]">₹{placedOrder.total}</span> via {placedOrder.paymentMethod}. Track it under My Orders.
        </p>
        <button onClick={() => navigate('/member/store/orders')} className="w-full py-3 bg-gradient-to-r from-[#164A4A] to-[#6fa3a0] text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:opacity-90 transition-opacity">
          Go to My Orders
        </button>
      </div>
    );
  }

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#164A4A]" size={40} /></div>;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center bg-white border border-[#D3DFDA] rounded-3xl p-10">
        <h1 className="text-2xl font-bold text-[#202828] mb-2">Nothing to checkout</h1>
        <p className="text-[#455250] mb-6">Your cart is empty.</p>
        <Link to="/member/store" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#164A4A] to-[#6fa3a0] text-white font-bold rounded-xl shadow-lg shadow-green-200">
          <ArrowLeft size={17} /> Browse Store
        </Link>
      </div>
    );
  }

  const inputCls = 'w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-3 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none';

  return (
    <div className="space-y-6">
      <div>
        <button onClick={() => navigate('/member/store/cart')} className="flex items-center gap-1 text-sm font-bold text-[#6fa3a0] hover:underline mb-2">
          <ArrowLeft size={15} /> Back to cart
        </button>
        <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Checkout</h1>
        <p className="text-[#455250] mt-1">Confirm your order and payment.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Fulfilment */}
          <div className="bg-white border border-[#D3DFDA] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[#202828] mb-4">How would you like to receive it?</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFulfilmentType('Gym Pickup')}
                className={`border-2 rounded-2xl p-4 text-left transition-colors ${fulfilmentType === 'Gym Pickup' ? 'border-[#164A4A] bg-[#F1F5F3]' : 'border-[#D3DFDA] hover:border-[#164A4A]/40'}`}
              >
                <MapPin className="text-[#164A4A]" size={22} />
                <p className="font-bold text-[#202828] mt-2">Gym Pickup</p>
                <p className="text-xs text-[#455250]">Collect from the gym at your convenience.</p>
              </button>
              <button
                onClick={() => setFulfilmentType('Delivery')}
                className={`border-2 rounded-2xl p-4 text-left transition-colors ${fulfilmentType === 'Delivery' ? 'border-[#164A4A] bg-[#F1F5F3]' : 'border-[#D3DFDA] hover:border-[#164A4A]/40'}`}
              >
                <Truck className="text-[#164A4A]" size={22} />
                <p className="font-bold text-[#202828] mt-2">Delivery</p>
                <p className="text-xs text-[#455250]">Get it delivered to your address.</p>
              </button>
            </div>

            {fulfilmentType === 'Delivery' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                <div>
                  <label className="text-xs font-bold text-[#687B78] uppercase mb-1 block">Full Name *</label>
                  <input value={delivery.name} onChange={(e) => setDelivery({ ...delivery, name: e.target.value })} className={inputCls} placeholder="Receiver name" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#687B78] uppercase mb-1 block">Phone *</label>
                  <input value={delivery.phone} onChange={(e) => setDelivery({ ...delivery, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} maxLength={10} className={inputCls} placeholder="10-digit mobile" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-[#687B78] uppercase mb-1 block">Address *</label>
                  <input value={delivery.address} onChange={(e) => setDelivery({ ...delivery, address: e.target.value })} className={inputCls} placeholder="House no, street, area" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#687B78] uppercase mb-1 block">City *</label>
                  <input value={delivery.city} onChange={(e) => setDelivery({ ...delivery, city: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#687B78] uppercase mb-1 block">State *</label>
                  <input value={delivery.state} onChange={(e) => setDelivery({ ...delivery, state: e.target.value })} className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-[#687B78] uppercase mb-1 block">Pincode *</label>
                  <input value={delivery.pinCode} onChange={(e) => setDelivery({ ...delivery, pinCode: e.target.value.replace(/\D/g, '').slice(0, 6) })} maxLength={6} className={`${inputCls} sm:max-w-48`} placeholder="6-digit pincode" />
                </div>
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="bg-white border border-[#D3DFDA] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[#202828] mb-4 flex items-center gap-2"><CreditCard size={19} className="text-[#164A4A]" /> Payment Method</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {PAYMENT_METHODS.filter(m => fulfilmentType === 'Delivery' ? m !== 'Cash at Gym' : true).map((method) => (
                <label 
                  key={method} 
                  className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-colors ${
                    paymentMethod === method 
                      ? 'border-[#164A4A] bg-[#164A4A]/5' 
                      : 'border-[#D3DFDA] hover:border-[#164A4A]/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold ${paymentMethod === method ? 'text-[#164A4A]' : 'text-[#455250]'}`}>{method}</span>
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value={method} 
                      checked={paymentMethod === method} 
                      onChange={(e) => setPaymentMethod(e.target.value)} 
                      className="hidden" 
                    />
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method ? 'border-[#164A4A]' : 'border-gray-300'}`}>
                      {paymentMethod === method && <div className="w-2.5 h-2.5 bg-[#164A4A] rounded-full"></div>}
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="bg-[#F1F5F3] border border-[#D3DFDA] p-5 rounded-xl">
              {paymentMethod === 'UPI' && (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <p className="text-sm font-bold text-[#202828]">Pay using UPI App</p>
                      <div className="flex flex-wrap gap-2">
                        {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                           <button key={app} className="px-3 py-1.5 bg-white border border-[#D3DFDA] rounded-lg text-xs font-bold text-[#455250] hover:border-[#164A4A] hover:text-[#164A4A] transition-colors shadow-sm">{app}</button>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-px bg-[#D3DFDA] flex-1"></div>
                        <span className="text-[10px] font-black text-[#6fa3a0] uppercase tracking-wider">OR</span>
                        <div className="h-px bg-[#D3DFDA] flex-1"></div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-[#687B78] uppercase mb-1 block">Enter UPI ID</label>
                        <input placeholder="e.g. yourname@bank" className={inputCls} />
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-center justify-center md:border-l md:border-[#D3DFDA] md:pl-8 pt-4 md:pt-0 border-t md:border-t-0 border-[#D3DFDA] min-w-[180px]">
                      <div className="relative p-4 bg-white border border-[#D3DFDA] rounded-2xl mb-3 shadow-sm flex items-center justify-center">
                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#6fa3a0] rounded-tl-sm"></div>
                        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#6fa3a0] rounded-tr-sm"></div>
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#6fa3a0] rounded-bl-sm"></div>
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#6fa3a0] rounded-br-sm"></div>
                        <QRCode value={`upi://pay?pa=aigymstore@ybl&pn=AI%20Gym%20Store&am=${finalTotal}&cu=INR`} size={80} bgColor="transparent" fgColor="#202828" level="L" />
                      </div>
                      <p className="text-sm font-bold text-[#202828]">Scan QR to Pay</p>
                      <p className="text-[10px] font-semibold text-[#6fa3a0] uppercase tracking-wider mt-0.5">Any UPI App</p>
                    </div>
                  </div>
                </div>
              )}
              
              {paymentMethod === 'Credit / Debit Card' && (
                <div className="space-y-4">
                  <p className="text-sm font-bold text-[#202828]">Enter Card Details</p>
                  <div>
                    <label className="text-xs font-bold text-[#687B78] uppercase mb-1 block">Card Number</label>
                    <input placeholder="XXXX XXXX XXXX XXXX" maxLength={19} className={inputCls} />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#687B78] uppercase mb-1 block">Name on Card</label>
                    <input placeholder="John Doe" className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#687B78] uppercase mb-1 block">Expiry (MM/YY)</label>
                      <input placeholder="MM/YY" maxLength={5} className={inputCls} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#687B78] uppercase mb-1 block">CVV</label>
                      <input type="password" placeholder="***" maxLength={4} className={inputCls} />
                    </div>
                  </div>
                </div>
              )}
              
              {paymentMethod === 'Net Banking' && (
                <div className="space-y-4">
                  <p className="text-sm font-bold text-[#202828]">Select your Bank</p>
                  <select className={inputCls}>
                    <option value="">Choose a bank...</option>
                    <option value="sbi">State Bank of India (SBI)</option>
                    <option value="hdfc">HDFC Bank</option>
                    <option value="icici">ICICI Bank</option>
                    <option value="axis">Axis Bank</option>
                    <option value="kotak">Kotak Mahindra Bank</option>
                    <option value="other">Other Banks...</option>
                  </select>
                </div>
              )}
              
              {paymentMethod === 'Cash at Gym' && (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#164A4A]/10 rounded-full flex items-center justify-center shrink-0">
                    <CheckCircle2 size={20} className="text-[#164A4A]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#202828]">Pay at Front Desk</p>
                    <p className="text-xs text-[#455250] mt-0.5">Your order will be reserved. Please pay by cash or card when you pick up your items.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="lg:sticky lg:top-24 self-start bg-white border border-[#D3DFDA] rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[#202828] mb-4">Order Summary</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {items.map((row, idx) => {
              const p = row.product;
              const v = row.variant;
              const price = v ? (v.discountPrice ?? v.price) : (p.discountPrice ?? p.sellingPrice);
              const attrs = v && v.attributes ? Object.values(v.attributes).join(' / ') : '';
              const baseAttrs = !v && p.attributes ? Object.values(p.attributes).slice(0, 2).join(' / ') : '';
              return (
                <div key={`${p._id}-${idx}`} className="flex justify-between items-center text-sm">
                  <span className="text-[#455250]">{p.name} {attrs ? `(${attrs})` : baseAttrs ? `(${baseAttrs})` : ''} <span className="text-[#A8ADA9]">× {row.quantity}</span></span>
                  <span className="font-bold text-[#202828]">₹{price * row.quantity}</span>
                </div>
              );
            })}
          </div>
          <div className="border-t border-[#D3DFDA] pt-3 mt-4 space-y-2 text-sm">
            <div className="flex justify-between text-[#455250]">
              <span>Subtotal</span>
              <span className="font-bold text-[#202828]">₹{subtotal}</span>
            </div>
            {discountAmount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Premium Discount (30%)</span>
                <span className="font-bold">-₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-bold text-[#202828]">Total</span>
              <span className="font-black text-[#164A4A] text-lg">₹{finalTotal}</span>
            </div>
          </div>
          <button
            onClick={placeOrder}
            disabled={placing}
            className="mt-6 w-full py-3 bg-gradient-to-r from-[#164A4A] to-[#6fa3a0] text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {placing ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
            {placing ? 'Placing Order...' : `Pay ₹${finalTotal} & Place Order`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberCheckout;