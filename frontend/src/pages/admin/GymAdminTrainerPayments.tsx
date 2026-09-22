import { useState, useEffect, useCallback } from 'react';
import { IndianRupee, Plus, AlertCircle, Search, CreditCard, ChevronDown, CheckCircle } from 'lucide-react';
import api from '../../utils/api';
import clsx from 'clsx';

const PAYMENT_METHODS = ['Bank Transfer', 'UPI', 'Cash'];

const defaultForm = {
  trainerId: '',
  trainerFeeId: '',
  amount: '',
  paymentMethod: 'Bank Transfer',
  transactionId: '',
  paymentDate: new Date().toISOString().slice(0, 10),
  paymentProof: '',
  notes: '',
};

const GymAdminTrainerPayments = () => {
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<any>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
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
    setForm({
      ...defaultForm,
      trainerId: fee.trainerId._id,
      trainerFeeId: fee._id,
      amount: fee.feeAmount.toString(),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!payload.transactionId) delete payload.transactionId;
      await api.post('/trainer-payments/process', payload);
      showToast('Payment processed successfully');
      setShowModal(false);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to process payment', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Trainer Payments</h1>
          <p className="text-sm text-gray-500">Log new payments and process pending trainer dues.</p>
        </div>
      </div>

      {toast && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          toast.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-500" /> : <CheckCircle className="w-5 h-5 text-green-500" />}
          <p className="font-medium">{toast.msg}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search trainers..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Trainer</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fee Type</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fee Amount</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
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
                filteredFees.map(fee => (
                  <tr key={fee._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {fee.trainerId?.profilePhoto ? (
                          <img src={fee.trainerId.profilePhoto} alt="Trainer" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                            {fee.trainerId?.name?.charAt(0) || 'T'}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{fee.trainerId?.name}</p>
                          <p className="text-sm text-gray-500">{fee.trainerId?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-700">
                      {fee.trainingType}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-gray-900 flex items-center">
                        <IndianRupee className="w-4 h-4 mr-1" />
                        {fee.feeAmount}
                        <span className="text-gray-500 font-normal ml-1">/ {fee.billingCycle}</span>
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleMakePayment(fee)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors"
                      >
                        <CreditCard className="w-4 h-4" /> Make Payment
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Process Trainer Payment</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="number"
                      required
                      min="1"
                      value={form.amount}
                      onChange={e => setForm({ ...form, amount: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={form.paymentDate}
                    onChange={e => setForm({ ...form, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <div className="relative">
                  <select
                    value={form.paymentMethod}
                    onChange={e => setForm({ ...form, paymentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                  >
                    {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {['Bank Transfer', 'UPI'].includes(form.paymentMethod) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID / UTR</label>
                  <input
                    type="text"
                    required
                    maxLength={25}
                    value={form.transactionId}
                    onChange={e => {
                      const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                      setForm({ ...form, transactionId: val });
                    }}
                    placeholder="Enter transaction reference (max 25 chars)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                  placeholder="Optional details..."
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Processing...' : 'Submit Payment'}
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
