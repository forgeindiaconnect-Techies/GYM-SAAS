import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, ShoppingCart, Plus, X, Store, ImageIcon } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const MemberStore = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState<null | boolean>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [adding, setAdding] = useState<string | null>(null);

  const loadStatus = async () => {
    try {
      const res = await api.get('/store/customer/status');
      setEnabled(!!res.data?.enabled);
    } catch { setEnabled(false); }
  };

  const loadCartCount = async () => {
    try {
      const res = await api.get('/store/customer/cart');
      setCartCount((res.data.cart || []).reduce((s: number, i: any) => s + i.quantity, 0));
    } catch { /* ignore */ }
  };

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (category !== 'all') params.set('category', category);
      params.set('limit', '60');
      const res = await api.get(`/store/customer/products?${params.toString()}`);
      const prods = res.data.products || [];
      setProducts(prods);
      const cats = Array.from(new Set(prods.map((p: any) => p.categoryName))).filter(Boolean) as string[];
      setCategories((prev) => (prev.length ? prev : cats));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category]);

  useEffect(() => {
    loadStatus();
    loadCartCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const addToCart = async (p: any, qty: number) => {
    try {
      setAdding(p._id);
      await api.post('/store/customer/cart', { productId: p._id, quantity: qty });
      loadCartCount();
      alert(`Added "${p.name}" to your cart.`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not add to cart');
    } finally {
      setAdding(null);
    }
  };

  if (enabled === null) {
    return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#16A34A]" size={40} /></div>;
  }

  if (!enabled) {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-white border border-[#CCFBF1] rounded-3xl p-8 shadow-sm text-center">
        <div className="w-20 h-20 bg-[#16A34A]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Store className="text-[#16A34A]" size={40} />
        </div>
        <h1 className="text-2xl font-bold text-[#1E293B] mb-3">Food & Merch Store Coming Soon</h1>
        <p className="text-[#475569]">
          Your gym hasn't activated its online store yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Gym Store</h1>
          <p className="text-[#475569] mt-1">Supplements, merch & more from your gym.</p>
        </div>
        <button
          onClick={() => navigate('/member/cart')}
          className="relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#16A34A] to-[#0D9488] text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:opacity-90 transition-opacity"
        >
          <ShoppingCart size={18} /> Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-[#16A34A] rounded-full text-xs font-black flex items-center justify-center shadow">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl pl-9 pr-4 py-2 text-sm text-[#1E293B] focus:border-[#16A34A] outline-none" />
          <Search className="absolute left-3 top-2.5 text-[#475569]" size={16} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-3 py-2 text-sm text-[#1E293B] focus:border-[#16A34A] outline-none lg:w-52">
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#16A34A]" size={40} /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#CCFBF1] rounded-2xl">
          <Store className="mx-auto text-[#16A34A]/30 mb-4" size={56} />
          <p className="text-[#64748B] font-medium">No products are available right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => {
            const price = p.discountPrice ?? p.sellingPrice;
            const out = p.stock <= 0;
            return (
              <div key={p._id} className="bg-white border border-[#CCFBF1] rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <button onClick={() => setSelected(p)} className="h-40 bg-[#F0FDFA] relative block w-full">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#16A34A]/30"><ImageIcon size={48} /></div>
                  )}
                  {p.discountPrice != null && p.discountPrice < p.sellingPrice && (
                    <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-bold bg-[#16A34A] text-white">
                      {Math.round(((p.sellingPrice - p.discountPrice) / p.sellingPrice) * 100)}% off
                    </span>
                  )}
                  {out && (
                    <span className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                      Out of stock
                    </span>
                  )}
                </button>
                <div className="p-4 flex-1 flex flex-col">
                  <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wide">{p.categoryName}</span>
                  <h3 className="font-bold text-[#1E293B] mt-0.5">{p.name}</h3>
                  {p.brand && <p className="text-xs text-[#475569]">{p.brand}</p>}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-lg font-black text-[#16A34A]">₹{price}</span>
                    {p.discountPrice != null && p.discountPrice < p.sellingPrice && (
                      <span className="text-sm text-gray-400 line-through">₹{p.sellingPrice}</span>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex gap-2">
                    <button
                      onClick={() => setSelected(p)}
                      className="flex-1 px-3 py-2 bg-[#F0FDFA] text-[#0D9488] rounded-xl text-sm font-bold hover:bg-[#CCFBF1] transition-colors"
                    >
                      View
                    </button>
                    <button
                      disabled={out || adding === p._id}
                      onClick={() => addToCart(p, 1)}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-[#16A34A] to-[#0D9488] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-1"
                    >
                      {adding === p._id ? <Loader2 className="animate-spin" size={15} /> : <Plus size={15} />} Add
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={22} /></button>
            <div className="flex gap-4 mb-4">
              <div className="w-28 h-28 rounded-xl overflow-hidden bg-[#F0FDFA] shrink-0 flex items-center justify-center">
                {selected.image ? <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" /> : <ImageIcon className="text-[#16A34A]/30" size={36} />}
              </div>
              <div>
                <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wide">{selected.categoryName}</span>
                <h2 className="text-xl font-bold text-[#1E293B]">{selected.name}</h2>
                {selected.brand && <p className="text-sm text-[#475569]">{selected.brand}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl font-black text-[#16A34A]">₹{selected.discountPrice ?? selected.sellingPrice}</span>
                  {selected.discountPrice != null && selected.discountPrice < selected.sellingPrice && (
                    <span className="text-gray-400 line-through">₹{selected.sellingPrice}</span>
                  )}
                </div>
                <p className="text-sm text-[#475569] mt-1">{selected.fulfilmentType || 'Gym Pickup'}</p>
              </div>
            </div>
            {selected.description && <p className="text-sm text-[#475569] mb-4">{selected.description}</p>}
            {selected.stock > 0 ? (
              <p className={`text-sm font-bold mb-4 ${selected.stock <= 5 ? 'text-amber-600' : 'text-green-600'}`}>
                {selected.stock <= 5 ? `Hurry! Only ${selected.stock} left` : `${selected.stock} in stock`}
              </p>
            ) : (
              <p className="text-sm font-bold text-red-500 mb-4">Out of stock</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 py-3 bg-gray-100 text-[#475569] font-bold rounded-xl hover:bg-gray-200 transition-colors">Close</button>
              <button
                disabled={selected.stock <= 0}
                onClick={() => { addToCart(selected, 1); setSelected(null); }}
                className="flex-1 py-3 bg-gradient-to-r from-[#16A34A] to-[#0D9488] text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <ShoppingCart size={17} /> Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberStore;