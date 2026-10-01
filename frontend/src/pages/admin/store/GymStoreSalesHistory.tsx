import { useState, useEffect } from 'react';
import { Search, Loader2, Download, IndianRupee, ShoppingBag, Store, Eye, X } from 'lucide-react';
import api from '../../../utils/api';

const GymStoreSalesHistory = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [totals, setTotals] = useState<any>({ online: 0, offline: 0, all: 0 });
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('all');
  const [productName, setProductName] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedSale, setSelectedSale] = useState<any | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (source !== 'all') params.set('source', source);
      if (productName.trim()) params.set('productName', productName.trim());
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      params.set('limit', '200');
      const res = await api.get(`/store/admin/sales?${params.toString()}`);
      setSales(res.data.sales || []);
      setTotals(res.data.totals || { online: 0, offline: 0, all: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [source, productName, from, to]);

  const exportCSV = () => {
    const headers = ['Ref', 'Type', 'Date', 'Customer', 'Items', 'Total(₹)', 'Method', 'Status'];
    const rows = sales.map((s: any) => [
      s.recordNumber,
      s.sourceType,
      new Date(s.date).toLocaleString(),
      s.customer ? `${s.customer.firstName} ${s.customer.lastName}` : 'Walk-in',
      s.items.reduce((sum: number, i: any) => sum + i.quantity, 0),
      s.total,
      s.paymentMethod,
      s.sourceType === 'Online Order' ? s.status : 'In-Gym',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `sales_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Sales History</h1>
          <p className="text-[#455250] mt-1">Every online order and offline sale in one place.</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#D3DFDA] text-[#202828] font-bold rounded-xl hover:bg-[#F1F5F3] transition-colors">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#A8ADA9] uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-black text-[#202828]">₹{totals.all.toLocaleString('en-IN')}</h3>
          </div>
          <IndianRupee className="text-[#164A4A]/20" size={36} />
        </div>
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#A8ADA9] uppercase tracking-wider">Online Orders</p>
            <h3 className="text-2xl font-black text-[#6fa3a0]">₹{totals.online.toLocaleString('en-IN')}</h3>
          </div>
          <ShoppingBag className="text-[#6fa3a0]/20" size={36} />
        </div>
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#A8ADA9] uppercase tracking-wider">Offline Sales</p>
            <h3 className="text-2xl font-black text-[#202828]">₹{totals.offline.toLocaleString('en-IN')}</h3>
          </div>
          <Store className="text-[#164A4A]/20" size={36} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <select value={source} onChange={(e) => setSource(e.target.value)} className="bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-3 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none lg:w-44">
          <option value="all">All Sales</option>
          <option value="online">Online Orders</option>
          <option value="offline">Offline Sales</option>
        </select>
        <div className="relative flex-1">
          <input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Filter by product name..." className="w-full bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl pl-9 pr-4 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none" />
          <Search className="absolute left-3 top-2.5 text-[#455250]" size={16} />
        </div>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-3 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="bg-[#F2EFE8] border border-[#D3DFDA] rounded-xl px-3 py-2 text-sm text-[#202828] focus:border-[#164A4A] outline-none" />
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#164A4A]" size={40} /></div>
      ) : (
        <div className="bg-white border border-[#D3DFDA] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm text-[#455250] whitespace-nowrap">
              <thead className="bg-[#FFFFFF] border-b border-[#D3DFDA] text-[#202828]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Reference</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Items</th>
                  <th className="px-6 py-4 font-semibold">Method</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Total</th>
                  <th className="px-6 py-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D3DFDA]">
                {sales.length === 0 ? (
                  <tr><td colSpan={9} className="px-6 py-10 text-center">No sales found for the selected filters.</td></tr>
                ) : sales.map((s) => (
                  <tr key={s._id} className="hover:bg-[#F1F5F3] transition-colors">
                    <td className="px-6 py-4 font-bold text-[#202828]">{s.recordNumber}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${s.sourceType === 'Online Order' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'}`}>
                        {s.sourceType}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(s.date).toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold">{s.customer ? `${s.customer.firstName} ${s.customer.lastName || ''}`.trim() : 'Walk-in'}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#202828]">{s.items.reduce((sum: number, i: any) => sum + i.quantity, 0)}</span> item(s)
                    </td>
                    <td className="px-6 py-4">{s.paymentMethod}</td>
                    <td className="px-6 py-4">
                      {s.sourceType === 'Online Order' ? (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          s.status === 'Completed' ? 'bg-[#D2B48C]/10 text-[#164A4A]' :
                          s.status === 'Cancelled' || s.status === 'Refunded' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{s.status}</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#D2B48C]/10 text-[#164A4A]">Completed</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-[#164A4A]">₹{s.total}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setSelectedSale(s)}
                        className="px-3 py-1.5 border border-[#D3DFDA] rounded-xl text-[#164A4A] hover:bg-[#164A4A] hover:text-white transition-all font-semibold text-xs flex items-center gap-1.5 mx-auto shadow-2xs"
                        title="View Details"
                      >
                        <Eye size={14} />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sale Details Modal */}
      {selectedSale && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedSale(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#D3DFDA] overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className={`h-1.5 w-full ${selectedSale.sourceType === 'Online Order' ? 'bg-purple-600' : 'bg-teal-600'}`} />
            
            <div className="px-6 py-4 border-b border-[#D3DFDA] flex items-center justify-between bg-[#F8FAFC]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[#202828] text-base">{selectedSale.recordNumber}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${selectedSale.sourceType === 'Online Order' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'}`}>
                    {selectedSale.sourceType}
                  </span>
                </div>
                <p className="text-xs text-[#455250] mt-0.5">Sale Details & Itemized Breakdown</p>
              </div>
              <button onClick={() => setSelectedSale(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F8FAFC] border border-[#E8EAED] rounded-xl p-3.5">
                <div>
                  <span className="text-[#455250] block font-medium">Date & Time</span>
                  <span className="font-bold text-[#202828]">{new Date(selectedSale.date).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[#455250] block font-medium">Payment Method</span>
                  <span className="font-bold text-[#202828]">{selectedSale.paymentMethod || 'Cash'}</span>
                </div>
                <div>
                  <span className="text-[#455250] block font-medium">Status</span>
                  <span className="font-bold text-[#164A4A]">{selectedSale.status || 'Completed'}</span>
                </div>
                <div>
                  <span className="text-[#455250] block font-medium">Total Amount</span>
                  <span className="font-black text-[#164A4A] text-sm">₹{selectedSale.total}</span>
                </div>
              </div>

              <div className="bg-[#F8FAFC] border border-[#E8EAED] rounded-xl p-3.5 space-y-1">
                <span className="font-bold text-[#164A4A] uppercase tracking-wider block text-[11px]">Customer Information</span>
                <p className="font-bold text-[#202828] text-sm">
                  {selectedSale.customer ? `${selectedSale.customer.firstName} ${selectedSale.customer.lastName || ''}`.trim() : 'Walk-in / In-Gym Customer'}
                </p>
                {selectedSale.customer?.email && <p className="text-[#455250]">Email: {selectedSale.customer.email}</p>}
                {selectedSale.customer?.mobile && <p className="text-[#455250]">Phone: {selectedSale.customer.mobile}</p>}
              </div>

              <div>
                <span className="font-bold text-[#202828] text-xs mb-2 block">Purchased Items ({selectedSale.items?.length || 0})</span>
                <div className="border border-[#D3DFDA] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#F8FAFC] border-b border-[#D3DFDA] text-[#202828]">
                      <tr>
                        <th className="px-4 py-2.5 font-bold">Item Name</th>
                        <th className="px-4 py-2.5 font-bold text-center">Qty</th>
                        <th className="px-4 py-2.5 font-bold text-right">Price</th>
                        <th className="px-4 py-2.5 font-bold text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8EAED]">
                      {selectedSale.items?.map((item: any, idx: number) => {
                        const price = item.price || item.sellingPrice || Math.round(selectedSale.total / Math.max(1, selectedSale.items.length));
                        const qty = item.quantity || 1;
                        return (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-2.5 font-semibold text-[#202828]">{item.productName || item.name || item.title || 'Store Product'}</td>
                            <td className="px-4 py-2.5 text-center font-bold">{qty}</td>
                            <td className="px-4 py-2.5 text-right">₹{price}</td>
                            <td className="px-4 py-2.5 text-right font-bold text-[#164A4A]">₹{price * qty}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-[#D3DFDA] bg-[#F8FAFC] flex justify-end">
              <button onClick={() => setSelectedSale(null)} className="px-5 py-2 bg-[#164A4A] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymStoreSalesHistory;
