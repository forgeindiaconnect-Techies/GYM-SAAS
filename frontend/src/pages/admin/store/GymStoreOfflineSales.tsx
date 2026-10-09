import { useState, useEffect } from 'react';
import { 
  Plus, Loader2, Trash2, Store, Search, Eye, X, 
  QrCode, Smartphone, Copy, Check, Banknote, Building2, 
  CheckCircle2, Edit2, AlertCircle, Wallet
} from 'lucide-react';
import QRCode from 'react-qr-code';
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

  // Payment details state
  const [gym, setGym] = useState<any>(null);
  const [upiId, setUpiId] = useState('');
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [tempUpiId, setTempUpiId] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [bankRef, setBankRef] = useState('');
  const [bankSender, setBankSender] = useState('');
  const [otherRef, setOtherRef] = useState('');

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

  const loadGym = async () => {
    try {
      const res = await api.get('/gyms/my-gym');
      if (res.data?.gym) {
        setGym(res.data.gym);
        const configuredUpi = res.data.gym.paymentSettings?.upiId;
        if (configuredUpi) {
          setUpiId(configuredUpi);
          setTempUpiId(configuredUpi);
        } else {
          const slug = (res.data.gym.name || 'gym').toLowerCase().replace(/[^a-z0-9]/g, '');
          const defaultUpi = `${slug || 'gym'}@paytm`;
          setUpiId(defaultUpi);
          setTempUpiId(defaultUpi);
        }
      }
    } catch (err) {
      console.error('Failed to load gym details', err);
    }
  };

  useEffect(() => {
    loadProducts();
    loadCustomers();
    loadSales();
    loadGym();
  }, []);

  // Update default UPI handle when specific app is selected
  useEffect(() => {
    if (!upiId) return;
    const userPart = upiId.split('@')[0] || (gym?.name ? gym.name.toLowerCase().replace(/[^a-z0-9]/g, '') : 'gym');
    if (paymentMethod === 'Paytm' && !upiId.endsWith('@paytm')) {
      const newUpi = `${userPart}@paytm`;
      setUpiId(newUpi);
      setTempUpiId(newUpi);
    } else if (paymentMethod === 'Google Pay' && !upiId.endsWith('@okaxis') && !upiId.endsWith('@okhdfcbank')) {
      const newUpi = `${userPart}@okaxis`;
      setUpiId(newUpi);
      setTempUpiId(newUpi);
    } else if (paymentMethod === 'PhonePe' && !upiId.endsWith('@ybl') && !upiId.endsWith('@ibl')) {
      const newUpi = `${userPart}@ybl`;
      setUpiId(newUpi);
      setTempUpiId(newUpi);
    }
  }, [paymentMethod]);

  const productById = (id: string) => products.find((p) => p._id === id);
  const priceOf = (p: any) => p ? (p.sellingPrice - (p.discountPrice || 0)) : 0;

  const priceOfLine = (l: any) => {
    const p = productById(l.productId);
    if (!p) return 0;
    if (l.variantId && p.hasVariants) {
      const v = p.variants?.find((v: any) => v._id === l.variantId);
      if (v) return v.price - (v.discountPrice || 0);
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

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleSaveUpi = () => {
    if (tempUpiId.trim()) {
      setUpiId(tempUpiId.trim());
      setIsEditingUpi(false);
    }
  };

  const isUpiMethod = ['UPI', 'Google Pay', 'PhonePe', 'Paytm'].includes(paymentMethod);

  // Dynamic UPI URI string for the QR code
  const upiPayUri = `upi://pay?pa=${encodeURIComponent(upiId || 'gym@paytm')}&pn=${encodeURIComponent(gym?.name || 'AI Gym Store')}&am=${encodeURIComponent(total)}&cu=INR&tn=${encodeURIComponent(`Store Sale ${paymentMethod}`)}`;

  const save = async () => {
    const items = lines.filter((l) => l.productId);
    if (items.length === 0) { alert('Add at least one product to the sale.'); return; }

    // Build comprehensive note if cash / transfer information entered
    let combinedNote = note.trim();
    if (paymentMethod === 'Cash' && cashReceived) {
      const cashChange = Math.max(0, Number(cashReceived) - total);
      const cashText = `Cash Received: ₹${cashReceived}, Change Returned: ₹${cashChange}`;
      combinedNote = combinedNote ? `${combinedNote} | ${cashText}` : cashText;
    }
    if (paymentMethod === 'Bank Transfer' && bankSender.trim()) {
      combinedNote = combinedNote ? `${combinedNote} | Sender: ${bankSender.trim()}` : `Sender: ${bankSender.trim()}`;
    }
    if (paymentMethod === 'Other' && otherRef.trim()) {
      combinedNote = combinedNote ? `${combinedNote} | Ref: ${otherRef.trim()}` : `Ref: ${otherRef.trim()}`;
    }

    try {
      setSaving(true);
      await api.post('/store/admin/offline-sales', {
        items: items.map((l) => ({ productId: l.productId, variantId: l.variantId || undefined, quantity: Number(l.quantity) || 1 })),
        customerId: customerId || undefined,
        paymentMethod,
        transactionId: transactionId.trim() || bankRef.trim() || otherRef.trim() || undefined,
        upiId: isUpiMethod ? upiId : undefined,
        discount: Number(discount) || 0,
        note: combinedNote || undefined,
      });

      alert(`Offline sale recorded successfully with ${paymentMethod}!`);
      setLines([{ productId: '', variantId: '', quantity: 1 }]);
      setCustomerId('');
      setDiscount('0');
      setNote('');
      setTransactionId('');
      setCashReceived('');
      setBankRef('');
      setBankSender('');
      setOtherRef('');
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
          <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Offline / In-Gym Sales</h1>
          <p className="text-[#78716C] mt-1">Record sales made in person at the gym with live payment scanning.</p>
        </div>
      </div>

      <div className="flex border-b border-[#E7E5E4] space-x-8">
        <button onClick={() => setTab('record')} className={`py-3 font-semibold text-sm transition-colors border-b-2 ${tab === 'record' ? 'border-[#F97316] text-[#F97316]' : 'border-transparent text-[#78716C] hover:text-[#292524]'}`}>
          Record Sale
        </button>
      </div>

      {tab === 'record' && (
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6 space-y-5">
              
              {/* Customer and Payment Method row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#78716C] uppercase mb-1 block">Member (optional)</label>
                  <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-3 py-2 text-sm text-[#292524] focus:border-[#F97316] outline-none">
                    <option value="">Walk-in customer (not linked)</option>
                    {customers.map((c) => <option key={c._id} value={c._id}>{c.firstName} {c.lastName} {c.email ? `· ${c.email}` : ''}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#78716C] uppercase mb-1 block">Payment Method *</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-3 py-2 text-sm text-[#292524] focus:border-[#F97316] outline-none font-medium">
                    {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* Visual Quick Payment Method Selector Pills */}
              <div>
                <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider block mb-2">Select or Switch Method:</span>
                <div className="flex flex-wrap gap-2">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = paymentMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? 'bg-[#F97316] text-white border-[#F97316] shadow-sm shadow-[#F97316]/20 scale-[1.02]'
                            : 'bg-[#FFFDF8] text-[#78716C] border-[#E7E5E4] hover:bg-[#EAE7DF] hover:text-[#292524]'
                        }`}
                      >
                        {method === 'Cash' && <Banknote size={14} />}
                        {method === 'UPI' && <QrCode size={14} />}
                        {method === 'Google Pay' && <Smartphone size={14} />}
                        {method === 'PhonePe' && <Smartphone size={14} />}
                        {method === 'Paytm' && <Smartphone size={14} />}
                        {method === 'Bank Transfer' && <Building2 size={14} />}
                        {method === 'Other' && <Wallet size={14} />}
                        {method}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ----------------- DYNAMIC PAYMENT DETAILS SECTION ----------------- */}

              {/* 1. UPI / Paytm / PhonePe / Google Pay Panel */}
              {isUpiMethod && (
                <div className="bg-gradient-to-br from-[#FFFDF8] to-[#E8F0EC] border-2 border-[#F97316]/30 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E7E5E4] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl text-white font-bold flex items-center justify-center ${
                        paymentMethod === 'Paytm' ? 'bg-[#002E6E]' :
                        paymentMethod === 'Google Pay' ? 'bg-[#1a73e8]' :
                        paymentMethod === 'PhonePe' ? 'bg-[#5f259f]' :
                        'bg-[#F97316]'
                      }`}>
                        <QrCode size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#292524] flex items-center gap-2">
                          {paymentMethod === 'Paytm' && 'Paytm UPI QR & Payment'}
                          {paymentMethod === 'Google Pay' && 'Google Pay UPI QR & Payment'}
                          {paymentMethod === 'PhonePe' && 'PhonePe UPI QR & Payment'}
                          {paymentMethod === 'UPI' && 'UPI Instant QR Scanner'}
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-white/80 text-[#F97316] border border-[#F97316]/20">
                            Live Scanner
                          </span>
                        </h4>
                        <p className="text-xs text-[#78716C]">Customer can scan this QR code with {paymentMethod} or any UPI app</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#78716C] font-medium">Amount to Pay:</span>
                      <span className="text-base font-black text-[#F97316] bg-white px-3 py-1 rounded-lg border border-[#E7E5E4]">
                        ₹{total}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6 pt-1">
                    {/* QR Code Scanner Box */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="relative p-4 bg-white border-2 border-[#F97316]/40 rounded-2xl shadow-md flex items-center justify-center group">
                        {/* Viewfinder crosshairs */}
                        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#F97316] rounded-tl-sm"></div>
                        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#F97316] rounded-tr-sm"></div>
                        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#F97316] rounded-bl-sm"></div>
                        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#F97316] rounded-br-sm"></div>

                        {/* QR Code component */}
                        <QRCode
                          value={upiPayUri}
                          size={135}
                          bgColor="#FFFFFF"
                          fgColor="#292524"
                          level="M"
                        />
                      </div>

                      <div className="text-center mt-2.5 space-y-0.5">
                        <span className="text-[11px] font-bold text-[#F97316] uppercase tracking-wider block">
                          Scan to Pay ₹{total}
                        </span>
                        <span className="text-[10px] text-[#78716C]">
                          Works with Paytm, GPay, PhonePe, BHIM
                        </span>
                      </div>
                    </div>

                    {/* UPI ID Details & UTR input */}
                    <div className="flex-1 w-full space-y-3">
                      {/* Recipient UPI ID Card */}
                      <div className="bg-white border border-[#E7E5E4] rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider">
                            Recipient UPI ID ({gym?.name || 'Gym Account'})
                          </label>
                          {!isEditingUpi ? (
                            <button
                              type="button"
                              onClick={() => { setIsEditingUpi(true); setTempUpiId(upiId); }}
                              className="text-xs font-bold text-[#F97316] hover:underline flex items-center gap-1"
                            >
                              <Edit2 size={12} /> Edit UPI
                            </button>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={handleSaveUpi}
                                className="text-xs font-bold text-white bg-[#F97316] px-2 py-0.5 rounded hover:opacity-90"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setIsEditingUpi(false)}
                                className="text-xs font-medium text-gray-500 hover:text-gray-700"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>

                        {isEditingUpi ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={tempUpiId}
                              onChange={(e) => setTempUpiId(e.target.value)}
                              placeholder="e.g. gymname@paytm"
                              className="flex-1 bg-[#FFFDF8] border border-[#F97316] rounded-lg px-3 py-1.5 text-xs text-[#292524] font-mono outline-none"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between bg-[#F9F8F6] border border-[#EAE7DF] rounded-lg px-3 py-2">
                            <span className="font-mono font-bold text-sm text-[#292524] tracking-wide select-all">
                              {upiId || 'gym@paytm'}
                            </span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(upiId)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                                copiedUpi
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-white border border-[#E7E5E4] text-[#F97316] hover:bg-[#FFFDF8]'
                              }`}
                            >
                              {copiedUpi ? <Check size={13} /> : <Copy size={13} />}
                              {copiedUpi ? 'Copied!' : 'Copy'}
                            </button>
                          </div>
                        )}

                        {/* Quick UPI Handle suggestions */}
                        <div className="flex items-center gap-2 pt-1 text-[11px] text-[#78716C]">
                          <span>Handles:</span>
                          {['@paytm', '@okaxis', '@ybl', '@upi'].map((handle) => {
                            const userPart = upiId.split('@')[0] || 'gym';
                            const target = `${userPart}${handle}`;
                            return (
                              <button
                                key={handle}
                                type="button"
                                onClick={() => { setUpiId(target); setTempUpiId(target); }}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                                  upiId.endsWith(handle)
                                    ? 'bg-[#F97316] text-white font-bold'
                                    : 'bg-[#FFFDF8] text-[#78716C] hover:bg-gray-200'
                                }`}
                              >
                                {handle}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Transaction / UTR ID Input */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-[#78716C] uppercase">
                            UPI Transaction / UTR Number (12 digits)
                          </label>
                          {transactionId.length === 12 && (
                            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                              <CheckCircle2 size={13} /> 12-Digit UTR
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          maxLength={16}
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value.trim())}
                          placeholder="e.g. 429381029381 (from customer's screen)"
                          className="w-full bg-white border border-[#E7E5E4] rounded-xl px-3 py-2 text-sm font-mono text-[#292524] focus:border-[#F97316] outline-none"
                        />
                        <p className="text-[11px] text-[#78716C] mt-1">
                          Enter the 12-digit UTR reference from {paymentMethod} to record the payment verification.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Cash Payment Panel */}
              {paymentMethod === 'Cash' && (
                <div className="bg-[#FFFDF8] border border-[#E7E5E4] rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3">
                    <div className="flex items-center gap-2">
                      <Banknote className="text-[#F97316]" size={20} />
                      <h4 className="font-bold text-sm text-[#292524]">Cash Payment Counter</h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#78716C]">Total Due:</span>
                      <span className="font-black text-sm text-[#F97316] bg-white px-2.5 py-0.5 rounded border border-[#E7E5E4]">
                        ₹{total}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#78716C] uppercase mb-1 block">
                        Cash Handed by Customer (₹)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        placeholder={`e.g. ${total}`}
                        className="w-full bg-white border border-[#E7E5E4] rounded-xl px-3 py-2 text-sm text-[#292524] font-bold focus:border-[#F97316] outline-none"
                      />

                      {/* Quick Denomination Chips */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <button
                          type="button"
                          onClick={() => setCashReceived(String(total))}
                          className="px-2 py-1 text-[11px] font-bold bg-white border border-[#E7E5E4] rounded-lg hover:border-[#F97316] text-[#F97316]"
                        >
                          Exact (₹{total})
                        </button>
                        {[100, 200, 500, 1000, 2000].filter(a => a >= total).slice(0, 3).map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => setCashReceived(String(amt))}
                            className="px-2 py-1 text-[11px] font-medium bg-white border border-[#E7E5E4] rounded-lg hover:border-[#F97316] text-[#78716C]"
                          >
                            ₹{amt}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col justify-center">
                      {cashReceived && Number(cashReceived) >= total ? (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-800">
                          <span className="text-[11px] font-bold uppercase tracking-wider block text-emerald-700">
                            Change to Return
                          </span>
                          <span className="text-2xl font-black text-emerald-600">
                            ₹{Number(cashReceived) - total}
                          </span>
                          <p className="text-[11px] text-emerald-700 mt-0.5">Please hand this change to the customer.</p>
                        </div>
                      ) : cashReceived && Number(cashReceived) < total ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-amber-800">
                          <span className="text-[11px] font-bold uppercase tracking-wider block text-amber-700">
                            Amount Pending / Short
                          </span>
                          <span className="text-xl font-bold text-amber-600">
                            - ₹{total - Number(cashReceived)}
                          </span>
                          <p className="text-[11px] text-amber-700 mt-0.5">Customer still owes this balance.</p>
                        </div>
                      ) : (
                        <div className="bg-white border border-dashed border-[#E7E5E4] rounded-xl p-3 text-center text-xs text-[#78716C]">
                          Enter cash received to automatically calculate change to return.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Bank Transfer Panel */}
              {paymentMethod === 'Bank Transfer' && (
                <div className="bg-[#FFFDF8] border border-[#E7E5E4] rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="text-[#F97316]" size={20} />
                      <h4 className="font-bold text-sm text-[#292524]">Bank Account Details</h4>
                    </div>
                    <span className="font-black text-sm text-[#F97316] bg-white px-2.5 py-0.5 rounded border border-[#E7E5E4]">
                      ₹{total}
                    </span>
                  </div>

                  {gym?.paymentSettings?.accountNumber ? (
                    <div className="bg-white border border-[#E7E5E4] rounded-xl p-3.5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#78716C] block">Account Name</span>
                        <span className="font-bold text-[#292524]">{gym.paymentSettings.accountName || gym.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#78716C] block">Bank Name</span>
                        <span className="font-bold text-[#292524]">{gym.paymentSettings.bankName || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#78716C] block">Account Number</span>
                        <span className="font-mono font-bold text-[#292524]">{gym.paymentSettings.accountNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#78716C] block">IFSC Code</span>
                        <span className="font-mono font-bold text-[#292524]">{gym.paymentSettings.ifscCode}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
                      <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Gym Bank Details not set in Gym Profile</span>
                        <p className="text-[11px] text-amber-700 mt-0.5">You can still enter the reference ID below to complete the sale.</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-[#78716C] uppercase mb-1 block">
                        Bank Reference / IMPS / NEFT Number *
                      </label>
                      <input
                        type="text"
                        value={bankRef}
                        onChange={(e) => setBankRef(e.target.value)}
                        placeholder="e.g. IMPS1928301928"
                        className="w-full bg-white border border-[#E7E5E4] rounded-xl px-3 py-2 text-sm text-[#292524] focus:border-[#F97316] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#78716C] uppercase mb-1 block">
                        Sender Bank / Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={bankSender}
                        onChange={(e) => setBankSender(e.target.value)}
                        placeholder="e.g. HDFC Bank - Rajesh"
                        className="w-full bg-white border border-[#E7E5E4] rounded-xl px-3 py-2 text-sm text-[#292524] focus:border-[#F97316] outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Other Payment Panel */}
              {paymentMethod === 'Other' && (
                <div className="bg-[#FFFDF8] border border-[#E7E5E4] rounded-2xl p-5 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 border-b border-[#E7E5E4] pb-2">
                    <Wallet className="text-[#F97316]" size={18} />
                    <h4 className="font-bold text-sm text-[#292524]">Other Payment Method Details</h4>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#78716C] uppercase mb-1 block">
                      Payment Reference / POS Slip / Details
                    </label>
                    <input
                      type="text"
                      value={otherRef}
                      onChange={(e) => setOtherRef(e.target.value)}
                      placeholder="e.g. Card POS Terminal Auth Code #38192 or Cheque #102931"
                      className="w-full bg-white border border-[#E7E5E4] rounded-xl px-3 py-2 text-sm text-[#292524] focus:border-[#F97316] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Items Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-[#78716C] uppercase">Items *</label>
                  <button onClick={addLine} className="text-xs font-bold text-[#F97316] flex items-center gap-1 hover:underline"><Plus size={14} /> Add Item</button>
                </div>
                <div className="space-y-3">
                  {lines.map((line, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-3 bg-[#F9F8F6] border border-[#E7E5E4] rounded-xl p-3">
                        <select value={line.variantId ? `${line.productId}|${line.variantId}` : line.productId} onChange={(e) => {
                             const val = e.target.value;
                             if (val.includes('|')) {
                                const [pId, vId] = val.split('|');
                                updateLine(idx, { productId: pId, variantId: vId });
                             } else {
                                updateLine(idx, { productId: val, variantId: '' });
                             }
                           }} 
                           className="flex-1 bg-white border border-[#E7E5E4] rounded-xl px-3 py-2 text-sm text-[#292524] focus:border-[#F97316] outline-none">
                          <option value="">Select product...</option>
                          {products.flatMap((pr) => {
                            if (pr.hasVariants && pr.variants && pr.variants.length > 0) {
                               return pr.variants.map((v: any) => {
                                 const out = v.stock <= 0;
                                 const attrs = Object.values(v.attributes).join(' / ');
                                 return <option key={v._id} value={`${pr._id}|${v._id}`} disabled={out}>{pr.name} - {attrs} — ₹{v.price - (v.discountPrice || 0)}{out ? ' (out of stock)' : ` (${v.stock} in stock)`}</option>;
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
                          className="w-full sm:w-20 bg-white border border-[#E7E5E4] rounded-xl px-3 py-2 text-sm text-center text-[#292524] focus:border-[#F97316] outline-none"
                        />
                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                          <span className="font-bold text-[#292524] w-20 text-right">₹{(priceOfLine(line) * (Number(line.quantity) || 1))}</span>
                          <div className="w-8 flex justify-end">
                            {lines.length > 1 && (
                              <button onClick={() => removeLine(idx)} className="p-1.5 bg-red-50 text-[#FED7AA] rounded-lg hover:bg-red-100 transition-colors"><Trash2 size={15} /></button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Discount and Note */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#E7E5E4]">
                <div>
                  <label className="text-xs font-bold text-[#78716C] uppercase mb-1 block">Discount (₹)</label>
                  <input type="number" min={0} value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-3 py-2 text-sm text-[#292524] focus:border-[#F97316] outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#78716C] uppercase mb-1 block">Note</label>
                  <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl px-3 py-2 text-sm text-[#292524] focus:border-[#F97316] outline-none" placeholder="Optional" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Summary Column */}
          <div className="w-full lg:w-[340px]">
             <div className="bg-[#FFFDF8] border border-[#E7E5E4] rounded-2xl p-6 flex flex-col sticky top-24 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <Store className="text-[#F97316]/30" size={32} />
                  <span className="text-[10px] font-bold tracking-wider text-[#78716C] uppercase bg-[#EAE7DF] px-2.5 py-1 rounded-md">Summary</span>
                </div>
                
                <div className="space-y-3 mb-6 border-b border-[#E7E5E4] pb-6">
                  <div className="flex justify-between text-sm text-[#78716C] font-medium">
                     <span>Subtotal</span>
                     <span>₹{total + Number(discount || 0)}</span>
                  </div>
                  {Number(discount || 0) > 0 && (
                    <div className="flex justify-between text-sm text-[#F97316] font-medium">
                       <span>Discount</span>
                       <span>- ₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs text-[#78716C]">
                     <span>Payment Mode</span>
                     <span className="font-bold text-[#292524]">{paymentMethod}</span>
                  </div>
                  {isUpiMethod && upiId && (
                    <div className="flex justify-between text-[11px] text-[#78716C]">
                       <span>Recipient UPI</span>
                       <span className="font-mono text-[#F97316] font-semibold truncate max-w-[150px]">{upiId}</span>
                    </div>
                  )}
                </div>
                
                <div className="mb-8">
                  <p className="text-xs font-bold text-[#78716C] uppercase mb-1">Total Amount</p>
                  <p className="text-4xl font-black text-[#F97316]">₹{total}</p>
                </div>

                <button onClick={save} disabled={saving} className="w-full py-4 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                  Record Sale
                </button>
             </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="bg-white border border-[#E7E5E4] rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-[#E7E5E4]">
            <div className="relative max-w-sm">
              <input value={salesSearch} onChange={(e) => setSalesSearch(e.target.value)} placeholder="Search..." className="w-full bg-[#FFFDF8] border border-[#E7E5E4] rounded-xl pl-9 pr-4 py-2 text-sm text-[#292524] focus:border-[#F97316] outline-none" />
              <Search className="absolute left-3 top-2.5 text-[#78716C]" size={16} />
            </div>
          </div>
          {loadingSales ? (
            <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[#F97316]" size={36} /></div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm text-[#78716C] whitespace-nowrap">
                <thead className="bg-[#FFFFFF] border-b border-[#E7E5E4] text-[#292524]">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Sale No.</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 font-semibold">Customer</th>
                    <th className="px-6 py-4 font-semibold">Items</th>
                    <th className="px-6 py-4 font-semibold">Method & Verification</th>
                    <th className="px-6 py-4 font-semibold text-right">Total</th>
                    <th className="px-6 py-4 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E4]">
                  {(salesSearch.trim()
                    ? sales.filter((s) => `${s.saleNumber} ${s.customerId?.firstName || ''} ${s.customerId?.lastName || ''}`.toLowerCase().includes(salesSearch.toLowerCase()))
                    : sales).map((s) => (
                    <tr key={s._id} className="hover:bg-[#FFFDF8] transition-colors">
                      <td className="px-6 py-4 font-bold text-[#292524]">{s.saleNumber}</td>
                      <td className="px-6 py-4">{new Date(s.paymentDate || s.createdAt).toLocaleString()}</td>
                      <td className="px-6 py-4 font-semibold">{s.customerId ? `${s.customerId.firstName} ${s.customerId.lastName}` : 'Walk-in'}</td>
                      <td className="px-6 py-4">{s.items.reduce((sum: number, i: any) => sum + i.quantity, 0)} item(s)</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#292524] flex items-center gap-1.5">
                            {s.paymentMethod}
                          </span>
                          {s.transactionId && (
                            <span className="text-[11px] font-mono text-[#F97316] mt-0.5">
                              UTR: {s.transactionId}
                            </span>
                          )}
                          {s.upiId && !s.transactionId && (
                            <span className="text-[10px] font-mono text-[#78716C] mt-0.5">
                              {s.upiId}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-black text-[#F97316]">₹{s.total}</td>
                      <td className="px-6 py-4 text-center">
                        <button onClick={() => setViewingSale(s)} className="p-1.5 bg-blue-50 text-[#F97316] rounded-lg hover:bg-blue-100 transition-colors inline-flex items-center justify-center">
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && <tr><td colSpan={7} className="px-6 py-10 text-center">No offline sales recorded yet.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Sale Details Modal */}
      {viewingSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => setViewingSale(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={22} />
            </button>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#292524]">Sale Details</h2>
              <p className="text-sm text-[#78716C] mt-1">{viewingSale.saleNumber}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase">Date</p>
                  <p className="text-sm text-[#292524] font-semibold">{new Date(viewingSale.paymentDate || viewingSale.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase">Customer</p>
                  <p className="text-sm text-[#292524] font-semibold">{viewingSale.customerId ? `${viewingSale.customerId.firstName} ${viewingSale.customerId.lastName}` : 'Walk-in customer'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-[#78716C] uppercase">Payment Method</p>
                  <p className="text-sm text-[#292524] font-semibold">{viewingSale.paymentMethod}</p>
                </div>
                {viewingSale.transactionId && (
                  <div>
                    <p className="text-xs font-bold text-[#78716C] uppercase">Transaction / UTR ID</p>
                    <p className="text-sm text-[#F97316] font-mono font-bold">{viewingSale.transactionId}</p>
                  </div>
                )}
                {viewingSale.upiId && (
                  <div>
                    <p className="text-xs font-bold text-[#78716C] uppercase">UPI ID</p>
                    <p className="text-sm text-[#292524] font-mono">{viewingSale.upiId}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-bold text-[#78716C] uppercase mb-2">Items Purchased</p>
              <div className="bg-[#F9F8F6] rounded-xl border border-[#E7E5E4] overflow-hidden">
                <table className="w-full text-left text-sm text-[#78716C]">
                  <thead className="bg-[#FFFDF8] border-b border-[#E7E5E4]">
                    <tr>
                      <th className="px-4 py-2 font-semibold">Item</th>
                      <th className="px-4 py-2 font-semibold text-center">Qty</th>
                      <th className="px-4 py-2 font-semibold text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E7E5E4]">
                    {viewingSale.items.map((item: any, i: number) => (
                      <tr key={i}>
                        <td className="px-4 py-2 font-medium text-[#292524]">
                          {item.name}
                          {item.attributes && Object.keys(item.attributes).length > 0 && (
                            <span className="text-xs text-[#78716C] ml-1">({Object.values(item.attributes).join(', ')})</span>
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

            <div className="space-y-2 border-t border-[#E7E5E4] pt-4">
              <div className="flex justify-between text-sm text-[#78716C]">
                <span>Subtotal</span>
                <span>₹{viewingSale.total + Number(viewingSale.discount || 0)}</span>
              </div>
              {Number(viewingSale.discount || 0) > 0 && (
                <div className="flex justify-between text-sm text-[#F97316]">
                  <span>Discount</span>
                  <span>- ₹{viewingSale.discount}</span>
                </div>
              )}
              {(viewingSale.note || viewingSale.notes) && (
                <div className="flex justify-between text-sm text-[#78716C]">
                  <span>Note</span>
                  <span className="text-right max-w-[60%]">{viewingSale.note || viewingSale.notes}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-black text-[#F97316] pt-2 border-t border-[#E7E5E4] mt-2">
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