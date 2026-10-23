import { useState, useEffect } from 'react';
import { Search, Loader2, Download, IndianRupee, ShoppingBag, Store, Eye, X, FileText, Printer } from 'lucide-react';
import api from '../../../utils/api';
import DownSelect from '../../../components/common/DownSelect';

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

  const downloadInvoice = (sale: any) => {
    if (!sale) return;
    const customerName = sale.customer
      ? `${sale.customer.firstName || ''} ${sale.customer.lastName || ''}`.trim()
      : 'Walk-in Customer';
    const customerEmail = sale.customer?.email || 'N/A';
    const customerMobile = sale.customer?.mobile || 'N/A';
    const formattedDate = new Date(sale.date || Date.now()).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    const itemsHtml = (sale.items || []).map((item: any, idx: number) => {
      const price = item.price || item.sellingPrice || Math.round((sale.total || 0) / Math.max(1, (sale.items || []).length));
      const qty = item.quantity || 1;
      const subtotal = price * qty;
      return `
        <tr style="border-bottom: 1px solid #292940;">
          <td style="padding: 10px 12px; font-weight: 600; color: #11111F;">${idx + 1}. ${item.productName || item.name || item.title || 'Store Product'}</td>
          <td style="padding: 10px 12px; text-align: center; color: #11111F;">${qty}</td>
          <td style="padding: 10px 12px; text-align: right; color: #11111F;">₹${price.toLocaleString('en-IN')}</td>
          <td style="padding: 10px 12px; text-align: right; font-weight: 700; color: #11111F;">₹${subtotal.toLocaleString('en-IN')}</td>
        </tr>
      `;
    }).join('');

    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert('Please allow popups to print/download the invoice.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice_${sale.recordNumber || 'SALE'}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
            body { font-family: 'Inter', sans-serif; margin: 0; padding: 40px; background: #0B0B12; color: #11111F; }
            .invoice-card { max-width: 720px; margin: 0 auto; background: #ffffff; border: 1px solid #292940; border-radius: 16px; padding: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #6366F1; padding-bottom: 20px; margin-bottom: 24px; }
            .logo { font-size: 24px; font-weight: 900; color: #6366F1; text-transform: uppercase; letter-spacing: -0.5px; }
            .invoice-title { font-size: 22px; font-weight: 800; text-align: right; color: #11111F; }
            .ref-no { font-size: 13px; font-weight: 700; color: #4F46E5; margin-top: 4px; text-align: right; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; background: #0B0B12; padding: 18px; border-radius: 12px; border: 1px solid #0B0B12; }
            .info-block p { margin: 3px 0; font-size: 12px; color: #A1A1AA; }
            .info-block strong { color: #11111F; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { background: #0B0B12; color: #11111F; font-size: 11px; text-transform: uppercase; font-weight: 700; padding: 10px 12px; text-align: left; }
            .total-box { display: flex; justify-content: flex-end; margin-top: 20px; }
            .total-table { width: 260px; }
            .total-table tr td { padding: 6px 0; font-size: 13px; }
            .grand-total { font-size: 18px; font-weight: 900; color: #6366F1; border-top: 2px solid #292940; padding-top: 8px; }
            .footer { text-align: center; margin-top: 36px; padding-top: 20px; border-top: 1px dashed #292940; font-size: 11px; color: #A1A1AA; }
            @media print {
              body { padding: 0; background: #fff; }
              .invoice-card { border: none; box-shadow: none; padding: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="invoice-card">
            <div class="header">
              <div>
                <div class="logo">💪 GYM STORE</div>
                <p style="margin: 4px 0 0 0; font-size: 12px; color: #A1A1AA;">Official Tax Invoice & Receipt</p>
              </div>
              <div>
                <div class="invoice-title">INVOICE</div>
                <div class="ref-no">#${sale.recordNumber || 'INV-0001'}</div>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-block">
                <p style="font-size: 10px; font-weight: 800; color: #A1A1AA; text-transform: uppercase;">Billed To</p>
                <p><strong>Customer:</strong> ${customerName}</p>
                <p><strong>Email:</strong> ${customerEmail}</p>
                <p><strong>Phone:</strong> ${customerMobile}</p>
              </div>
              <div class="info-block" style="text-align: right;">
                <p style="font-size: 10px; font-weight: 800; color: #A1A1AA; text-transform: uppercase;">Payment Info</p>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Payment Method:</strong> ${sale.paymentMethod || 'Cash'}</p>
                ${sale.transactionId ? `<p><strong>UTR / Ref:</strong> ${sale.transactionId}</p>` : ''}
                <p><strong>Channel:</strong> ${sale.sourceType || 'Store Sale'}</p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th style="text-align: center;">Qty</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div class="total-box">
              <table class="total-table">
                <tr>
                  <td>Subtotal:</td>
                  <td style="text-align: right; font-weight: 600;">₹${(sale.total || 0).toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td>Taxes (Included):</td>
                  <td style="text-align: right; font-weight: 600;">₹0</td>
                </tr>
                <tr class="grand-total">
                  <td>Grand Total:</td>
                  <td style="text-align: right;">₹${(sale.total || 0).toLocaleString('en-IN')}</td>
                </tr>
              </table>
            </div>

            <div class="footer">
              <p style="margin: 0; font-weight: 600; color: #A1A1AA;">Thank you for shopping at Gym Store!</p>
              <p style="margin: 4px 0 0 0;">This is an official computer-generated receipt for your store transaction.</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#11111F] tracking-tight">Sales History</h1>
          <p className="text-[#A1A1AA] mt-1">Every online order and offline sale in one place.</p>
        </div>
        <button onClick={exportCSV} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#292940] text-[#11111F] font-bold rounded-xl hover:bg-[#0B0B12] transition-colors cursor-pointer shadow-xs">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#292940] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-black text-[#11111F]">₹{totals.all.toLocaleString('en-IN')}</h3>
          </div>
          <IndianRupee className="text-[#6366F1]/20" size={36} />
        </div>
        <div className="bg-white border border-[#292940] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Online Orders</p>
            <h3 className="text-2xl font-black text-[#4F46E5]">₹{totals.online.toLocaleString('en-IN')}</h3>
          </div>
          <ShoppingBag className="text-[#4F46E5]/20" size={36} />
        </div>
        <div className="bg-white border border-[#292940] rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">Offline Sales</p>
            <h3 className="text-2xl font-black text-[#11111F]">₹{totals.offline.toLocaleString('en-IN')}</h3>
          </div>
          <Store className="text-[#6366F1]/20" size={36} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        <DownSelect
          value={source}
          onChange={(val) => setSource(val)}
          options={[
            { label: 'All Sales', value: 'all' },
            { label: 'Online Orders', value: 'online' },
            { label: 'Offline Sales', value: 'offline' }
          ]}
          className="lg:w-48"
        />
        <div className="relative flex-1">
          <input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Filter by product name..." className="w-full bg-[#0B0B12] border border-[#292940] rounded-xl pl-9 pr-4 py-2 text-sm text-[#11111F] focus:border-[#6366F1] outline-none" />
          <Search className="absolute left-3 top-2.5 text-[#A1A1AA]" size={16} />
        </div>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="bg-[#0B0B12] border border-[#292940] rounded-xl px-3 py-2 text-sm text-[#11111F] focus:border-[#6366F1] outline-none" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="bg-[#0B0B12] border border-[#292940] rounded-xl px-3 py-2 text-sm text-[#11111F] focus:border-[#6366F1] outline-none" />
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#6366F1]" size={40} /></div>
      ) : (
        <div className="bg-white border border-[#292940] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs text-[#A1A1AA]">
              <thead className="bg-[#0B0B12] border-b border-[#292940] text-[#11111F]">
                <tr>
                  <th className="px-3.5 py-3 font.bold">Reference</th>
                  <th className="px-3.5 py-3 font-bold">Type</th>
                  <th className="px-3.5 py-3 font-bold">Date</th>
                  <th className="px-3.5 py-3 font-bold">Customer</th>
                  <th className="px-3.5 py-3 font-bold">Items</th>
                  <th className="px-3.5 py-3 font-bold">Method</th>
                  <th className="px-3.5 py-3 font-bold">Status</th>
                  <th className="px-3.5 py-3 font-bold text-right">Total</th>
                  <th className="px-3.5 py-3 font-bold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#292940]">
                {sales.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-sm">No sales found for the selected filters.</td></tr>
                ) : sales.map((s) => (
                  <tr key={s._id} className="hover:bg-[#0B0B12] transition-colors">
                    <td className="px-3.5 py-3 font-bold text-[#11111F] whitespace-nowrap">{s.recordNumber}</td>
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${s.sourceType === 'Online Order' ? 'bg-[#17172A] text-[#6366F1]' : 'bg-teal-100 text-teal-700'}`}>
                        {s.sourceType}
                      </span>
                    </td>
                    <td className="px-3.5 py-3 whitespace-nowrap text-[11px]">{new Date(s.date).toLocaleString()}</td>
                    <td className="px-3.5 py-3 font-semibold whitespace-nowrap">{s.customer ? `${s.customer.firstName} ${s.customer.lastName || ''}`.trim() : 'Walk-in'}</td>
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <span className="font-bold text-[#11111F]">{s.items.reduce((sum: number, i: any) => sum + i.quantity, 0)}</span> item(s)
                    </td>
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      <div className="font-medium text-[#11111F]">{s.paymentMethod}</div>
                      {s.transactionId && (
                        <div className="text-[10px] font-mono text-[#6366F1]">UTR: {s.transactionId}</div>
                      )}
                    </td>
                    <td className="px-3.5 py-3 whitespace-nowrap">
                      {s.sourceType === 'Online Order' ? (
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          s.status === 'Completed' ? 'bg-[#17172A]/10 text-[#6366F1]' :
                          s.status === 'Cancelled' || s.status === 'Refunded' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{s.status}</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#17172A]/10 text-[#6366F1]">Completed</span>
                      )}
                    </td>
                    <td className="px-3.5 py-3 text-right font-black text-[#6366F1] whitespace-nowrap text-sm">₹{s.total}</td>
                    <td className="px-3.5 py-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedSale(s)}
                          className="px-2 py-1 border border-[#292940] rounded-lg text-[#6366F1] hover:bg-[#6366F1] hover:text-white transition-all font-semibold text-xs flex items-center gap-1 cursor-pointer shadow-2xs"
                          title="View Details"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => downloadInvoice(s)}
                          className="px-2.5 py-1 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all font-bold text-xs flex items-center gap-1 cursor-pointer shadow-sm"
                          title="Download Invoice"
                        >
                          <FileText size={13} />
                          <span>Invoice</span>
                        </button>
                      </div>
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
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#292940] overflow-hidden max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className={`h-1.5 w-full ${selectedSale.sourceType === 'Online Order' ? 'bg-[#6366F1]' : 'bg-teal-600'}`} />
            
            <div className="px-6 py-4 border-b border-[#292940] flex items-center justify-between bg-[#0B0B12]">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-[#11111F] text-base">{selectedSale.recordNumber}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${selectedSale.sourceType === 'Online Order' ? 'bg-[#17172A] text-[#6366F1]' : 'bg-teal-100 text-teal-700'}`}>
                    {selectedSale.sourceType}
                  </span>
                </div>
                <p className="text-xs text-[#A1A1AA] mt-0.5">Sale Details & Itemized Breakdown</p>
              </div>
              <button onClick={() => setSelectedSale(null)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="border border-[#292940] rounded-xl overflow-hidden divide-y divide-[#292940] bg-white shadow-sm">
                <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#292940]">
                  <div className="p-3 bg-white flex flex-col justify-center">
                    <span className="text-[#A1A1AA] block font-bold text-[10px] uppercase tracking-wider mb-1">Date & Time</span>
                    <span className="font-semibold text-xs text-[#11111F]">{new Date(selectedSale.date).toLocaleString()}</span>
                  </div>
                  <div className="p-3 bg-white flex flex-col justify-center">
                    <span className="text-[#A1A1AA] block font-bold text-[10px] uppercase tracking-wider mb-1">Payment Method</span>
                    <span className="font-semibold text-xs text-[#11111F]">{selectedSale.paymentMethod || 'Cash'}</span>
                    {selectedSale.transactionId && (
                      <span className="text-[10px] font-mono text-[#6366F1] mt-0.5 font-bold">UTR: {selectedSale.transactionId}</span>
                    )}
                  </div>
                  <div className="p-3 bg-white flex flex-col justify-center">
                    <span className="text-[#A1A1AA] block font-bold text-[10px] uppercase tracking-wider mb-1">Status</span>
                    <span className="font-bold text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit">{selectedSale.status || 'Completed'}</span>
                  </div>
                  <div className="p-3 bg-white flex flex-col justify-center">
                    <span className="text-[#A1A1AA] block font-bold text-[10px] uppercase tracking-wider mb-1">Total Amount</span>
                    <span className="font-black text-sm text-[#6366F1]">₹{selectedSale.total}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#292940]">
                  <div className="p-3 bg-white flex flex-col justify-center">
                    <span className="text-[#A1A1AA] block font-bold text-[10px] uppercase tracking-wider mb-1">Customer</span>
                    <span className="font-bold text-xs text-[#11111F]">
                      {selectedSale.customer ? `${selectedSale.customer.firstName} ${selectedSale.customer.lastName || ''}`.trim() : 'Walk-in Customer'}
                    </span>
                  </div>
                  <div className="p-3 bg-white flex flex-col justify-center">
                    <span className="text-[#A1A1AA] block font-bold text-[10px] uppercase tracking-wider mb-1">Customer Email</span>
                    <span className="font-semibold text-xs text-[#11111F]">{selectedSale.customer?.email || '—'}</span>
                  </div>
                  <div className="p-3 bg-white flex flex-col justify-center">
                    <span className="text-[#A1A1AA] block font-bold text-[10px] uppercase tracking-wider mb-1">Customer Phone</span>
                    <span className="font-semibold text-xs text-[#11111F]">{selectedSale.customer?.mobile || '—'}</span>
                  </div>
                </div>
              </div>

              <div>
                <span className="font-bold text-[#11111F] text-xs mb-2 block">Purchased Items ({selectedSale.items?.length || 0})</span>
                <div className="border border-[#292940] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#0B0B12] border-b border-[#292940] text-[#11111F]">
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
                            <td className="px-4 py-2.5 font-semibold text-[#11111F]">{item.productName || item.name || item.title || 'Store Product'}</td>
                            <td className="px-4 py-2.5 text-center font-bold">{qty}</td>
                            <td className="px-4 py-2.5 text-right">₹{price}</td>
                            <td className="px-4 py-2.5 text-right font-bold text-[#6366F1]">₹{price * qty}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-[#292940] bg-[#0B0B12] flex items-center justify-between gap-3">
              <button
                onClick={() => downloadInvoice(selectedSale)}
                className="px-4 py-2 bg-white border border-[#292940] text-[#11111F] rounded-xl font-bold hover:bg-[#0B0B12] transition-colors flex items-center gap-2 text-xs cursor-pointer shadow-xs"
              >
                <Printer size={15} className="text-[#6366F1]" /> Download Invoice
              </button>
              <button onClick={() => setSelectedSale(null)} className="px-5 py-2 bg-[#6366F1] text-white rounded-xl font-bold hover:bg-[#4F46E5] transition-colors cursor-pointer text-xs">
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

