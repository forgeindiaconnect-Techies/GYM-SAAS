import { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, XCircle, CreditCard, Banknote, Smartphone, ArrowRight, ChevronDown, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const PAYMENT_METHODS = ['Bank Transfer', 'UPI', 'Cash'];

const defaultPayForm = {
  amount: '',
  paymentMethod: 'Bank Transfer',
  transactionId: '',
  paymentDate: new Date().toISOString().slice(0, 10),
  notes: '',
  // Bank Transfer
  accountHolder: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  // UPI
  upiId: '',
  upiName: '',
};

const GymAdminPendingTrainerPayments = () => {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [payForm, setPayForm] = useState<any>(defaultPayForm);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [statuses, setStatuses] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('pendingTrainerStatuses');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleStatusChange = async (feeId: string, value: string) => {
    // Optimistic update locally
    const newStatuses = { ...statuses, [feeId]: value };
    setStatuses(newStatuses);
    localStorage.setItem('pendingTrainerStatuses', JSON.stringify(newStatuses));

    try {
      await api.put('/trainer-payments/fee/status', { feeId, status: value });
      showToast('Status updated successfully', 'success');
    } catch (error) {
      showToast('Failed to update status', 'error');
      // Revert optimistic update
      const reverted = { ...statuses };
      delete reverted[feeId];
      setStatuses(reverted);
      localStorage.setItem('pendingTrainerStatuses', JSON.stringify(reverted));
    }
  };

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/trainer-payments/pending');
      setPending(res.data.pending || []);
    } catch {
      showToast('Failed to load pending payments', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const openProcess = (item: any) => {
    setSelectedTrainer(item);
    setPayForm({ 
      ...defaultPayForm, 
      amount: item.feeAmount,
      paymentMethod: item.paymentMethod || 'Bank Transfer',
      accountHolder: item.bankDetails?.accountHolder || '',
      bankName: item.bankDetails?.bankName || '',
      accountNumber: item.bankDetails?.accountNumber || '',
      ifscCode: item.bankDetails?.ifscCode || '',
      upiId: item.upiDetails?.upiId || '',
      upiName: item.upiDetails?.upiName || ''
    });
  };

  const handleProcess = async () => {
    if (!payForm.amount || !payForm.paymentDate) {
      showToast('Amount and payment date are required', 'error');
      return;
    }
    setSaving(true);
    try {
      await api.post('/trainer-payments/process', {
        trainerId: typeof selectedTrainer.trainer === 'object' ? selectedTrainer.trainer._id : selectedTrainer.trainer,
        trainerFeeId: selectedTrainer._id,
        amount: payForm.amount,
        paymentMethod: payForm.paymentMethod,
        transactionId: payForm.transactionId,
        paymentDate: payForm.paymentDate,
        notes: payForm.notes,
      });
      showToast('Payment processed successfully!');
      setSelectedTrainer(null);
      fetchPending();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to process payment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const trainerName = (t: any) => typeof t === 'object' ? t?.name : 'Unknown';
  const trainerInitial = (t: any) => (typeof t === 'object' ? t?.name?.[0] : 'T') || 'T';

  const cycleSuffix = (cycle: string) => {
    const m: Record<string, string> = { 'Per Session': '/session', 'Weekly': '/week', 'Monthly': '/month', 'Custom': '' };
    return m[cycle] || '';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl font-semibold text-white text-sm flex items-center gap-2 ${toast.type === 'success' ? 'bg-[#34483F]' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#202522]">Pending Trainer Payments</h1>
        <p className="text-[#727975] text-sm mt-1">Review and process outstanding trainer payments</p>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E8E5DA] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#34483F] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pending.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-400" />
            </div>
            <p className="text-[#202522] font-bold text-lg">No pending payments</p>
            <p className="text-[#727975] text-sm mt-2 max-w-sm mx-auto">
              Pending payments appear here once trainer fees are configured. Go to <strong>Fee Settings</strong> to set fees for your trainers first.
            </p>
            <Link
              to="/admin/trainer-fees/settings"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-[#34483F] text-white rounded-xl text-sm font-bold hover:bg-[#C6A77D] transition-colors shadow-lg shadow-green-200"
            >
              Go to Fee Settings
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#F2EFE8] border-b border-[#E8E5DA]">
                  <th className="px-5 py-3.5 font-semibold text-[#727975]">Trainer</th>
                  <th className="px-5 py-3.5 font-semibold text-[#727975] text-right">Fee</th>
                  <th className="px-5 py-3.5 font-semibold text-[#727975]">Billing Cycle</th>
                  <th className="px-5 py-3.5 font-semibold text-[#727975]">Due Date</th>
                  <th className="px-5 py-3.5 font-semibold text-[#727975] text-right">Amount Due</th>
                  <th className="px-5 py-3.5 font-semibold text-[#727975]">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-[#727975]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {pending.map((item, i) => (
                  <tr key={i} className="hover:bg-[#F2EFE8] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#34483F] to-[#8FA89B] flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {trainerInitial(item.trainer)}
                        </div>
                        <span className="font-semibold text-[#202522]">{trainerName(item.trainer)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-[#202522]">₹{item.feeAmount?.toLocaleString('en-IN')}{cycleSuffix(item.billingCycle)}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold">{item.billingCycle}</span>
                    </td>
                    <td className="px-5 py-4 text-[#4A514D]">
                      {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-[#202522]">₹{item.amount?.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4">
                      {(() => {
                        const currentStatus = statuses[item._id] || item.status || 'Pending';
                        let colors = 'bg-amber-100 text-amber-700 focus:ring-amber-200';
                        if (currentStatus === 'Active') colors = 'bg-green-100 text-green-700 focus:ring-green-200';
                        if (currentStatus === 'Rejected') colors = 'bg-red-100 text-red-700 focus:ring-red-200';
                        if (currentStatus === 'Inactive') colors = 'bg-gray-100 text-gray-700 focus:ring-gray-200';
                        
                        return (
                          <div className="relative w-fit">
                            <select 
                              value={currentStatus}
                              onChange={(e) => handleStatusChange(item._id, e.target.value)}
                              className={`appearance-none pl-7 pr-6 py-1 rounded-full text-xs font-bold outline-none cursor-pointer focus:ring-2 ${colors}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Rejected">Rejected</option>
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                            </select>
                            <Clock size={12} className={`absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${colors.split(' ')[1]}`} />
                            <ChevronDown size={12} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${colors.split(' ')[1]}`} />
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => openProcess(item)}
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-[#34483F] text-white rounded-lg text-xs font-bold hover:bg-[#C6A77D] transition-colors shadow shadow-green-200"
                      >
                        <CreditCard size={13} />
                        Process Payment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Process Payment Modal */}
      {selectedTrainer && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#DCD9CD] mt-10 mb-10">
            <div className="p-6 border-b border-[#DCD9CD] flex justify-between items-center bg-gradient-to-r from-[#F5F3EE] to-[#FFFFFF]">
              <div>
                <h2 className="text-xl font-bold text-[#202522]">Process Payment</h2>
                <p className="text-sm text-[#727975] mt-1">
                  Recording payment for <span className="font-semibold text-[#34483F]">{trainerName(selectedTrainer.trainer)}</span>
                </p>
              </div>
              <button onClick={() => setSelectedTrainer(null)} className="p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Summary */}
              <div className="bg-[#F5F3EE] border border-[#DCD9CD] rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-[#727975]">Amount Due</p>
                  <p className="text-2xl font-bold text-[#34483F]">₹{Number(selectedTrainer.amount).toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#727975]">Billing Cycle</p>
                  <p className="font-semibold text-[#202522]">{selectedTrainer.billingCycle}</p>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold text-[#4A514D] mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'Bank Transfer', icon: Banknote, label: 'Bank Transfer' },
                    { value: 'UPI', icon: Smartphone, label: 'UPI' }
                  ].map(m => (
                    <button
                      key={m.value}
                      onClick={() => setPayForm({ ...payForm, paymentMethod: m.value })}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all ${payForm.paymentMethod === m.value ? 'border-[#34483F] bg-[#F5F3EE] text-[#34483F]' : 'border-[#E8E5DA] text-[#727975] hover:border-[#DCD9CD]'}`}
                    >
                      <m.icon size={18} />
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank Transfer fields */}
              {payForm.paymentMethod === 'Bank Transfer' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A514D] mb-1">Account Holder</label>
                    <input type="text" value={payForm.accountHolder} onChange={e => setPayForm({ ...payForm, accountHolder: e.target.value })} className="w-full border border-[#E8E5DA] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#34483F]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A514D] mb-1">Bank Name</label>
                    <input type="text" value={payForm.bankName} onChange={e => setPayForm({ ...payForm, bankName: e.target.value })} className="w-full border border-[#E8E5DA] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#34483F]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A514D] mb-1">Account Number</label>
                    <input type="text" value={payForm.accountNumber} onChange={e => setPayForm({ ...payForm, accountNumber: e.target.value.replace(/\D/g, '') })} inputMode="numeric" maxLength={18} className="w-full border border-[#E8E5DA] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#34483F]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A514D] mb-1">IFSC Code</label>
                    <input type="text" value={payForm.ifscCode} onChange={e => setPayForm({ ...payForm, ifscCode: e.target.value.toUpperCase() })} maxLength={11} className="w-full border border-[#E8E5DA] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#34483F] uppercase" />
                  </div>
                </div>
              )}

              {/* UPI fields */}
              {payForm.paymentMethod === 'UPI' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#4A514D] mb-1">UPI ID</label>
                    <input type="text" value={payForm.upiId} onChange={e => setPayForm({ ...payForm, upiId: e.target.value })} placeholder="name@bank" className="w-full border border-[#E8E5DA] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#34483F]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#4A514D] mb-1">Payment Name</label>
                    <input type="text" value={payForm.upiName} onChange={e => setPayForm({ ...payForm, upiName: e.target.value })} className="w-full border border-[#E8E5DA] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#34483F]" />
                  </div>
                </div>
              )}

              {/* Common fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#4A514D] mb-1">Amount (₹) *</label>
                  <input type="number" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} className="w-full border border-[#E8E5DA] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#34483F]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#4A514D] mb-1">Payment Date *</label>
                  <input type="date" value={payForm.paymentDate} onChange={e => setPayForm({ ...payForm, paymentDate: e.target.value })} className="w-full border border-[#E8E5DA] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#34483F]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4A514D] mb-1">Notes</label>
                <textarea value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} rows={2} placeholder="Optional notes..." className="w-full border border-[#E8E5DA] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#34483F] resize-none" />
              </div>
            </div>
            <div className="p-6 border-t border-[#E8E5DA] flex gap-3">
              <button onClick={() => setSelectedTrainer(null)} className="flex-1 py-2.5 border border-[#E8E5DA] rounded-xl text-sm font-semibold text-[#727975] hover:bg-[#F2EFE8] transition-colors">
                Cancel
              </button>
              <button onClick={handleProcess} disabled={saving} className="flex-1 py-2.5 bg-[#34483F] text-white rounded-xl text-sm font-bold hover:bg-[#C6A77D] transition-colors disabled:opacity-60 shadow-lg shadow-green-200">
                {saving ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminPendingTrainerPayments;
