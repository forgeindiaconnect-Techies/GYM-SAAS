import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, ShoppingCart, Plus, X, Store, ImageIcon, Info } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const MemberStore = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [enabled, setEnabled] = useState<null | boolean>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
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

  const addToCart = async (p: any, qty: number, vId?: string) => {
    try {
      setAdding(p._id);
      await api.post('/store/customer/cart', { productId: p._id, variantId: vId, quantity: qty });
      loadCartCount();
      alert(`Added "${p.name}" to your cart.`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Could not add to cart');
    } finally {
      setAdding(null);
    }
  };

  if (enabled === null) {
    return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#34483F]" size={40} /></div>;
  }

  if (!enabled) {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-white border border-[#DCD9CD] rounded-3xl p-8 shadow-sm text-center">
        <div className="w-20 h-20 bg-[#34483F]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Store className="text-[#34483F]" size={40} />
        </div>
        <h1 className="text-2xl font-bold text-[#202522] mb-3">Food & Merch Store Coming Soon</h1>
        <p className="text-[#4A514D]">
          Your gym hasn't activated its online store yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202522] tracking-tight">Gym Store</h1>
          <p className="text-[#4A514D] mt-1">Supplements, merch & more from your gym.</p>
        </div>
        <button
          onClick={() => navigate('/member/cart')}
          className="relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#34483F] to-[#8FA89B] text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:opacity-90 transition-opacity"
        >
          <ShoppingCart size={18} /> Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-[#34483F] rounded-full text-xs font-black flex items-center justify-center shadow">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl pl-9 pr-4 py-2 text-sm text-[#202522] focus:border-[#34483F] outline-none" />
          <Search className="absolute left-3 top-2.5 text-[#4A514D]" size={16} />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="bg-[#F2EFE8] border border-[#DCD9CD] rounded-xl px-3 py-2 text-sm text-[#202522] focus:border-[#34483F] outline-none lg:w-52">
          <option value="all">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#34483F]" size={40} /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#DCD9CD] rounded-2xl">
          <Store className="mx-auto text-[#34483F]/30 mb-4" size={56} />
          <p className="text-[#727975] font-medium">No products are available right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => {
            let totalStock = p.stock;
            let displayPrice = p.discountPrice ?? p.sellingPrice;
            if (p.hasVariants && p.variants && p.variants.length > 0) {
               totalStock = p.variants.reduce((acc: number, v: any) => acc + v.stock, 0);
               const prices = p.variants.map((v: any) => v.discountPrice ?? v.price);
               displayPrice = Math.min(...prices);
            }

            const out = totalStock <= 0;
            return (
              <div key={p._id} className="bg-white border border-[#DCD9CD] rounded-2xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                <button onClick={() => { setSelected(p); setSelectedVariant(p.hasVariants && p.variants.length > 0 ? p.variants[0] : null); }} className="h-40 bg-[#F5F3EE] relative block w-full">
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#34483F]/30"><ImageIcon size={48} /></div>
                  )}
                  {!p.hasVariants && p.discountPrice != null && p.discountPrice < p.sellingPrice && (
                    <span className="absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-bold bg-[#34483F] text-white">
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
                  <span className="text-xs font-bold text-[#8FA89B] uppercase tracking-wide">{p.categoryName}</span>
                  <h3 className="font-bold text-[#202522] mt-0.5 truncate">{p.name}</h3>
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    {p.attributes && Object.entries(p.attributes).slice(0, 2).map(([k, v]) => (
                      <span key={k} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">{String(v)}</span>
                    ))}
                  </div>
                  {p.brand && <p className="text-xs text-[#4A514D] mt-1">{p.brand}</p>}
                  <div className="mt-2 flex items-center gap-2">
                    {p.hasVariants ? (
                       <span className="text-lg font-black text-[#34483F]">From ₹{displayPrice}</span>
                    ) : (
                       <>
                         <span className="text-lg font-black text-[#34483F]">₹{displayPrice}</span>
                         {p.discountPrice != null && p.discountPrice < p.sellingPrice && (
                           <span className="text-sm text-gray-400 line-through">₹{p.sellingPrice}</span>
                         )}
                       </>
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#F1F5F9] flex gap-2">
                    <button
                      onClick={() => { setSelected(p); setSelectedVariant(p.hasVariants && p.variants.length > 0 ? p.variants[0] : null); }}
                      className="flex-1 px-3 py-2 bg-[#F5F3EE] text-[#8FA89B] rounded-xl text-sm font-bold hover:bg-[#DCD9CD] transition-colors"
                    >
                      View
                    </button>
                    {!p.hasVariants && (
                      <button
                        disabled={out || adding === p._id}
                        onClick={() => addToCart(p, 1)}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-[#34483F] to-[#8FA89B] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-1"
                      >
                        {adding === p._id ? <Loader2 className="animate-spin" size={15} /> : <Plus size={15} />} Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative">
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={22} /></button>
            <div className="flex gap-4 mb-4">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-[#F5F3EE] shrink-0 flex items-center justify-center border border-[#DCD9CD]">
                {selected.image ? <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" /> : <ImageIcon className="text-[#34483F]/30" size={36} />}
              </div>
              <div>
                <span className="text-xs font-bold text-[#8FA89B] uppercase tracking-wide">{selected.categoryName}</span>
                <h2 className="text-xl font-bold text-[#202522]">{selected.name}</h2>
                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                  {selected.attributes && Object.entries(selected.attributes).map(([k, v]) => (
                    <span key={k} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">{String(v)}</span>
                  ))}
                </div>
                {selected.brand && <p className="text-sm text-[#4A514D] mt-1">{selected.brand}</p>}
                
                {selected.hasVariants ? (
                  <div className="mt-2">
                    <span className="text-2xl font-black text-[#34483F]">₹{selectedVariant?.discountPrice ?? selectedVariant?.price ?? 0}</span>
                    {selectedVariant?.discountPrice != null && selectedVariant.discountPrice < selectedVariant.price && (
                      <span className="text-gray-400 line-through ml-2">₹{selectedVariant.price}</span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-2xl font-black text-[#34483F]">₹{selected.discountPrice ?? selected.sellingPrice}</span>
                    {selected.discountPrice != null && selected.discountPrice < selected.sellingPrice && (
                      <span className="text-gray-400 line-through">₹{selected.sellingPrice}</span>
                    )}
                  </div>
                )}
                <p className="text-xs text-[#4A514D] mt-1">{selected.fulfilmentType || 'Gym Pickup'}</p>
              </div>
            </div>
            {selected.description && <p className="text-sm text-[#4A514D] mb-4 bg-[#F2EFE8] p-3 rounded-xl border border-gray-100">{selected.description}</p>}
            
            {selected.hasVariants && (
              <div className="mb-4">
                <label className="text-xs font-bold text-[#202522] mb-2 block">Select Option:</label>
                <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto">
                  {selected.variants.map((v: any) => {
                     const isOut = v.stock <= 0;
                     const isSelected = selectedVariant?._id === v._id;
                     const label = Object.values(v.attributes).join(' / ') || 'Default';
                     return (
                       <button
                         key={v._id}
                         disabled={isOut}
                         onClick={() => setSelectedVariant(v)}
                         className={`px-3 py-2 rounded-xl text-sm font-medium border text-left flex flex-col min-w-[120px] transition-all
                           ${isSelected ? 'border-[#34483F] bg-[#F5F3EE] text-[#8FA89B] ring-2 ring-[#34483F]/20' : isOut ? 'border-gray-200 bg-gray-50 text-gray-400 opacity-50 cursor-not-allowed' : 'border-gray-200 hover:border-[#8FA89B] hover:bg-gray-50 text-[#202522]'}
                         `}
                       >
                         <span>{label}</span>
                         <span className={isSelected ? 'text-[#34483F] font-bold' : 'text-gray-500'}>₹{v.discountPrice ?? v.price}</span>
                       </button>
                     )
                  })}
                </div>
              </div>
            )}

            {selected.hasVariants ? (
              <p className={`text-sm font-bold mb-5 ${!selectedVariant ? 'text-gray-400' : selectedVariant.stock <= 5 ? 'text-amber-600' : 'text-green-600'}`}>
                {!selectedVariant ? 'Please select an option' : selectedVariant.stock <= 5 ? `Hurry! Only ${selectedVariant.stock} left` : `${selectedVariant.stock} in stock`}
              </p>
            ) : (
              <p className={`text-sm font-bold mb-5 ${selected.stock <= 0 ? 'text-red-500' : selected.stock <= 5 ? 'text-amber-600' : 'text-green-600'}`}>
                {selected.stock <= 0 ? 'Out of stock' : selected.stock <= 5 ? `Hurry! Only ${selected.stock} left` : `${selected.stock} in stock`}
              </p>
            )}

            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 py-3 bg-gray-100 text-[#4A514D] font-bold rounded-xl hover:bg-gray-200 transition-colors">Close</button>
              <button
                disabled={selected.hasVariants ? (!selectedVariant || selectedVariant.stock <= 0) : (selected.stock <= 0)}
                onClick={() => { addToCart(selected, 1, selectedVariant?._id); setSelected(null); }}
                className="flex-1 py-3 bg-gradient-to-r from-[#34483F] to-[#8FA89B] text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
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