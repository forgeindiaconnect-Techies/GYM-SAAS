import { useState, useEffect } from 'react';
import { Search, Loader2, Download, IndianRupee, ShoppingBag, Store } from 'lucide-react';
import api from '../../../utils/api';

const GymStoreSalesHistory = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [totals, setTotals] = useState<any>({ online: 0, offline: 0, all: 0 });
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('all');
  const [productName, setProductName] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

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
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Sales History</h1>
          <p className="text-[#475569] mt-1">Every online order and offline sale in one place.</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#CCFBF1] text-[#1E293B] font-bold rounded-xl hover:bg-[#F0FDFA] transition-colors">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#CCFBF1] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-black text-[#1E293B]">₹{totals.all.toLocaleString('en-IN')}</h3>
          </div>
          <IndianRupee className="text-[#16A34A]/20" size={36} />
        </div>
        <div className="bg-white border border-[#CCFBF1] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Online Orders</p>
            <h3 className="text-2xl font-black text-[#0D9488]">₹{totals.online.toLocaleString('en-IN')}</h3>
          </div>
          <ShoppingBag className="text-[#0D9488]/20" size={36} />
        </div>
        <div className="bg-white border border-[#CCFBF1] rounded-2xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Offline Sales</p>
            <h3 className="text-2xl font-black text-[#1E293B]">₹{totals.offline.toLocaleString('en-IN')}</h3>
          </div>
          <Store className="text-[#16A34A]/20" size={36} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3">
        <select value={source} onChange={(e) => setSource(e.target.value)} className="bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-3 py-2 text-sm text-[#1E293B] focus:border-[#16A34A] outline-none lg:w-44">
          <option value="all">All Sales</option>
          <option value="online">Online Orders</option>
          <option value="offline">Offline Sales</option>
        </select>
        <div className="relative flex-1">
          <input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Filter by product name..." className="w-full bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl pl-9 pr-4 py-2 text-sm text-[#1E293B] focus:border-[#16A34A] outline-none" />
          <Search className="absolute left-3 top-2.5 text-[#475569]" size={16} />
        </div>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-3 py-2 text-sm text-[#1E293B] focus:border-[#16A34A] outline-none" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="bg-[#F8FAFC] border border-[#CCFBF1] rounded-xl px-3 py-2 text-sm text-[#1E293B] focus:border-[#16A34A] outline-none" />
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#16A34A]" size={40} /></div>
      ) : (
        <div className="bg-white border border-[#CCFBF1] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm text-[#475569] whitespace-nowrap">
              <thead className="bg-[#FFFFFF] border-b border-[#CCFBF1] text-[#1E293B]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Reference</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Items</th>
                  <th className="px-6 py-4 font-semibold">Method</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CCFBF1]">
                {sales.length === 0 ? (
                  <tr><td colSpan={8} className="px-6 py-10 text-center">No sales found for the selected filters.</td></tr>
                ) : sales.map((s) => (
                  <tr key={s._id} className="hover:bg-[#F0FDFA] transition-colors">
                    <td className="px-6 py-4 font-bold text-[#1E293B]">{s.recordNumber}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${s.sourceType === 'Online Order' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'}`}>
                        {s.sourceType}
                      </span>
                    </td>
                    <td className="px-6 py-4">{new Date(s.date).toLocaleString()}</td>
                    <td className="px-6 py-4 font-semibold">{s.customer ? `${s.customer.firstName} ${s.customer.lastName}` : 'Walk-in'}</td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-[#1E293B]">{s.items.reduce((sum: number, i: any) => sum + i.quantity, 0)}</span> item(s)
                    </td>
                    <td className="px-6 py-4">{s.paymentMethod}</td>
                    <td className="px-6 py-4">
                      {s.sourceType === 'Online Order' ? (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          s.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          s.status === 'Cancelled' || s.status === 'Refunded' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{s.status}</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Completed</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-black text-green-600">₹{s.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymStoreSalesHistory;