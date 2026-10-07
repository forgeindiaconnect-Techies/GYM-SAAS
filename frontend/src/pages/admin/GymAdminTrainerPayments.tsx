import { useState, useEffect, useCallback } from 'react';
import {
  IndianRupee, AlertCircle, Search, CreditCard, CheckCircle,
  Building2, Smartphone, QrCode, Copy, Check, X, Banknote
} from 'lucide-react';
import api from '../../utils/api';
const UPI_APPS = [
  { name: 'Google Pay', handle: 'okaxis', color: 'from-blue-500 to-emerald-500' },
  { name: 'PhonePe', handle: 'ybl', color: 'from-purple-600 to-indigo-600' },
  { name: 'Paytm', handle: 'paytm', color: 'from-sky-500 to-blue-600' },
  { name: 'BHIM / UPI', handle: 'upi', color: 'from-emerald-600 to-teal-700' },
];

const defaultForm = {
  trainerId: '',
  trainerFeeId: '',
  amount: '',
  paymentMethod: 'Bank Transfer',
  transactionId: '',
  paymentDate: new Date().toISOString().slice(0, 10),
  // Bank details
  accountHolder: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  // UPI details
  upiId: '',
  upiName: '',
  upiApp: 'Google Pay',
  // Cash details
  handedOverTo: '',
  receiptNo: '',
  notes: '',
};

const GymAdminTrainerPayments = () => {
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [showQr, setShowQr] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [form, setForm] = useState<any>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const copyToClipboard = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/trainer-payments/fees');
      setFees(res.data.fees?.filter((f: any) => f.status === 'Active') || []);
    } catch {
      showToast('Failed to load trainer fees', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredFees = fees.filter(f => {
    const q = search.toLowerCase();
    const trainerName = f.trainerId?.name?.toLowerCase() || '';
    return trainerName.includes(q);
  });

  const handleMakePayment = (fee: any) => {
    setSelectedFee(fee);
    setShowQr(false);
    const trainer = fee.trainerId || {};
    const trainerName = trainer.name || 'Trainer';
    const emailPrefix = trainer.email ? trainer.email.split('@')[0] : 'trainer';
    const trainerPhone = trainer.phone || '';

    // Auto-prefill bank details from fee record or defaults
    const accountHolder = fee.bankDetails?.accountHolder || trainerName;
    const bankName = fee.bankDetails?.bankName || '';
    const accountNumber = fee.bankDetails?.accountNumber || '';
    const ifscCode = fee.bankDetails?.ifscCode || '';

    // Auto-prefill UPI details from fee record or defaults
    const defaultUpi = fee.upiDetails?.upiId || (trainerPhone ? `${trainerPhone}@paytm` : `${emailPrefix}@okaxis`);
    const upiName = fee.upiDetails?.upiName || trainerName;

    const payableAmount = fee.feeAmount ? fee.feeAmount.toString() : '0';

    setForm({
      ...defaultForm,
      trainerId: trainer._id,
      trainerFeeId: fee._id,
      amount: payableAmount,
      paymentMethod: fee.paymentMethod || 'Bank Transfer',
      accountHolder,
      bankName,
      accountNumber,
      ifscCode,
      upiId: defaultUpi,
      upiName,
      upiApp: 'Google Pay',
      handedOverTo: trainerName,
      receiptNo: '',
      transactionId: '',
      notes: `${fee.billingCycle || 'Monthly'} Trainer fee payment for ${trainerName}`,
    });
    setShowModal(true);
  };

  const handleSelectUpiApp = (app: typeof UPI_APPS[0]) => {
    setForm((prev: any) => {
      const currentUpi = prev.upiId || '';
      let userPart = currentUpi.includes('@') ? currentUpi.split('@')[0] : currentUpi;
      if (!userPart && selectedFee?.trainerId) {
        userPart = selectedFee.trainerId.phone || selectedFee.trainerId.email?.split('@')[0] || 'trainer';
      }
      return {
        ...prev,
        upiApp: app.name,
        upiId: `${userPart}@${app.handle}`,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Bank Transfer details if selected
    if (form.paymentMethod === 'Bank Transfer') {
      if (form.accountNumber && form.accountNumber.length < 9) {
        alert('Bank account number must be at least 9 digits (9–18 digits).');
        return;
      }
      if (form.ifscCode && form.ifscCode.length < 11) {
        alert('IFSC code must be exactly 11 characters.');
        return;
      }
    }

    // Enforce Transaction ID for digital payment methods
    if (['Bank Transfer', 'UPI'].includes(form.paymentMethod) && !form.transactionId?.trim()) {
      alert(`Please enter the ${form.paymentMethod === 'UPI' ? 'UPI Reference / UTR Number' : 'Bank UTR / Transaction ID'} to complete and confirm this payment.`);
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        trainerId: form.trainerId,
        trainerFeeId: form.trainerFeeId,
        amount: Number(form.amount),
        paymentMethod: form.paymentMethod,
        paymentDate: form.paymentDate,
        notes: form.notes,
      };

      if (form.transactionId?.trim()) {
        payload.transactionId = form.transactionId.trim();
      }

      await api.post('/trainer-payments/process', payload);
      showToast('Payment processed and recorded successfully!');
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to process payment', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Construct dynamic UPI payment URI for QR Code generator
  const upiPayUri = `upi://pay?pa=${encodeURIComponent(form.upiId || '')}&pn=${encodeURIComponent(form.upiName || selectedFee?.trainerId?.name || 'Trainer')}&am=${encodeURIComponent(form.amount || '0')}&cu=INR&tn=${encodeURIComponent('Trainer Fee Payment')}`;
  const upiQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiPayUri)}`;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trainer Payments</h1>
          <p className="text-sm text-gray-500">Log new payments and process pending trainer dues.</p>
        </div>
      </div>

      {toast && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-500" /> : <CheckCircle className="w-5 h-5 text-green-600" />}
          <p className="font-semibold text-sm">{toast.msg}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-[#E7E5E4] overflow-hidden">
        <div className="p-4 border-b border-[#E7E5E4] bg-gray-50/50 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search trainers by name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[#E7E5E4] rounded-xl focus:border-[#F97316] outline-none text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FFFDF8] border-b border-[#E7E5E4]">
                <th className="p-4 text-xs font-bold text-[#78716C] uppercase tracking-wider">Trainer</th>
                <th className="p-4 text-xs font-bold text-[#78716C] uppercase tracking-wider">Training Type</th>
                <th className="p-4 text-xs font-bold text-[#78716C] uppercase tracking-wider">Fee Amount</th>
                <th className="p-4 text-xs font-bold text-[#78716C] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">Loading active fees...</td>
                </tr>
              ) : filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">No active fees found. Configure fees first.</td>
                </tr>
              ) : (
                filteredFees.map(fee => {
                  return (
                    <tr key={fee._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {fee.trainerId?.profilePhoto ? (
                            <img src={fee.trainerId.profilePhoto} alt="Trainer" className="w-10 h-10 rounded-full object-cover border" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-[#F97316]/10 text-[#F97316] flex items-center justify-center font-bold text-sm">
                              {fee.trainerId?.name?.charAt(0) || 'T'}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-900">{fee.trainerId?.name}</p>
                            <p className="text-xs text-gray-500">{fee.trainerId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-700 font-medium">
                        {fee.trainingType}
                      </td>
                      <td className="p-4">
                        <span className="font-bold text-gray-900 flex items-center">
                          <IndianRupee className="w-4 h-4 mr-0.5 text-gray-500" />
                          {Number(fee.feeAmount || 0).toLocaleString('en-IN')}
                          <span className="text-gray-500 font-normal text-xs ml-1.5">/ {fee.billingCycle}</span>
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleMakePayment(fee)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[#F97316] text-white rounded-xl hover:bg-[#EA580C] font-bold text-xs shadow-md shadow-[#F97316]/15 transition-all"
                        >
                          <CreditCard className="w-4 h-4" /> Process Payment
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Process Trainer Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-[#E7E5E4] mt-8 mb-8 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#E7E5E4] flex justify-between items-center bg-[#FFFDF8] shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#292524]">Process Trainer Payment</h2>
                <p className="text-xs text-[#78716C] mt-0.5">
                  Confirm and record fee disbursement to trainer
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 custom-scrollbar">
              
              {/* Trainer Summary Badge */}
              <div className="p-4 bg-gradient-to-r from-[#FFFDF8] to-[#FFFFFF] border border-[#E7E5E4] rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#F97316] text-white flex items-center justify-center font-bold text-base shadow-sm">
                    {selectedFee?.trainerId?.name?.[0]?.toUpperCase() || 'T'}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#292524] text-base leading-tight">
                      {selectedFee?.trainerId?.name || 'Trainer'}
                    </h3>
                    <p className="text-xs text-[#78716C]">{selectedFee?.trainerId?.email}</p>
                    <span className="inline-block mt-1 text-[11px] font-semibold text-[#F97316] bg-[#F97316]/10 px-2 py-0.5 rounded-full">
                      {selectedFee?.trainingType || 'Offline Training'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-[#78716C] font-semibold block">Due Amount</span>
                  <span className="text-2xl font-black text-[#F97316] tracking-tight">
                    ₹{Number(selectedFee?.feeAmount || 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs text-gray-500 block font-medium">/ {selectedFee?.billingCycle || 'Monthly'}</span>
                </div>
              </div>

              {/* Amount and Payment Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider">
                      Amount to Pay *
                    </label>
                  </div>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      required
                      min="1"
                      value={form.amount}
                      onChange={e => setForm({ ...form, amount: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 border border-[#E7E5E4] rounded-xl text-base font-bold text-[#292524] outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1.5">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={form.paymentDate}
                    onChange={e => setForm({ ...form, paymentDate: e.target.value })}
                    className="w-full px-3 py-2.5 border border-[#E7E5E4] rounded-xl text-sm font-semibold outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/20"
                  />
                </div>
              </div>

              {/* Payment Method Selector Tabs */}
              <div>
                <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider mb-2">
                  Select Payment Method *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  
                  {/* Bank Transfer Card */}
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, paymentMethod: 'Bank Transfer' })}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all ${
                      form.paymentMethod === 'Bank Transfer'
                        ? 'border-[#F97316] bg-[#F97316]/5 text-[#F97316] font-bold shadow-sm'
                        : 'border-[#E7E5E4] bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Building2 className="w-5 h-5 mb-1" />
                    <span className="text-xs">Bank Transfer</span>
                  </button>

                  {/* UPI Card */}
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, paymentMethod: 'UPI' })}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all ${
                      form.paymentMethod === 'UPI'
                        ? 'border-[#F97316] bg-[#F97316]/5 text-[#F97316] font-bold shadow-sm'
                        : 'border-[#E7E5E4] bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 mb-1" />
                    <span className="text-xs">UPI / GPay / QR</span>
                  </button>

                  {/* Cash Card */}
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, paymentMethod: 'Cash' })}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-xl border-2 transition-all ${
                      form.paymentMethod === 'Cash'
                        ? 'border-[#F97316] bg-[#F97316]/5 text-[#F97316] font-bold shadow-sm'
                        : 'border-[#E7E5E4] bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <Banknote className="w-5 h-5 mb-1" />
                    <span className="text-xs">Cash</span>
                  </button>
                </div>
              </div>

              {/* -------------------- BANK TRANSFER DETAILS -------------------- */}
              {form.paymentMethod === 'Bank Transfer' && (
                <div className="p-4 bg-blue-50/50 border border-blue-200/80 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-blue-200/60 pb-2">
                    <div className="flex items-center gap-2 text-blue-900">
                      <Building2 className="w-4 h-4 text-blue-700" />
                      <h4 className="font-bold text-sm">Trainer Bank Account Details</h4>
                    </div>
                    {form.accountNumber && (
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`A/C: ${form.accountNumber}, IFSC: ${form.ifscCode}, Name: ${form.accountHolder}`, 'bankAll')}
                        className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                      >
                        {copiedKey === 'bankAll' ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        {copiedKey === 'bankAll' ? 'Copied Details' : 'Copy All'}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Account Holder Name *</label>
                      <input
                        type="text"
                        value={form.accountHolder}
                        onChange={e => setForm({ ...form, accountHolder: e.target.value })}
                        placeholder="Trainer full name as per bank"
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={form.bankName}
                        onChange={e => setForm({ ...form, bankName: e.target.value })}
                        placeholder="e.g. HDFC Bank, SBI, ICICI"
                        className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-gray-700">Account Number *</label>
                        {form.accountNumber && (
                          <span className={`text-[11px] font-semibold ${form.accountNumber.length >= 9 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {form.accountNumber.length}/18 digits {form.accountNumber.length >= 9 ? '✓' : '(min 9)'}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={18}
                          inputMode="numeric"
                          value={form.accountNumber}
                          onChange={e => setForm({ ...form, accountNumber: e.target.value.replace(/\D/g, '').slice(0, 18) })}
                          placeholder="e.g. 50100428765432 (9–18 digits)"
                          className={`w-full px-3 py-2 bg-white border rounded-lg text-sm font-mono outline-none pr-11 transition-all ${
                            form.accountNumber && form.accountNumber.length < 9
                              ? 'border-amber-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-200'
                              : 'border-blue-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-200'
                          }`}
                        />
                        {form.accountNumber && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(form.accountNumber, 'acc')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                            title="Copy Account Number"
                          >
                            {copiedKey === 'acc' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          </button>
                        )}
                      </div>
                      {form.accountNumber && form.accountNumber.length < 9 && (
                        <p className="text-[11px] text-amber-600 mt-1">Bank account number must be between 9 and 18 digits.</p>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-gray-700">IFSC Code *</label>
                        {form.ifscCode && (
                          <span className={`text-[11px] font-semibold ${form.ifscCode.length === 11 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {form.ifscCode.length}/11 {form.ifscCode.length === 11 ? '✓' : ''}
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <input
                          type="text"
                          maxLength={11}
                          value={form.ifscCode}
                          onChange={e => setForm({ ...form, ifscCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11) })}
                          placeholder="e.g. HDFC0001234"
                          className="w-full px-3 py-2 bg-white border border-blue-200 rounded-lg text-sm font-mono uppercase outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 pr-11 transition-all"
                        />
                        {form.ifscCode && (
                          <button
                            type="button"
                            onClick={() => copyToClipboard(form.ifscCode, 'ifsc')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                            title="Copy IFSC Code"
                          >
                            {copiedKey === 'ifsc' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          </button>
                        )}
                      </div>
                      {form.ifscCode && form.ifscCode.length > 0 && form.ifscCode.length < 11 && (
                        <p className="text-[11px] text-amber-600 mt-1">IFSC code must be exactly 11 characters.</p>
                      )}
                    </div>
                  </div>

                  {/* Bank Transaction ID / UTR Input */}
                  <div className="pt-2 border-t border-blue-200/60">
                    <label className="block text-xs font-bold text-blue-900 uppercase tracking-wider mb-1">
                      Bank UTR / Transaction Reference ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.transactionId}
                      maxLength={22}
                      onChange={e => setForm({ ...form, transactionId: e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() })}
                      placeholder="e.g. UTR202609298877 or IMPS987654"
                      className="w-full px-3 py-2.5 bg-white border-2 border-blue-300 rounded-xl text-sm font-mono font-semibold outline-none focus:border-blue-600 text-blue-950 placeholder:text-gray-400"
                    />
                    <p className="text-[11px] text-blue-700 mt-1">
                      Enter the UTR or reference number from your Netbanking/NEFT/IMPS transfer confirmation. (max 22 characters)
                    </p>
                  </div>
                </div>
              )}

              {/* -------------------- UPI DETAILS -------------------- */}
              {form.paymentMethod === 'UPI' && (
                <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-200/70 pb-2">
                    <div className="flex items-center gap-2 text-emerald-900">
                      <Smartphone className="w-4 h-4 text-emerald-700" />
                      <h4 className="font-bold text-sm">UPI Payment (GPay, PhonePe, Paytm)</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQr(!showQr)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <QrCode size={13} />
                      {showQr ? 'Hide QR Code' : 'Scan UPI QR Code'}
                    </button>
                  </div>

                  {/* Quick UPI App Selector Pills */}
                  <div>
                    <label className="block text-xs font-bold text-emerald-900 mb-1.5">Quick Select UPI App:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {UPI_APPS.map(app => (
                        <button
                          key={app.name}
                          type="button"
                          onClick={() => handleSelectUpiApp(app)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                            form.upiApp === app.name
                              ? 'bg-[#F97316] text-white border-[#F97316] shadow-sm'
                              : 'bg-white text-gray-700 border-emerald-200 hover:bg-emerald-100/50'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                          {app.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* UPI ID / VPA Row */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Trainer UPI ID / VPA *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={form.upiId}
                        onChange={e => setForm({ ...form, upiId: e.target.value.trim() })}
                        placeholder="e.g. 9876543210@paytm or trainer@okaxis"
                        className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-sm font-mono font-semibold outline-none focus:border-emerald-600"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(form.upiId, 'upiId')}
                        className="px-3.5 py-2 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
                        title="Copy UPI ID"
                      >
                        {copiedKey === 'upiId' ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        {copiedKey === 'upiId' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* QR Code Scanner Display */}
                  {showQr && (
                    <div className="p-4 bg-white border-2 border-dashed border-emerald-300 rounded-2xl flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                      <div className="p-2 bg-white rounded-xl shadow-md border border-gray-100 shrink-0">
                        <img
                          src={upiQrUrl}
                          alt="UPI QR Code"
                          className="w-36 h-36 object-contain rounded-lg"
                        />
                      </div>
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-1.5 justify-center sm:justify-start">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <h5 className="font-bold text-sm text-[#292524]">Scan with Any UPI App</h5>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          Scan using <b>Google Pay</b>, <b>PhonePe</b>, <b>Paytm</b>, or <b>BHIM</b> to transfer <b>₹{Number(form.amount).toLocaleString('en-IN')}</b> directly to <b>{form.upiName || selectedFee?.trainerId?.name}</b>.
                        </p>
                        <p className="text-[11px] text-gray-500 font-mono bg-gray-50 p-1.5 rounded-lg border border-gray-100 inline-block">
                          UPI VPA: {form.upiId}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* UPI Reference Number / Transaction ID */}
                  <div className="pt-2 border-t border-emerald-200/70">
                    <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wider mb-1">
                      UPI Reference / Transaction ID (UTR) *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.transactionId}
                      maxLength={12}
                      onChange={e => setForm({ ...form, transactionId: e.target.value.replace(/[^0-9]/g, '') })}
                      placeholder="e.g. 427212345678 (12-digit UTR)"
                      className="w-full px-3 py-2.5 bg-white border-2 border-emerald-300 rounded-xl text-sm font-mono font-semibold outline-none focus:border-emerald-600 text-emerald-950 placeholder:text-gray-400"
                    />
                    <p className="text-[11px] text-emerald-700 mt-1">
                      Enter the 12-digit UPI Transaction / UTR number from your Google Pay, PhonePe, or Paytm receipt. ({12 - form.transactionId.length} digits remaining)
                    </p>
                  </div>
                </div>
              )}

              {/* -------------------- CASH DETAILS -------------------- */}
              {form.paymentMethod === 'Cash' && (
                <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-amber-900 border-b border-amber-200/70 pb-2">
                    <Banknote className="w-4 h-4 text-amber-700" />
                    <h4 className="font-bold text-sm">Cash Payment Settlement</h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Handed Over To *</label>
                      <input
                        type="text"
                        value={form.handedOverTo}
                        onChange={e => setForm({ ...form, handedOverTo: e.target.value })}
                        placeholder="Trainer name"
                        className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Cash Receipt / Voucher No.</label>
                      <input
                        type="text"
                        value={form.transactionId}
                        onChange={e => setForm({ ...form, transactionId: e.target.value })}
                        placeholder="e.g. CASH-SEP-2026 (Optional)"
                        className="w-full px-3 py-2 bg-white border border-amber-200 rounded-lg text-sm outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-[#78716C] uppercase tracking-wider mb-1.5">
                  Payment Notes / Remarks (Optional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-[#E7E5E4] rounded-xl text-sm outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/20"
                  rows={2}
                  placeholder="e.g. Monthly trainer retainer fee for September 2026"
                />
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-3 border-t border-[#E7E5E4] flex justify-end gap-3 bg-[#FFFDF8] -mx-6 -mb-6 p-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200/70 rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-7 py-2.5 bg-[#F97316] text-white font-bold rounded-xl hover:bg-[#EA580C] transition-colors disabled:opacity-50 text-sm shadow-lg shadow-[#F97316]/20 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Confirm & Submit Payment
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminTrainerPayments;
