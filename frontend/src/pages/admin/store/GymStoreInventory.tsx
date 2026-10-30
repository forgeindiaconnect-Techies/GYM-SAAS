import { useState, useEffect } from 'react';
import {
  Search, Loader2, Package, AlertTriangle, CheckCircle2,
  TrendingUp, TrendingDown, Plus, Minus, X, ArrowDownUp, Eye
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
  const [viewingTx, setViewingTx] = useState<any>(null);
  const [lowStockAlertItems, setLowStockAlertItems] = useState<any[]>([]);
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [hasAutoOpenedAlert, setHasAutoOpenedAlert] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (status !== 'all') params.set('status', status);
      params.set('limit', '200');
      const res = await api.get(`/store/admin/inventory?${params.toString()}`);
      const prods = res.data.products || [];
      setProducts(prods);
      setSummary(res.data.summary || {});

      // Check if any product is below 5 (or <= lowStockThreshold)
      const lowItems = prods.filter((p: any) => p.stock <= (p.lowStockThreshold ?? 5));
      if (lowItems.length > 0) {
        setLowStockAlertItems(lowItems);
        if (!hasAutoOpenedAlert) {
          setShowLowStockModal(true);
          setHasAutoOpenedAlert(true);
        }
      }
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
      const res = await api.patch(`/store/admin/products/${adjusting._id}/stock`, { quantityChange: qty, note: adjustNote });
      const updatedProduct = res.data.product;
      setAdjusting(null);
      setAdjustQty('');
      setAdjustNote('');
      await loadProducts();

      // Trigger instant low stock alert popup if coming below 5 (or <= threshold)
      if (updatedProduct && updatedProduct.stock <= (updatedProduct.lowStockThreshold ?? 5)) {
        setLowStockAlertItems([updatedProduct]);
        setShowLowStockModal(true);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Adjustment failed');
    } finally {
      setSaving(false);
    }
  };

  const statCards = [
    { label: 'Total Products', value: summary.totalProducts || 0, tint: 'bg-[#F8FAFC] text-[#EA580C]' },
    { label: 'In Stock', value: summary.inStock || 0, tint: 'bg-[#FFF7ED] text-[#EA580C]' },
    { label: 'Low Stock', value: summary.lowStockCount || 0, tint: 'bg-amber-100 text-amber-700' },
    { label: 'Out of Stock', value: summary.outOfStock || 0, tint: 'bg-red-100 text-red-700' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#111827] tracking-tight">Inventory</h1>
        <p className="text-[#64748B] mt-1">Track stock levels and adjustments across your store.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const isAlertCard = s.label === 'Low Stock' || s.label === 'Out of Stock';
          return (
            <div
              key={s.label}
              onClick={() => {
                if (isAlertCard) {
                  const matching = products.filter((p: any) =>
                    s.label === 'Out of Stock' ? p.stock <= 0 : p.stock <= (p.lowStockThreshold ?? 5)
                  );
                  if (matching.length > 0) {
                    setLowStockAlertItems(matching);
                    setShowLowStockModal(true);
                  } else {
                    setStatus(s.label === 'Low Stock' ? 'lowStock' : 'outOfStock');
                  }
                }
              }}
              className={`bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl p-4 flex items-center justify-between transition-all ${
                isAlertCard ? 'cursor-pointer hover:shadow-md hover:border-amber-400' : ''
              }`}
            >
              <div>
                <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider">{s.label}</p>
                <h3 className="text-2xl font-black text-[#111827]">{s.value}</h3>
                {isAlertCard && Number(s.value) > 0 && (
                  <span className="text-[11px] font-bold text-amber-600 hover:underline inline-flex items-center gap-1 mt-0.5">
                    View Alert <AlertTriangle size={10} />
                  </span>
                )}
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.tint}`}>
                {s.label === 'Out of Stock' ? <AlertTriangle size={20} /> : <Package size={20} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Low Stock Alert Message Banner (when coming below 5) */}
      {(Number(summary.lowStockCount || 0) + Number(summary.outOfStock || 0) > 0) && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="font-black text-[#111827] text-sm flex items-center gap-2">
                Low Stock Alert Triggered!
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-200 text-amber-900 uppercase">
                  {(summary.lowStockCount || 0) + (summary.outOfStock || 0)} Items below 5
                </span>
              </h4>
              <p className="text-xs text-[#64748B] mt-0.5">
                Items have reached or fallen below 5 in stock. Restock soon to prevent running out of stock.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const low = products.filter((p: any) => p.stock <= (p.lowStockThreshold ?? 5));
              setLowStockAlertItems(low.length > 0 ? low : products.filter(p => p.stock <= 5));
              setShowLowStockModal(true);
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all shrink-0 shadow-sm flex items-center justify-center gap-1.5"
          >
            <Eye size={14} /> View Low Stock Alert
          </button>
        </div>
      )}

      <div className="flex border-b border-[#E2E8F0] space-x-8">
        <button onClick={() => setTab('products')} className={`py-3 font-semibold text-sm transition-colors border-b-2 ${tab === 'products' ? 'border-[#FDBA74] text-[#EA580C]' : 'border-transparent text-[#64748B] hover:text-[#C2410C]'}`}>
          Products
        </button>
        <button onClick={() => setTab('transactions')} className={`py-3 font-semibold text-sm transition-colors border-b-2 ${tab === 'transactions' ? 'border-[#FDBA74] text-[#EA580C]' : 'border-transparent text-[#64748B] hover:text-[#C2410C]'}`}>
          Stock Transactions
        </button>
      </div>

      {tab === 'products' && (
        <>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, brand, SKU..." className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl pl-9 pr-4 py-2 text-sm text-[#111827] focus:border-[#FDBA74] outline-none" />
              <Search className="absolute left-3 top-2.5 text-[#64748B]" size={16} />
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#111827] focus:border-[#FDBA74] outline-none md:w-48">
              <option value="all">All Stock</option>
              <option value="inStock">In Stock</option>
              <option value="outOfStock">Out of Stock</option>
              <option value="lowStock">Low Stock</option>
            </select>
          </div>

          {loading ? (
            <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#EA580C]" size={40} /></div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm text-[#64748B] whitespace-nowrap">
                  <thead className="bg-[#FFFFFF] border-b border-[#E2E8F0] text-[#111827]">
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
                  <tbody className="divide-y divide-[#E2E8F0]">
                    {products.length === 0 ? (
                      <tr><td colSpan={7} className="px-6 py-10 text-center">No products found.</td></tr>
                    ) : products.map((p) => {
                      const stockVal = Number(p?.stock) || 0;
                      const thresholdVal = Number(p?.lowStockThreshold) || 5;
                      const level = stockVal <= 0 ? 'out' : stockVal <= thresholdVal ? 'low' : 'ok';
                      return (
                        <tr key={p._id} className="hover:bg-[#FFF7ED] transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-[#111827]">{p.name}</p>
                            {p.brand && <p className="text-xs text-[#64748B]">{p.brand}</p>}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs">{p.sku || '—'}</td>
                          <td className="px-6 py-4">{p.categoryName || 'General'}</td>
                          <td className="px-6 py-4 text-center font-black text-[#111827]">{stockVal}</td>
                          <td className="px-6 py-4 text-center">{thresholdVal}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${
                              level === 'out' ? 'bg-red-100 text-red-700' : level === 'low' ? 'bg-amber-100 text-amber-700' : 'bg-[#FFF7ED] text-[#9A3412]'
                            }`}>
                              {level === 'out' ? <><AlertTriangle size={12} /> Out of Stock</> : level === 'low' ? <><AlertTriangle size={12} /> Low Stock</> : <><CheckCircle2 size={12} /> In Stock</>}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button onClick={() => { setAdjusting(p); setAdjustQty(''); setAdjustNote(''); }} className="px-3 py-1.5 bg-[#F8FAFC] text-[#EA580C] rounded-lg hover:bg-[#E2E8F0] transition-colors text-xs font-bold">
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
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm text-[#64748B] whitespace-nowrap">
              <thead className="bg-[#FFFFFF] border-b border-[#E2E8F0] text-[#111827]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Product</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold text-center">Change</th>
                  <th className="px-6 py-4 font-semibold text-center">After</th>
                  <th className="px-6 py-4 font-semibold">Note</th>
                  <th className="px-6 py-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {transactions.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-10 text-center">No stock transactions yet.</td></tr>
                ) : transactions.map((t: any) => (
                  <tr key={t._id} className="hover:bg-[#FFF7ED] transition-colors">
                    <td className="px-6 py-4">{new Date(t.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 font-bold text-[#111827]">{t.productId?.name || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        t.type === 'stock_in' ? 'bg-[#F8FAFC] text-[#EA580C]' :
                        t.type === 'online_sale' ? 'bg-[#F8FAFC] text-[#EA580C]' :
                        t.type === 'offline_sale' ? 'bg-[#F8FAFC] text-[#EA580C]' : 'bg-[#F8FAFC] text-[#111827]'
                      }`}>
                        {t.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-center font-black flex items-center justify-center gap-1 ${t.quantityChange > 0 ? 'text-[#EA580C]' : 'text-[#EA580C]'}`}>
                      {t.quantityChange > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {t.quantityChange > 0 ? '+' : ''}{t.quantityChange}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-[#111827]">{t.stockAfter}</td>
                    <td className="px-6 py-4 text-xs">{t.note || '—'}</td>
                    <td className="px-6 py-4 text-center">
                      <button onClick={() => setViewingTx(t)} className="p-1.5 bg-[#F8FAFC] text-[#EA580C] rounded-lg hover:bg-[#FFF7ED] transition-colors inline-flex items-center justify-center">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {adjusting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button onClick={() => setAdjusting(null)} className="absolute top-4 right-4 text-[#64748B] hover:text-[#111827]"><X size={22} /></button>
            <h2 className="text-xl font-bold text-[#111827] mb-1">Adjust Stock</h2>
            <p className="text-sm text-[#64748B] mb-4">{adjusting.name} · current stock: <span className="font-bold text-[#111827]">{adjusting.stock}</span></p>

            <div className="flex items-center gap-3 mb-4">
              <input
                type="number"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-3 text-lg font-bold text-center text-[#111827] focus:border-[#FDBA74] outline-none"
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
            <textarea value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)} className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2 text-sm text-[#111827] focus:border-[#FDBA74] outline-none resize-none" rows={2} placeholder="e.g., Received new shipment" />

            <div className="mt-5 flex gap-3">
              <button onClick={() => setAdjusting(null)} className="flex-1 py-3 bg-[#F8FAFC] text-[#64748B] font-bold rounded-xl hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={saveAdjustment} disabled={saving} className="flex-1 py-3 bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-[#FFFFFF] font-bold font-bold rounded-xl shadow-lg shadow-orange-500/15 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <ArrowDownUp size={16} />} Apply Change
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button onClick={() => setViewingTx(null)} className="absolute top-4 right-4 text-[#64748B] hover:text-[#111827]">
              <X size={22} />
            </button>
            <h2 className="text-xl font-bold text-[#111827] mb-1">Transaction Details</h2>
            <p className="text-sm text-[#64748B] mb-6">{new Date(viewingTx.createdAt).toLocaleString()}</p>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-[#64748B] uppercase">Product</p>
                <p className="text-sm font-semibold text-[#111827] mt-1">{viewingTx.productId?.name || 'Unknown Product'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase">Type</p>
                  <span className={`inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                    viewingTx.type === 'stock_in' ? 'bg-[#F8FAFC] text-[#EA580C]' :
                    viewingTx.type === 'online_sale' ? 'bg-[#F8FAFC] text-[#EA580C]' :
                    viewingTx.type === 'offline_sale' ? 'bg-[#F8FAFC] text-[#EA580C]' : 'bg-[#F8FAFC] text-[#111827]'
                  }`}>
                    {viewingTx.type.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase">Source</p>
                  <p className="text-sm font-semibold text-[#111827] mt-1 capitalize">{viewingTx.sourceType}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase">Quantity Change</p>
                  <div className={`mt-1 text-lg font-black flex items-center gap-1 ${viewingTx.quantityChange > 0 ? 'text-[#EA580C]' : 'text-[#EA580C]'}`}>
                    {viewingTx.quantityChange > 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    {viewingTx.quantityChange > 0 ? '+' : ''}{viewingTx.quantityChange}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#64748B] uppercase">Stock After</p>
                  <p className="mt-1 text-lg font-black text-[#111827]">{viewingTx.stockAfter}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-[#64748B] uppercase">Note</p>
                <p className="text-sm text-[#64748B] mt-1 bg-[#F8FAFC] p-3 rounded-xl">{viewingTx.note || 'No notes attached.'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Low Stock Alert Popup Modal (for Gym Owners when coming below 5) */}
      {showLowStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#FFFFFF] rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border-2 border-amber-400 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowLowStockModal(false)}
              className="absolute top-5 right-5 text-[#64748B] hover:text-[#111827] p-1.5 rounded-full hover:bg-[#FFF7ED] transition-colors"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="flex items-start gap-4 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200 shadow-inner">
                <AlertTriangle size={26} className="animate-pulse" />
              </div>
              <div className="pr-6">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase tracking-wider bg-amber-500 text-white">
                    Action Required
                  </span>
                  <span className="text-xs text-amber-700 font-bold">Store Inventory Alert</span>
                </div>
                <h2 className="text-2xl font-black text-[#111827] mt-1 tracking-tight">
                  Low Stock Alert!
                </h2>
                <p className="text-sm text-[#64748B] mt-1 leading-relaxed">
                  Attention Gym Owner: The following product{lowStockAlertItems.length > 1 ? 's are' : ' is'} below the alert threshold (<strong>5 or fewer items remaining</strong>). Restock soon to prevent missed customer orders.
                </p>
              </div>
            </div>

            {/* Product List */}
            <div className="bg-[#F8F9FA] rounded-2xl border border-amber-200 p-4 max-h-64 overflow-y-auto custom-scrollbar space-y-3 mb-6">
              {lowStockAlertItems.length === 0 ? (
                <p className="text-sm text-[#64748B] text-center py-4">No products are currently low on stock.</p>
              ) : lowStockAlertItems.map((item) => {
                const isOut = item.stock <= 0;
                return (
                  <div key={item._id} className="bg-[#FFFFFF] rounded-xl p-3.5 border border-[#E2E8F0]/80 shadow-sm flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-[#111827] text-sm truncate">{item.name}</p>
                      <p className="text-xs text-[#64748B] mt-0.5">
                        Category: <span className="font-medium text-[#111827]">{item.categoryName || 'General'}</span>
                        {item.sku && <> · SKU: <span className="font-mono text-[11px]">{item.sku}</span></>}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-black inline-flex items-center gap-1 ${
                          isOut ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          <AlertTriangle size={12} />
                          {isOut ? 'Out of stock' : `${item.stock} left`}
                        </span>
                        <p className="text-[10px] text-[#64748B] mt-0.5">Alert at: {item.lowStockThreshold ?? 5}</p>
                      </div>
                      <button
                        onClick={() => {
                          setShowLowStockModal(false);
                          setAdjusting(item);
                          setAdjustQty('10');
                          setAdjustNote('Low stock restock');
                        }}
                        className="px-3 py-1.5 bg-[#C2410C] text-white font-bold rounded-lg hover:bg-[#C2410C] text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                      >
                        <Plus size={14} /> Restock
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
              <p className="text-xs text-[#111827] font-medium font-medium">
                💡 Set custom alert thresholds per product in Products settings.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowLowStockModal(false)}
                  className="px-5 py-2.5 bg-[#F8FAFC] hover:bg-gray-200 text-[#64748B] text-sm font-bold rounded-xl transition-colors"
                >
                  I Understand
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymStoreInventory;