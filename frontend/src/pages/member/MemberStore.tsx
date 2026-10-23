import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, ShoppingCart, Plus, X, Store, ImageIcon, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import MemberStoreTabs from '../../components/Member/MemberStoreTabs';
import DownSelect from '../../components/common/DownSelect';

const ALL_STORE_CATEGORIES = [
  'Supplements',
  'Nutrition & Healthy Snacks',
  'Fitness Drinks',
  'Gym Accessories',
  'Yoga & Recovery',
  'Gym Clothing',
  'Gym Merchandise',
  'Fitness Monitoring',
  'Personal Care',
  'Healthy Meals',
  'Other'
];

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
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

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
      showToast(`"${p.name}" added to your cart!`);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Could not add to cart', 'error');
    } finally {
      setAdding(null);
    }
  };

  if (enabled === null) {
    return <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#6366F1]" size={40} /></div>;
  }

  if (!enabled) {
    return (
      <div className="max-w-xl mx-auto mt-16 bg-white border border-[#292940] rounded-3xl p-8 shadow-sm text-center">
        <div className="w-20 h-20 bg-[#6366F1]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Store className="text-[#6366F1]" size={40} />
        </div>
        <h1 className="text-2xl font-bold text-[#11111F] mb-3">Food & Merch Store Coming Soon</h1>
        <p className="text-[#A1A1AA]">
          Your gym hasn't activated its online store yet. Check back soon!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MemberStoreTabs />

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-white font-semibold text-sm transition-all animate-in slide-in-from-bottom-4 ${toast.type === 'success' ? 'bg-[#6366F1]' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100"><X size={16} /></button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#11111F] tracking-tight">Gym Store</h1>
          <p className="text-[#A1A1AA] mt-1">Supplements, merch & more from your gym.</p>
        </div>
        <button
          onClick={() => navigate('/member/store/cart')}
          className="relative flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white font-bold rounded-xl shadow-lg shadow-teal-900/10 hover:opacity-90 transition-opacity"
        >
          <ShoppingCart size={18} /> Cart
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-[#6366F1] rounded-full text-xs font-black flex items-center justify-center shadow">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <div className="relative flex-1">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="w-full bg-[#0B0B12] border border-[#292940] rounded-xl pl-9 pr-4 py-2 text-sm text-[#11111F] focus:border-[#6366F1] outline-none" />
          <Search className="absolute left-3 top-2.5 text-[#A1A1AA]" size={16} />
        </div>
        <DownSelect
          value={category}
          onChange={(val) => setCategory(val)}
          options={[
            { label: 'All Categories', value: 'all' },
            ...Array.from(new Set([...ALL_STORE_CATEGORIES, ...categories])).map((c) => ({ label: c, value: c }))
          ]}
          className="lg:w-64"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#6366F1]" size={40} /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#292940] rounded-2xl">
          <Store className="mx-auto text-[#6366F1]/30 mb-4" size={56} />
          <p className="text-[#A1A1AA] font-medium">No products are available right now.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => {
            let totalStock = p.stock;
            let displayPrice = p.sellingPrice - (p.discountPrice || 0);
            let originalPrice = p.sellingPrice;
            let hasDiscount = p.discountPrice != null && p.discountPrice > 0;

            if (p.hasVariants && p.variants && p.variants.length > 0) {
               totalStock = p.variants.reduce((acc: number, v: any) => acc + v.stock, 0);
               const minVariant = p.variants.reduce((prev: any, curr: any) => {
                  const prevDisplay = prev.price - (prev.discountPrice || 0);
                  const currDisplay = curr.price - (curr.discountPrice || 0);
                  return currDisplay < prevDisplay ? curr : prev;
               }, p.variants[0]);
               
               displayPrice = minVariant.price - (minVariant.discountPrice || 0);
               originalPrice = minVariant.price;
               hasDiscount = minVariant.discountPrice != null && minVariant.discountPrice > 0;
            }

            const isLow = totalStock > 0 && totalStock <= (p.lowStockThreshold || 5);
            const out = totalStock <= 0;
            return (
              <div key={p._id} className="bg-white border border-[#292940] rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col h-full group">
                {/* Product Image Header with Consistent Aspect */}
                <button
                  type="button"
                  onClick={() => { setSelected(p); setSelectedVariant(p.hasVariants && p.variants.length > 0 ? p.variants[0] : null); }}
                  className="h-44 bg-[#0B0B12] relative block w-full text-left overflow-hidden border-b border-[#292940]/80 cursor-pointer"
                >
                  {p.image ? (
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-[#0B0B12] to-[#0B0B12] text-[#6366F1]/40">
                      <ImageIcon size={44} strokeWidth={1.5} />
                      <span className="text-[10px] font-bold text-[#A1A1AA] mt-1.5">No Image Available</span>
                    </div>
                  )}

                  <span className={`absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold shadow-xs ${
                    totalStock <= 0 ? 'bg-red-100 text-red-700 border border-red-200' : isLow ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {totalStock <= 0 ? 'Out of stock' : isLow ? `Low (${totalStock})` : `In stock (${totalStock})`}
                  </span>

                  {hasDiscount && (
                    <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#6366F1] text-white shadow-xs">
                      {Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}% off
                    </span>
                  )}
                </button>

                {/* Card Content - flex-1 flex flex-col justify-between */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  {/* Top Details with guaranteed heights */}
                  <div>
                    {/* Category & Brand line */}
                    <div className="flex items-center justify-between gap-2 mb-1 h-5">
                      <span className="text-[11px] font-extrabold text-[#6366F1] uppercase tracking-wider truncate">
                        {p.productType || p.categoryName || 'Product'}
                      </span>
                      {p.brand && (
                        <span className="text-[11px] font-bold text-[#A1A1AA] truncate max-w-[120px]">
                          {p.brand}
                        </span>
                      )}
                    </div>

                    {/* Product Name */}
                    <h3 className="font-extrabold text-[#11111F] text-base leading-snug truncate mb-1.5" title={p.name}>
                      {p.name}
                    </h3>

                    {/* Attribute tags with min-h to prevent layout shift */}
                    <div className="flex items-center gap-1.5 flex-wrap min-h-[22px] mb-2">
                      {p.attributes && Object.entries(p.attributes).slice(0, 2).map(([k, v]) => (
                        <span key={k} className="text-[10px] bg-[#0B0B12] text-gray-700 px-2 py-0.5 rounded-md font-semibold border border-gray-200">
                          {String(v)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Area - strictly anchored */}
                  <div className="mt-auto pt-3 border-t border-[#0B0B12]">
                    {/* Price Line */}
                    <div className="h-7 flex items-baseline gap-2 mb-3">
                      {p.hasVariants ? (
                        <>
                          <span className="text-lg font-black text-[#6366F1]">From ₹{displayPrice}</span>
                          {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through">₹{originalPrice}</span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="text-lg font-black text-[#6366F1]">₹{displayPrice}</span>
                          {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through">₹{originalPrice}</span>
                          )}
                        </>
                      )}
                    </div>

                    {/* 2-Button Grid Row - perfectly aligned across all cards */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => { setSelected(p); setSelectedVariant(p.hasVariants && p.variants.length > 0 ? p.variants[0] : null); }}
                        className="px-3 py-2 bg-[#0B0B12] hover:bg-[#0B0B12] text-[#11111F] hover:text-[#6366F1] border border-[#292940] rounded-xl text-xs font-bold transition-all flex items-center justify-center text-center cursor-pointer shadow-xs"
                      >
                        View
                      </button>
                      {p.hasVariants ? (
                        <button
                          type="button"
                          onClick={() => { setSelected(p); setSelectedVariant(p.hasVariants && p.variants.length > 0 ? p.variants[0] : null); }}
                          className="px-3 py-2 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:opacity-95 text-white rounded-xl text-xs font-bold transition-opacity flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                        >
                          <Sparkles size={13} />
                          <span>Options</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={out || adding === p._id}
                          onClick={() => addToCart(p, 1)}
                          className="px-3 py-2 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] hover:opacity-95 text-white rounded-xl text-xs font-bold transition-opacity disabled:opacity-40 flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                        >
                          {adding === p._id ? <Loader2 className="animate-spin" size={13} /> : <Plus size={13} />}
                          <span>Add</span>
                        </button>
                      )}
                    </div>
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
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-[#0B0B12] shrink-0 flex items-center justify-center border border-[#292940]">
                {selected.image ? <img src={selected.image} alt={selected.name} className="w-full h-full object-cover" /> : <ImageIcon className="text-[#6366F1]/30" size={36} />}
              </div>
              <div>
                <span className="text-xs font-bold text-[#4F46E5] uppercase tracking-wide">{selected.productType || selected.categoryName}</span>
                <h2 className="text-xl font-bold text-[#11111F]">{selected.name}</h2>
                <div className="flex items-center gap-1.5 flex-wrap mt-1">
                  {selected.attributes && Object.entries(selected.attributes).map(([k, v]) => (
                    <span key={k} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-medium">{String(v)}</span>
                  ))}
                </div>
                {selected.brand && <p className="text-sm text-[#A1A1AA] mt-1">{selected.brand}</p>}
                
                {selected.hasVariants ? (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-2xl font-black text-[#6366F1]">
                      ₹{selectedVariant ? selectedVariant.price - (selectedVariant.discountPrice || 0) : 0}
                    </span>
                    {selectedVariant?.discountPrice != null && selectedVariant.discountPrice > 0 && (
                      <span className="text-gray-400 line-through">₹{selectedVariant.price}</span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-2xl font-black text-[#6366F1]">
                      ₹{selected.sellingPrice - (selected.discountPrice || 0)}
                    </span>
                    {selected.discountPrice != null && selected.discountPrice > 0 && (
                      <span className="text-gray-400 line-through">₹{selected.sellingPrice}</span>
                    )}
                  </div>
                )}
                <p className="text-xs text-[#A1A1AA] mt-1">{selected.fulfilmentType || 'Gym Pickup'}</p>
              </div>
            </div>
            {selected.description && <p className="text-sm text-[#A1A1AA] mb-4 bg-[#0B0B12] p-3 rounded-xl border border-gray-100">{selected.description}</p>}
            
            {selected.hasVariants && (
              <div className="mb-4">
                <label className="text-xs font-bold text-[#11111F] mb-2 block">Select Option:</label>
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
                           ${isSelected ? 'border-[#6366F1] bg-[#0B0B12] text-[#4F46E5] ring-2 ring-[#6366F1]/20' : isOut ? 'border-gray-200 bg-gray-50 text-gray-400 opacity-50 cursor-not-allowed' : 'border-gray-200 hover:border-[#17172A] hover:bg-gray-50 text-[#11111F]'}
                         `}
                       >
                         <span>{label}</span>
                         <span className={isSelected ? 'text-[#6366F1] font-bold' : 'text-gray-500'}>₹{v.price - (v.discountPrice || 0)}</span>
                       </button>
                     )
                  })}
                </div>
              </div>
            )}

            {selected.hasVariants ? (
              <p className={`text-sm font-bold mb-5 ${!selectedVariant ? 'text-gray-400' : selectedVariant.stock <= 5 ? 'text-amber-600' : 'text-[#6366F1]'}`}>
                {!selectedVariant ? 'Please select an option' : selectedVariant.stock <= 5 ? `Hurry! Only ${selectedVariant.stock} left` : `${selectedVariant.stock} in stock`}
              </p>
            ) : (
              <p className={`text-sm font-bold mb-5 ${selected.stock <= 0 ? 'text-[#6366F1]' : selected.stock <= 5 ? 'text-amber-600' : 'text-[#6366F1]'}`}>
                {selected.stock <= 0 ? 'Out of stock' : selected.stock <= 5 ? `Hurry! Only ${selected.stock} left` : `${selected.stock} in stock`}
              </p>
            )}

            <div className="flex gap-3">
              <button onClick={() => setSelected(null)} className="flex-1 py-3 bg-gray-100 text-[#A1A1AA] font-bold rounded-xl hover:bg-gray-200 transition-colors">Close</button>
              <button
                disabled={selected.hasVariants ? (!selectedVariant || selectedVariant.stock <= 0) : (selected.stock <= 0)}
                onClick={() => { addToCart(selected, 1, selectedVariant?._id); setSelected(null); }}
                className="flex-1 py-3 bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white font-bold rounded-xl shadow-lg shadow-teal-900/10 hover:opacity-90 transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
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