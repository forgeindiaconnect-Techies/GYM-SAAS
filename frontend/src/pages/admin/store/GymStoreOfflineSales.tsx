import { useState, useEffect } from 'react';
import { Plus, Loader2, Trash2, Store, Search, Eye, X } from 'lucide-react';
import api from '../../../utils/api';

const PAYMENT_METHODS = ['Cash', 'UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Bank Transfer', 'Other'];

const GymStoreOfflineSales = () => {
  const [tab, setTab] = useState<'record' | 'history'>('record');
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [lines, setLines] = useState<any[]>([{ productId: '', variantId: '', quantity: 1 }]);
  const [customerId, setCustomerId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [discount, setDiscount] = useState('0');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [sales, setSales] = useState<any[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);
  const [salesSearch, setSalesSearch] = useState('');
  const [viewingSale, setViewingSale] = useState<any>(null);

  const loadProducts = async () => {
    try {
      const res = await api.get('/store/admin/products?limit=200');
      setProducts((res.data.products || []).filter((p: any) => p.status === 'Active'));
    } catch (err) { console.error(err); }
  };

  const loadCustomers = async () => {
    try {
      const res = await api.get('/users?role=MEMBER');
      setCustomers(res.data?.users || res.data?.data || []);
    } catch (err) { console.error('Failed to load members for offline sale', err); }
  };

  const loadSales = async () => {
    try {
      setLoadingSales(true);
      const res = await api.get('/store/admin/offline-sales?limit=100');
      setSales(res.data.sales || []);
    } catch (err) { console.error(err); } finally { setLoadingSales(false); }
  };

  useEffect(() => {
    loadProducts();
    loadCustomers();
    loadSales();
  }, []);

  const productById = (id: string) => products.find((p) => p._id === id);
  const priceOf = (p: any) => p?.discountPrice ?? p?.sellingPrice;

  const priceOfLine = (l: any) => {
    const p = productById(l.productId);
    if (!p) return 0;
    if (l.variantId && p.hasVariants) {
      const v = p.variants?.find((v: any) => v._id === l.variantId);
      if (v) return v.discountPrice ?? v.price;
    }
    return priceOf(p);
  };

  const subtotal = lines.reduce((sum, l) => {
    return sum + (priceOfLine(l) * (Number(l.quantity) || 1));
  }, 0);
  const disc = Math.min(Number(discount) || 0, subtotal);
  const total = subtotal - disc;

  const updateLine = (idx: number, patch: any) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const addLine = () => setLines((prev) => [...prev, { productId: '', variantId: '', quantity: 1 }]);
  const removeLine = (idx: number) => setLines((prev) => prev.filter((_, i) => i !== idx));

  const save = async () => {
    const items = lines.filter((l) => l.productId);
    if (items.length === 0) { alert('Add at least one product to the sale.'); return; }
    try {
      setSaving(true);
      await api.post('/store/admin/offline-sales', {
        items: items.map((l) => ({ productId: l.productId, variantId: l.variantId || undefined, quantity: Number(l.quantity) || 1 })),
        customerId: customerId || undefined,
        paymentMethod,
        discount: Number(discount) || 0,
        note,
      });
      alert('Offline sale recorded successfully.');
      setLines([{ productId: '', variantId: '', quantity: 1 }]);
      setCustomerId('');
      setDiscount('0');
      setNote('');
      loadProducts();
      loadSales();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record sale');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Offline / In-Gym Sales</h1>
          <p className="text-[#455250] mt-1">Record sales made in person at the gym.</p>
        </div>
      </div>

      <div className="flex border-b border-[#D3DFDA] space-x-8">
        <button onClick={() => setTab('record')} className={`py-3 font-semibold text-sm transition-colors border-b-2 ${tab === 'record' ? 'border-[#164A4A] text-[#164A4A]' : 'border-transparent text-[#455250] hover:text-[#202828]'}`}>
          Record Sale
        </button>
        <button onClick={() => setTab('history')} className={`py-3 font-semibold text-sm transition-colors border-b-2 ${tab === 'history' ? 'border-[#164A4A] text-[#164A4A]' : 'border-transparent text-[#455250] hover:text-[#202828]'}`}>
          Sale History
        </button>
      </div>

      {tab === 'record' && (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <div className="bg-white border border-[#D3DFDA] rounded-2xl p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#687B78] uppercase mb-1 block">Member (optional)</label>
                  <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-3 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none">
                    <option value="">Walk-in customer (not linked)</option>
                    {customers.map((c) => <option key={c._id} value={c._id}>{c.firstName} {c.lastName} {c.email ? `· ${c.email}` : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#687B78] uppercase mb-1 block">Payment Method *</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-3 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none">
                    {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-[#687B78] uppercase">Items *</label>
                  <button onClick={addLine} className="text-xs font-bold text-[#164A4A] flex items-center gap-1 hover:underline"><Plus size={14} /> Add Item</button>
                </div>
                <div className="space-y-3">
                  {lines.map((line, idx) => {
                    const p = productById(line.productId);
                    return (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#F9F8F6] border border-[#D3DFDA] rounded-xl p-3">
                        <select value={line.variantId ? `${line.productId}|${line.variantId}` : line.productId} onChange={(e) => {
                             const val = e.target.value;
                             if (val.includes('|')) {
                                const [pId, vId] = val.split('|');
                                updateLine(idx, { productId: pId, variantId: vId });
                             } else {
                                updateLine(idx, { productId: val, variantId: '' });
                             }
                           }} 
                           className="flex-1 bg-white border border-[#D3DFDA] rounded-xl px-3 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none">
                          <option value="">Select product...</option>
                          {products.flatMap((pr) => {
                            if (pr.hasVariants && pr.variants && pr.variants.length > 0) {
                               return pr.variants.map((v: any) => {
                                 const out = v.stock <= 0;
                                 const attrs = Object.values(v.attributes).join(' / ');
                                 return <option key={v._id} value={`${pr._id}|${v._id}`} disabled={out}>{pr.name} - {attrs} — ₹{v.discountPrice ?? v.price}{out ? ' (out of stock)' : ` (${v.stock} in stock)`}</option>;
                               });
                            } else {
                              const out = pr.stock <= 0;
                              const variant = pr.variantFlavour ? ` (${pr.variantFlavour})` : '';
                              const size = pr.sizeWeightVolume ? ` - ${pr.sizeWeightVolume} ${pr.unit || ''}` : '';
                              return <option key={pr._id} value={pr._id} disabled={out}>{pr.name}{variant}{size} — ₹{priceOf(pr)}{out ? ' (out of stock)' : ` (${pr.stock} in stock)`}</option>;
                            }
                          })}
                        </select>
                        <input
                          type="number" min={1}
                          value={line.quantity}
                          onChange={(e) => updateLine(idx, { quantity: e.target.value })}
                          className="w-full sm:w-20 bg-white border border-[#D3DFDA] rounded-xl px-3 py-2 text-sm text-center text-[#202828] focus:border-[#164A4A] outline-none"
                        />
                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                          <span className="font-bold text-[#202828] w-20 text-right">₹{(priceOfLine(line) * (Number(line.quantity) || 1))}</span>
                          <div className="w-8 flex justify-end">
                            {lines.length > 1 && (
                              <button onClick={() => removeLine(idx)} className="p-1.5 bg-red-50 text-[#6fa3a0] rounded-lg hover:bg-red-100 transition-colors"><Trash2 size={15} /></button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#D3DFDA]">
                <div>
                  <label className="text-xs font-bold text-[#687B78] uppercase mb-1 block">Discount (₹)</label>
                  <input type="number" min={0} value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-3 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#687B78] uppercase mb-1 block">Note</label>
                  <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-3 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none" placeholder="Optional" />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[340px]">
             <div className="bg-[#F1F5F3] border border-[#D3DFDA] rounded-2xl p-6 flex flex-col sticky top-24 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <Store className="text-[#164A4A]/30" size={32} />
                  <span className="text-[10px] font-bold tracking-wider text-[#687B78] uppercase bg-[#EAE7DF] px-2.5 py-1 rounded-md">Summary</span>
                </div>
                
                <div className="space-y-3 mb-6 border-b border-[#D3DFDA] pb-6">
                  <div className="flex justify-between text-sm text-[#455250] font-medium">
                     <span>Subtotal</span>
                     <span>₹{total + Number(discount || 0)}</span>
                  </div>
                  {Number(discount || 0) > 0 && (
                    <div className="flex justify-between text-sm text-[#164A4A] font-medium">
                       <span>Discount</span>
                       <span>- ₹{discount}</span>
                    </div>
                  )}
                </div>
                
                <div className="mb-8">
                  <p className="text-xs font-bold text-[#687B78] uppercase mb-1">Total Amount</p>
                  <p className="text-4xl font-black text-[#164A4A]">₹{total}</p>
                </div>

                <button onClick={save} disabled={saving} className="w-full py-4 bg-gradient-to-r from-[#164A4A] to-[#6fa3a0] text-white font-bold rounded-xl shadow-lg shadow-green-200 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                  Record Sale
                </button>
             </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="bg-white border border-[#D3DFDA] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[#D3DFDA]">
            <div className="relative max-w-sm">
              <input value={salesSearch} onChange={(e) => setSalesSearch(e.target.value)} placeholder="Search..." className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl pl-9 pr-4 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none" />
              <Search className="absolute left-3 top-2.5 text-[#455250]" size={16} />
            </div>
          </div>
          {loadingSales ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#164A4A]" size={36} /></div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm text-[#455250] whitespace-nowrap">
                <thead className="bg-[#FFFFFF] border-b border-[#D3DFDA] text-[#202828]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Sale No.</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Items</th>
                    <th className="px-6 py-4 font-semibold">Method</th>
                    <th className="px-6 py-4 font-semibold text-right">Total</th>
                    <th className="px-6 py-4 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D3DFDA]">
                  {(salesSearch.trim()
                    ? sales.filter((s) => `${s.saleNumber} ${s.customerId?.firstName || ''} ${s.customerId?.lastName || ''}`.toLowerCase().includes(salesSearch.toLowerCase()))
                    : sales).map((s) => (
                    <tr key={s._id} className="hover:bg-[#F1F5F3] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#202828]">{s.saleNumber}</td>
                      <td className="px-6 py-4">{new Date(s.paymentDate || s.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 font-semibold">{s.customerId ? `${s.customerId.firstName} ${s.customerId.lastName}` : 'Walk-in'}</td>
                      <td className="px-6 py-4">{s.items.reduce((sum: number, i: any) => sum + i.quantity, 0)} item(s)</td>
                      <td className="px-6 py-4">{s.paymentMethod}</td>
                      <td className="px-6 py-4 text-right font-black text-[#164A4A]">₹{s.total}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => setViewingSale(s)} className="p-1.5 bg-blue-50 text-[#D2B48C] rounded-lg hover:bg-blue-100 transition-colors inline-flex items-center justify-center">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && <tr><td colSpan={6} className="px-6 py-10 text-center">No offline sales recorded yet.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {viewingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setViewingSale(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={22} />
            </button>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#202828]">Sale Details</h2>
              <p className="text-sm text-[#687B78] mt-1">{viewingSale.saleNumber}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-[#687B78] uppercase">Date</p>
                  <p className="text-sm text-[#202828] font-semibold">{new Date(viewingSale.paymentDate || viewingSale.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#687B78] uppercase">Customer</p>
                  <p className="text-sm text-[#202828] font-semibold">{viewingSale.customerId ? `${viewingSale.customerId.firstName} ${viewingSale.customerId.lastName}` : 'Walk-in customer'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#687B78] uppercase">Payment Method</p>
                  <p className="text-sm text-[#202828] font-semibold">{viewingSale.paymentMethod}</p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-bold text-[#687B78] uppercase mb-2">Items Purchased</p>
              <div className="bg-[#F9F8F6] rounded-xl border border-[#D3DFDA] overflow-hidden">
                <table className="w-full text-left text-sm text-[#455250]">
                  <thead className="bg-[#F2EFE8] border-b border-[#D3DFDA]">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Item</th>
                      <th className="px-4 py-2 font-semibold text-center">Qty</th>
                      <th className="px-4 py-2 font-semibold text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D3DFDA]">
                    {viewingSale.items.map((item: any, i: number) => (
                      <tr key={i}>
                        <td className="px-4 py-2 font-medium text-[#202828]">
                          {item.name}
                          {item.attributes && Object.keys(item.attributes).length > 0 && (
                            <span className="text-xs text-[#687B78] ml-1">({Object.values(item.attributes).join(', ')})</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">₹{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-2 border-t border-[#D3DFDA] pt-4">
              <div className="flex justify-between text-sm text-[#455250]">
                <span>Subtotal</span>
                <span>₹{viewingSale.total + Number(viewingSale.discount || 0)}</span>
              </div>
              {Number(viewingSale.discount || 0) > 0 && (
                <div className="flex justify-between text-sm text-[#164A4A]">
                  <span>Discount</span>
                  <span>- ₹{viewingSale.discount}</span>
                </div>
              )}
              {viewingSale.notes && (
                <div className="flex justify-between text-sm text-[#455250]">
                  <span>Note</span>
                  <span className="text-right max-w-[60%]">{viewingSale.notes}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-black text-[#164A4A] pt-2 border-t border-[#D3DFDA] mt-2">
                <span>Total</span>
                <span>₹{viewingSale.total}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymStoreOfflineSales;