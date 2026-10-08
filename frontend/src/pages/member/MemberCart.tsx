import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, Minus, Trash2, ShoppingCart, ShoppingBag, ArrowRight, ImageIcon, PackageCheck } from 'lucide-react';
import api from '../../utils/api';
import MemberStoreTabs from '../../components/Member/MemberStoreTabs';

const MemberCart = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/store/customer/cart');
      setItems(res.data.cart || []);
      setSubtotal(res.data.subtotal || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const changeQty = async (productId: string, quantity: number, variantId?: string) => {
    try {
      setUpdating(productId + (variantId || ''));
      await api.put('/store/customer/cart/items', { productId, variantId, quantity });
      load();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Update failed');
    } finally {
      setUpdating(null);
    }
  };

  const remove = async (productId: string, variantId?: string) => {
    const qs = variantId ? `?variantId=${variantId}` : '';
    await api.delete(`/store/customer/cart/items/${productId}${qs}`);
    load();
  };

  const clear = async () => {
    if (!window.confirm('Clear your entire cart?')) return;
    await api.delete('/store/customer/cart');
    load();
  };

  if (loading) {
    return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#F97316]" size={40} /></div>;
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <MemberStoreTabs />
        <div className="max-w-lg mx-auto mt-12 text-center bg-white border border-[#E7E5E4] rounded-3xl p-10">
          <ShoppingCart className="mx-auto text-[#F97316]/30 mb-4" size={56} />
          <h1 className="text-2xl font-bold text-[#292524] mb-2">Your cart is empty</h1>
          <p className="text-[#78716C] mb-6">Browse the gym store and add some products, or check your placed orders below.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate('/member/store')} className="px-6 py-3 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:opacity-90 transition-opacity inline-flex items-center justify-center gap-2">
              <ShoppingBag size={18} /> Visit Store
            </button>
            <button onClick={() => navigate('/member/store/orders')} className="px-6 py-3 bg-[#FFFDF8] text-[#F97316] font-bold rounded-xl border border-[#E7E5E4] hover:bg-[#E7E5E4] transition-colors inline-flex items-center justify-center gap-2">
              <PackageCheck size={18} /> My Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const hasWarning = items.some((i) => !i.match);

  return (
    <div className="space-y-6">
      <MemberStoreTabs />
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Your Cart</h1>
          <p className="text-[#78716C] mt-1">{items.length} item type(s) in your cart.</p>
        </div>
        <button onClick={clear} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors text-sm">
          <Trash2 size={16} /> Clear Cart
        </button>
      </div>

      {hasWarning && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl px-5 py-4 text-sm">
          Some quantities were adjusted to match available stock. Please review before checkout.
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {items.map((row, idx) => {
            const p = row.product;
            const v = row.variant;
            const price = v ? (v.price - (v.discountPrice || 0)) : (p.sellingPrice - (p.discountPrice || 0));
            const uid = p._id + (row.variantId || '');
            return (
              <div key={`${p._id}-${idx}`} className="bg-white border border-[#E7E5E4] rounded-2xl p-4 flex gap-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#FFFDF8] shrink-0 flex items-center justify-center">
                  {p.image ? <img src={p.image} alt={p.name} className="w-full h-full object-cover" /> : <ImageIcon className="text-[#F97316]/30" size={28} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-[#292524]">{p.name}</h3>
                      <div className="flex items-center gap-1.5 flex-wrap my-0.5">
                        {v && v.attributes && Object.entries(v.attributes).map(([k, attr]) => (
                           <span key={k} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">{String(attr)}</span>
                        ))}
                        {!v && p.attributes && Object.entries(p.attributes).slice(0,2).map(([k, attr]) => (
                           <span key={k} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">{String(attr)}</span>
                        ))}
                      </div>
                      <p className="text-xs text-[#78716C]">{p.categoryName}{p.brand ? ` · ${p.brand}` : ''}</p>
                    </div>
                    <button onClick={() => remove(p._id, row.variantId)} className="p-1.5 bg-red-50 text-[#FED7AA] rounded-lg hover:bg-red-100"><Trash2 size={15} /></button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button disabled={updating === uid} onClick={() => changeQty(p._id, row.quantity - 1, row.variantId)} className="w-8 h-8 bg-[#FFFDF8] rounded-lg flex items-center justify-center text-[#F97316] hover:bg-[#E7E5E4] transition-colors"><Minus size={15} /></button>
                      <span className="w-8 text-center font-bold text-[#292524]">{row.quantity}</span>
                      <button disabled={updating === uid} onClick={() => changeQty(p._id, row.quantity + 1, row.variantId)} className="w-8 h-8 bg-[#FFFDF8] rounded-lg flex items-center justify-center text-[#F97316] hover:bg-[#E7E5E4] transition-colors"><Plus size={15} /></button>
                      {row.requestedQuantity > 1 && row.quantity < row.requestedQuantity && (
                        <span className="text-xs text-amber-600 font-semibold">Only {row.quantity} available</span>
                      )}
                    </div>
                    <p className="font-black text-[#292524]">₹{price * row.quantity}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:sticky lg:top-24 self-start bg-white border border-[#E7E5E4] rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[#292524] mb-4">Order Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-[#78716C]">
              <span>Subtotal</span>
              <span className="font-bold text-[#292524]">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-[#78716C]">
              <span>Delivery</span>
              <span className="font-semibold text-[#F97316]">At next step</span>
            </div>
            <div className="border-t border-[#E7E5E4] pt-3 mt-3 flex justify-between">
              <span className="font-bold text-[#292524]">Total</span>
              <span className="font-black text-[#F97316] text-lg">₹{subtotal}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/member/store/checkout')}
            className="mt-6 w-full py-3 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Proceed to Checkout <ArrowRight size={17} />
          </button>
          <button onClick={() => navigate('/member/store')} className="mt-3 w-full py-2.5 text-[#FED7AA] font-bold rounded-xl hover:bg-[#FFFDF8] transition-colors text-sm">
            Continue shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberCart;