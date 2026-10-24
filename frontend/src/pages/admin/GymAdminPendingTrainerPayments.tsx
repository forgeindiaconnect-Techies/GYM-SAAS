import { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, XCircle, CreditCard, Banknote, Smartphone, ArrowRight, ChevronDown, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

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
  const { user } = useAuth();
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
      const branchParam = user?.branchId ? `?branchId=${user.branchId}` : '';
      const res = await api.get(`/trainer-payments/pending${branchParam}`);
      setPending(res.data.pending || []);
    } catch {
      showToast('Failed to load pending payments', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.branchId]);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const openProcess = (item: any) => {
    setSelectedTrainer(item);
    const payableAmount = item.netAmount ?? item.amount ?? item.feeAmount;
    setPayForm({ 
      ...defaultPayForm, 
      amount: payableAmount ? payableAmount.toString() : '0',
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
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl font-semibold text-white text-sm flex items-center gap-2 ${toast.type === 'success' ? 'bg-[#2DD4BF]' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#F5FAFA]">Pending Trainer Payments</h1>
        <p className="text-[#9AAEAE] text-sm mt-1">Review and process outstanding trainer payments</p>
      </div>

      {/* Table */}
      <div className="bg-[#141D1E] border border-[#1B2728] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#2DD4BF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pending.length === 0 ? (
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-400" />
            </div>
            <p className="text-[#F5FAFA] font-bold text-lg">No pending payments</p>
            <p className="text-[#9AAEAE] text-sm mt-2 max-w-sm mx-auto">
              Pending payments appear here once trainer fees are configured. Go to <strong>Fee Settings</strong> to set fees for your trainers first.
            </p>
            <Link
              to="/admin/trainer-fees/settings"
              className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-[#2DD4BF] text-[#06201D] font-bold rounded-xl text-sm font-bold hover:bg-[#5EEAD4] transition-colors shadow-lg shadow-teal-900/10"
            >
              Go to Fee Settings
              <ArrowRight size={15} />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#0E1415] border-b border-[#1B2728]">
                  <th className="px-5 py-3.5 font-semibold text-[#9AAEAE]">Trainer</th>
                  <th className="px-5 py-3.5 font-semibold text-[#9AAEAE] text-right">Fee</th>
                  <th className="px-5 py-3.5 font-semibold text-[#9AAEAE]">Billing Cycle</th>
                  <th className="px-5 py-3.5 font-semibold text-[#9AAEAE]">Due Date</th>
                  <th className="px-5 py-3.5 font-semibold text-[#9AAEAE] text-right">Amount Due</th>
                  <th className="px-5 py-3.5 font-semibold text-[#9AAEAE]">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-[#9AAEAE]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0E1415]">
                {pending.map((item, i) => (
                  <tr key={i} className="hover:bg-[#0E1415] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2DD4BF] to-[#5EEAD4] flex items-center justify-center text-[#06201D] font-bold font-bold text-sm shrink-0">
                          {trainerInitial(item.trainer)}
                        </div>
                        <span className="font-semibold text-[#F5FAFA]">{trainerName(item.trainer)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-[#F5FAFA]">₹{item.feeAmount?.toLocaleString('en-IN')}{cycleSuffix(item.billingCycle)}</td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-[#1B2728] text-[#2DD4BF] text-xs font-semibold">{item.billingCycle}</span>
                    </td>
                    <td className="px-5 py-4 text-[#9AAEAE]">
                      {item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-[#F5FAFA]">₹{item.amount?.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4">
                      {(() => {
                        const currentStatus = statuses[item._id] || item.status || 'Pending';
                        let colors = 'bg-amber-100 text-amber-700 focus:ring-amber-200';
                        if (currentStatus === 'Active') colors = 'bg-[#1B2728]/10 text-[#2DD4BF] focus:ring-green-200';
                        if (currentStatus === 'Rejected') colors = 'bg-red-100 text-red-700 focus:ring-red-200';
                        if (currentStatus === 'Inactive') colors = 'bg-[#1B2728] text-[#C1D0D0] focus:ring-gray-200';
                        
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
                        className="flex items-center gap-1.5 px-4 py-1.5 bg-[#2DD4BF] text-[#06201D] font-bold rounded-lg text-xs font-bold hover:bg-[#5EEAD4] transition-colors shadow shadow-teal-900/10"
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
          <div className="bg-[#141D1E] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#2A3A3A] mt-10 mb-10">
            <div className="p-6 border-b border-[#2A3A3A] flex justify-between items-center bg-gradient-to-r from-[#0E1415] to-[#FFFFFF]">
              <div>
                <h2 className="text-xl font-bold text-[#F5FAFA]">Process Payment</h2>
                <p className="text-sm text-[#9AAEAE] mt-1">
                  Recording payment for <span className="font-semibold text-[#2DD4BF]">{trainerName(selectedTrainer.trainer)}</span>
                </p>
              </div>
              <button onClick={() => setSelectedTrainer(null)} className="p-1.5 bg-[#1B2728] rounded-lg text-[#9AAEAE] hover:text-[#F5FAFA] transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Summary */}
              <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-[#9AAEAE] font-semibold">Exact Amount Due</p>
                  <p className="text-2xl font-bold text-[#2DD4BF]">₹{Number(selectedTrainer.netAmount ?? selectedTrainer.amount).toLocaleString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#9AAEAE]">Billing Cycle</p>
                  <p className="font-semibold text-[#F5FAFA]">{selectedTrainer.billingCycle}</p>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-semibold text-[#9AAEAE] mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'Bank Transfer', icon: Banknote, label: 'Bank Transfer' },
                    { value: 'UPI', icon: Smartphone, label: 'UPI' }
                  ].map(m => (
                    <button
                      key={m.value}
                      onClick={() => setPayForm({ ...payForm, paymentMethod: m.value })}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-semibold transition-all ${payForm.paymentMethod === m.value ? 'border-[#2DD4BF] bg-[#0E1415] text-[#2DD4BF]' : 'border-[#1B2728] text-[#9AAEAE] hover:border-[#2A3A3A]'}`}
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
                    <label className="block text-xs font-semibold text-[#9AAEAE] mb-1">Account Holder</label>
                    <input type="text" value={payForm.accountHolder} onChange={e => setPayForm({ ...payForm, accountHolder: e.target.value })} className="w-full border border-[#1B2728] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#2DD4BF]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#9AAEAE] mb-1">Bank Name</label>
                    <input type="text" value={payForm.bankName} onChange={e => setPayForm({ ...payForm, bankName: e.target.value })} className="w-full border border-[#1B2728] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#2DD4BF]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#9AAEAE] mb-1">Account Number</label>
                    <input type="text" value={payForm.accountNumber} onChange={e => setPayForm({ ...payForm, accountNumber: e.target.value.replace(/\D/g, '').slice(0, 18) })} inputMode="numeric" maxLength={18} placeholder="9-18 digits" className="w-full border border-[#1B2728] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#2DD4BF] font-mono" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#9AAEAE] mb-1">IFSC Code</label>
                    <input type="text" value={payForm.ifscCode} onChange={e => setPayForm({ ...payForm, ifscCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11) })} maxLength={11} placeholder="11 chars (e.g. HDFC0001234)" className="w-full border border-[#1B2728] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#2DD4BF] uppercase font-mono" />
                  </div>
                </div>
              )}

              {/* UPI fields */}
              {payForm.paymentMethod === 'UPI' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#9AAEAE] mb-1">UPI ID</label>
                    <input type="text" value={payForm.upiId} onChange={e => setPayForm({ ...payForm, upiId: e.target.value })} placeholder="name@bank" className="w-full border border-[#1B2728] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#2DD4BF]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#9AAEAE] mb-1">Payment Name</label>
                    <input type="text" value={payForm.upiName} onChange={e => setPayForm({ ...payForm, upiName: e.target.value })} className="w-full border border-[#1B2728] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#2DD4BF]" />
                  </div>
                </div>
              )}

              {/* Common fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#9AAEAE] mb-1">Amount (₹) *</label>
                  <input type="number" value={payForm.amount} onChange={e => setPayForm({ ...payForm, amount: e.target.value })} className="w-full border border-[#1B2728] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#2DD4BF]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#9AAEAE] mb-1">Payment Date *</label>
                  <input type="date" value={payForm.paymentDate} onChange={e => setPayForm({ ...payForm, paymentDate: e.target.value })} className="w-full border border-[#1B2728] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#2DD4BF]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#9AAEAE] mb-1">Notes</label>
                <textarea value={payForm.notes} onChange={e => setPayForm({ ...payForm, notes: e.target.value })} rows={2} placeholder="Optional notes..." className="w-full border border-[#1B2728] rounded-xl px-3 py-2 text-sm outline-none focus:border-[#2DD4BF] resize-none" />
              </div>
            </div>
            <div className="p-6 border-t border-[#1B2728] flex gap-3">
              <button onClick={() => setSelectedTrainer(null)} className="flex-1 py-2.5 border border-[#1B2728] rounded-xl text-sm font-semibold text-[#9AAEAE] hover:bg-[#0E1415] transition-colors">
                Cancel
              </button>
              <button onClick={handleProcess} disabled={saving} className="flex-1 py-2.5 bg-[#2DD4BF] text-[#06201D] font-bold rounded-xl text-sm font-bold hover:bg-[#5EEAD4] transition-colors disabled:opacity-60 shadow-lg shadow-teal-900/10">
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
