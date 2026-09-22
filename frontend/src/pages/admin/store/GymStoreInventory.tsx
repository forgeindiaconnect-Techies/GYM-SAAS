import { useState, useEffect } from 'react';
import {
  Search, Loader2, Package, AlertTriangle, CheckCircle2,
  TrendingUp, TrendingDown, Plus, Minus, X, ArrowDownUp
} from 'lucide-react';
import api from '../../../utils/api';

const GymStoreInventory = () => {
  const [tab, setTab] = useState<'products' | 'transactions'>('products');
  const [products, setProducts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [adjusting, setAdjusting] = useState<any>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [saving, setSaving] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (status !== 'all') params.set('status', status);
      params.set('limit', '200');
      const res = await api.get(`/store/admin/inventory?${params.toString()}`);
      setProducts(res.data.products || []);
      setSummary(res.data.summary || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/store/admin/inventory/transactions?limit=150');
      setTransactions(res.data.transactions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'products') { loadProducts(); } else { loadTransactions(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, search, status]);

  const saveAdjustment = async () => {
    const qty = Number(adjustQty);
    if (!qty || qty === 0) { alert('Enter a non-zero quantity change.'); return; }
    try {
      setSaving(true);
      await api.patch(`/store/admin/products/${adjusting._id}/stock`, { quantityChange: qty, note: adjustNote });
      setAdjusting(null);
      setAdjustQty('');
      setAdjustNote('');
      loadProducts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Adjustment failed');
    } finally {
      setSaving(false);
    }
  };

  const statCards = [
    { label: 'Total Products', value: summary.totalProducts || 0, tint: 'bg-blue-100 text-blue-700' },
    { label: 'In Stock', value: summary.inStock || 0, tint: 'bg-green-100 text-green-700' },
    { label: 'Low Stock', value: summary.lowStockCount || 0, tint: 'bg-amber-100 text-amber-700' },
    { label: 'Out of Stock', value: summary.outOfStock || 0, tint: 'bg-red-100 text-red-700' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Inventory</h1>
        <p className="text-[#475569] mt-1">Track stock levels and adjustments across your store.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white border border-[#CCFBF1] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">{s.label}</p>
              <h3 className="text-2xl font-black text-[#1E293B]">{s.value}</h3>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.tint}`}>
              {s.label === 'Out of Stock' ? <AlertTriangle size={20} /> : <Package size={20} />}
            </div>
          </div>
        ))}
      </div>

      <div className="flex border-b border-[#CCFBF1] space-x-8">
        <button onClick={() => setTab('products')} className={`py-3 font-semibold text-sm transition-colors border-b-2 ${tab === 'products' ? 'border-[#16A34A] text-[#16A34A]' : 'border-transparent text-[#475569] hover:text-[#1E293B]'}`}>
          Products
        </button>
        <button onClick={() => setTab('transactions')} className={`py-3 font-semibold text-sm transition-colors border-b-2 ${tab === 'transactions' ? 'border-[#16A34A] text-[#16A34A]' : 'border-transparent text-[#475569] hover:text-[#1E293B]'}`}>
          Stock Transactions
        </button>
      </div>

      {tab === 'products' && (
        <>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, brand, SKU..." className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl pl-9 pr-4 py-2 text-sm text-[#1E293B] focus:border-[#16A34A] outline-none" />
              <Search className="absolute left-3 top-2.5 text-[#475569]" size={16} />
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-3 py-2 text-sm text-[#1E293B] focus:border-[#16A34A] outline-none md:w-48">
              <option value="all">All Stock</option>
              <option value="outOfStock">Out of Stock</option>
              <option value="lowStock">Low Stock</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#16A34A]" size={40} /></div>
          ) : (
            <div className="bg-white border border-[#CCFBF1] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm text-[#475569] whitespace-nowrap">
                  <thead className="bg-[#FFFFFF] border-b border-[#CCFBF1] text-[#1E293B]">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Product</th>
                      <th className="px-6 py-4 font-semibold">SKU</th>
                      <th className="px-6 py-4 font-semibold">Category</th>
                      <th className="px-6 py-4 font-semibold text-center">Current Stock</th>
                      <th className="px-6 py-4 font-semibold text-center">Alert At</th>
                      <th className="px-6 py-4 font-semibold">Level</th>
                      <th className="px-6 py-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CCFBF1]">
                    {products.length === 0 ? (
                      <tr><td colSpan={7} className="px-6 py-10 text-center">No products found.</td></tr>
                    ) : products.map((p) => {
                      const level = p.stock <= 0 ? 'out' : p.stock <= p.lowStockThreshold ? 'low' : 'ok';
                      return (
                        <tr key={p._id} className="hover:bg-[#F0FDFA] transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-[#1E293B]">{p.name}</p>
                            {p.brand && <p className="text-xs text-[#475569]">{p.brand}</p>}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs">{p.sku || '—'}</td>
                          <td className="px-6 py-4">{p.categoryName}</td>
                          <td className="px-6 py-4 text-center font-black text-[#1E293B]">{p.stock}</td>
                          <td className="px-6 py-4 text-center">{p.lowStockThreshold}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                              level === 'out' ? 'bg-red-100 text-red-700' : level === 'low' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {level === 'out' ? <><AlertTriangle size={12} /> Out of Stock</> : level === 'low' ? <><AlertTriangle size={12} /> Low Stock</> : <><CheckCircle2 size={12} /> In Stock</>}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => { setAdjusting(p); setAdjustQty(''); setAdjustNote(''); }} className="px-3 py-1.5 bg-[#F0FDFA] text-[#16A34A] rounded-lg hover:bg-[#CCFBF1] transition-colors text-xs font-bold">
                              Adjust Stock
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'transactions' && (
        <div className="bg-white border border-[#CCFBF1] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm text-[#475569] whitespace-nowrap">
              <thead className="bg-[#FFFFFF] border-b border-[#CCFBF1] text-[#1E293B]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold text-center">Change</th>
                  <th className="px-6 py-4 font-semibold text-center">After</th>
                  <th className="px-6 py-4 font-semibold">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CCFBF1]">
                {transactions.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center">No stock transactions yet.</td></tr>
                ) : transactions.map((t: any) => (
                  <tr key={t._id} className="hover:bg-[#F0FDFA] transition-colors">
                    <td className="px-6 py-4">{new Date(t.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold text-[#1E293B]">{t.productId?.name || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        t.type === 'stock_in' ? 'bg-blue-100 text-blue-700' :
                        t.type === 'online_sale' ? 'bg-purple-100 text-purple-700' :
                        t.type === 'offline_sale' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {t.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-center font-black flex items-center justify-center gap-1 ${t.quantityChange > 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {t.quantityChange > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {t.quantityChange > 0 ? '+' : ''}{t.quantityChange}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-[#1E293B]">{t.stockAfter}</td>
                    <td className="px-6 py-4 text-xs">{t.note || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adjusting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setAdjusting(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={22} /></button>
            <h2 className="text-xl font-bold text-[#1E293B] mb-1">Adjust Stock</h2>
            <p className="text-sm text-[#475569] mb-4">{adjusting.name} · current stock: <span className="font-bold text-[#1E293B]">{adjusting.stock}</span></p>

            <div className="flex items-center gap-3 mb-4">
              <input
                type="number"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-3 py-3 text-lg font-bold text-center text-[#1E293B] focus:border-[#16A34A] outline-none"
                placeholder="0"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button onClick={() => setAdjustQty(String((Number(adjustQty) || 0) + 10))} className="flex items-center justify-center gap-1 py-2.5 bg-green-50 text-green-700 font-bold rounded-xl hover:bg-green-100 transition-colors">
                <Plus size={16} /> +10
              </button>
              <button onClick={() => setAdjustQty(String((Number(adjustQty) || 0) - 10))} className="flex items-center justify-center gap-1 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors">
                <Minus size={16} /> −10
              </button>
            </div>

            <label className="text-xs font-bold text-[#64748B] uppercase mb-1 block">Note (optional)</label>
            <textarea value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-3 py-2 text-sm text-[#1E293B] focus:border-[#16A34A] outline-none resize-none" rows={2} placeholder="e.g., Received new shipment" />

            <div className="mt-5 flex gap-3">
              <button onClick={() => setAdjusting(null)} className="flex-1 py-3 bg-gray-100 text-[#475569] font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={saveAdjustment} disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-[#16A34A] to-[#0D9488] text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <ArrowDownUp size={16} />} Apply Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymStoreInventory;