import { useState, useEffect } from 'react';
import { IndianRupee, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import api from '../../utils/api';

const WITHDRAWAL_METHODS = ['Bank Transfer', 'UPI'];

const defaultForm = {
  amount: '',
  withdrawalMethod: 'Bank Transfer',
  bankDetails: {
    accountHolder: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
  },
  upiDetails: {
    upiId: '',
    upiName: '',
  }
};

const TrainerWithdrawFunds = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchEarnings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/trainer-payments/my-earnings');
      setData(res.data);
    } catch {
      showToast('Failed to load balances', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEarnings(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(form.amount);

    if (amount < 100) {
      showToast('Minimum withdrawal amount is ₹100', 'error');
      return;
    }
    if (amount > (data?.trainer?.availableBalance || 0)) {
      showToast('Amount exceeds available balance', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { ...form };
      if (form.withdrawalMethod === 'Bank Transfer') delete payload.upiDetails;
      if (form.withdrawalMethod === 'UPI') delete payload.bankDetails;

      await api.post('/trainer-payments/withdraw', payload);
      showToast('Withdrawal request submitted successfully');
      setForm(defaultForm);
      await fetchEarnings();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to submit request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-10 h-10 border-4 border-[#34483F] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const available = data?.trainer?.availableBalance || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#202522]">Request Withdrawal</h1>
        <p className="text-[#727975] text-sm mt-1">Withdraw your available earnings directly to your bank account or UPI.</p>
      </div>

      {toast && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-500" /> : <CheckCircle className="w-5 h-5 text-green-500" />}
          <p className="font-medium">{toast.msg}</p>
        </div>
      )}

      <div className="bg-white border border-[#E8E5DA] rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Left side: Available Balance */}
        <div className="bg-[#F5F3EE] p-8 md:w-1/3 flex flex-col justify-center items-center text-center border-b md:border-b-0 md:border-r border-[#DCD9CD]">
          <p className="text-[#34483F] font-semibold text-sm uppercase tracking-wider mb-2">Available Balance</p>
          <h2 className="text-4xl font-bold text-[#202522]">₹{available.toLocaleString('en-IN')}</h2>
          <p className="text-[#727975] text-xs mt-3">Minimum withdrawal: ₹100</p>
        </div>

        {/* Right side: Form */}
        <div className="p-8 md:w-2/3">
          {available < 100 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3">
              <Clock className="w-12 h-12 text-[#A8ADA9]" />
              <p className="text-[#4A514D] font-medium">Insufficient Balance</p>
              <p className="text-[#727975] text-sm">You need at least ₹100 in available balance to request a withdrawal.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div>
                <label className="block text-sm font-semibold text-[#202522] mb-1.5">Amount to Withdraw</label>
                <div className="relative">
                  <IndianRupee size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8ADA9]" />
                  <input
                    type="number"
                    required
                    min="100"
                    max={available}
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="w-full pl-9 pr-4 py-2 border border-[#E8E5DA] rounded-xl outline-none focus:border-[#34483F] focus:ring-1 focus:ring-[#34483F]/30 transition-shadow"
                    placeholder={`Max ₹${available}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#202522] mb-1.5">Withdrawal Method</label>
                <select
                  value={form.withdrawalMethod}
                  onChange={e => setForm({ ...form, withdrawalMethod: e.target.value })}
                  className="w-full px-4 py-2 border border-[#E8E5DA] rounded-xl outline-none focus:border-[#34483F] focus:ring-1 focus:ring-[#34483F]/30"
                >
                  {WITHDRAWAL_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {form.withdrawalMethod === 'Bank Transfer' && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bank Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Account Holder Name" required className="col-span-2 w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 text-sm" value={form.bankDetails.accountHolder} onChange={e => setForm({ ...form, bankDetails: { ...form.bankDetails, accountHolder: e.target.value } })} />
                    <input type="text" placeholder="Bank Name" required className="col-span-2 w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 text-sm" value={form.bankDetails.bankName} onChange={e => setForm({ ...form, bankDetails: { ...form.bankDetails, bankName: e.target.value } })} />
                    <input type="text" placeholder="Account Number" required className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 text-sm" value={form.bankDetails.accountNumber} onChange={e => setForm({ ...form, bankDetails: { ...form.bankDetails, accountNumber: e.target.value } })} />
                    <input type="text" placeholder="IFSC Code" required className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 text-sm" value={form.bankDetails.ifscCode} onChange={e => setForm({ ...form, bankDetails: { ...form.bankDetails, ifscCode: e.target.value } })} />
                  </div>
                </div>
              )}

              {form.withdrawalMethod === 'UPI' && (
                <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">UPI Details</h3>
                  <input type="text" placeholder="UPI ID (e.g., name@okbank)" required className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 text-sm" value={form.upiDetails.upiId} onChange={e => setForm({ ...form, upiDetails: { ...form.upiDetails, upiId: e.target.value } })} />
                  <input type="text" placeholder="Registered Name" required className="w-full px-3 py-2 border rounded-lg outline-none focus:border-blue-500 text-sm" value={form.upiDetails.upiName} onChange={e => setForm({ ...form, upiDetails: { ...form.upiDetails, upiName: e.target.value } })} />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-[#34483F] text-white font-bold rounded-xl hover:bg-[#C6A77D] transition-colors disabled:opacity-50 mt-2"
              >
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerWithdrawFunds;
