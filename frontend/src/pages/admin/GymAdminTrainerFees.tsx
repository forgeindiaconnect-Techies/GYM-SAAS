import { useState, useEffect, useCallback } from 'react';
import { IndianRupee, Plus, Edit, CheckCircle, XCircle, Search, ChevronDown, AlertCircle, Clock, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import TrainerNavigationTabs from '../../components/GymAdmin/TrainerNavigationTabs';

const TRAINING_TYPES = ['Online Training', 'Offline Training', 'Hybrid Training'];
const BILLING_CYCLES = ['Weekly', 'Monthly'];

const defaultForm = {
  trainerId: '',
  trainingType: 'Online Training',
  feeAmount: '',
  billingCycle: 'Monthly',
  effectiveFrom: new Date().toISOString().slice(0, 10),
  paymentMethod: 'Bank Transfer',
  status: 'Active',
  notes: '',
  commissionType: 'Percentage',
  commissionValue: 0,
  accountHolder: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  upiId: '',
  upiName: '',
};

const cycleBadge = (cycle: string) => {
  const map: Record<string, string> = {
    'Per Session': 'bg-purple-100 text-purple-700',
    'Weekly': 'bg-blue-100 text-blue-700',
    'Monthly': 'bg-[#FED7AA]/10 text-[#F97316]',
    'Custom': 'bg-orange-100 text-orange-700',
  };
  return map[cycle] || 'bg-gray-100 text-gray-700';
};

const GymAdminTrainerFees = () => {
  const { user } = useAuth();
  const [fees, setFees] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editFee, setEditFee] = useState<any>(null);
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
      const branchParam = user?.branchId ? `?branchId=${user.branchId}` : '';
      const [feeRes, trainerRes] = await Promise.allSettled([
        api.get(`/trainer-payments/fees${branchParam}`),
        api.get(`/trainers${branchParam}`)
      ]);

      let feeList: any[] = [];
      let trainerList: any[] = [];

      if (feeRes.status === 'fulfilled' && feeRes.value.data) {
        feeList = feeRes.value.data.fees || [];
        trainerList = feeRes.value.data.trainers || [];
      }

      if (trainerRes.status === 'fulfilled' && trainerRes.value.data) {
        const directTrainers = trainerRes.value.data.trainers || [];
        const existingIds = new Set(trainerList.map(t => (t._id || t).toString()));
        for (const dt of directTrainers) {
          if (dt && dt._id && !existingIds.has(dt._id.toString())) {
            trainerList.push(dt);
            existingIds.add(dt._id.toString());
          }
        }
      }

      // Also ensure any trainer present in feeList.trainerId is included
      const allTrainerIds = new Set(trainerList.map(t => (t._id || t).toString()));
      feeList.forEach(f => {
        if (f.trainerId && typeof f.trainerId === 'object' && f.trainerId._id) {
          const id = f.trainerId._id.toString();
          if (!allTrainerIds.has(id)) {
            trainerList.push(f.trainerId);
            allTrainerIds.add(id);
          }
        }
      });

      setFees(feeList);
      setTrainers(trainerList);
    } catch {
      showToast('Failed to load trainer data', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.branchId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Build a unified "all trainers" list with their fee info merged in
  const feeMap = new Map(
    fees.map(f => [
      (f.trainerId?._id || f.trainerId)?.toString(),
      f
    ])
  );

  const getEffectiveFee = (trainer: any, feeRecord: any) => {
    if (feeRecord) return feeRecord;
    if (trainer && trainer.fee && Number(trainer.fee) > 0) {
      const modeMap: Record<string, string> = {
        'online': 'Online Training',
        'offline': 'Offline Training',
        'both': 'Hybrid Training'
      };
      const cycleMap: Record<string, string> = {
        'Per Week': 'Weekly',
        'Per Month': 'Monthly',
        'Per Session': 'Per Session'
      };
      return {
        _id: null,
        trainerId: trainer,
        trainingType: modeMap[trainer.trainingMode] || 'Offline Training',
        feeAmount: Number(trainer.fee),
        billingCycle: cycleMap[trainer.paymentType] || 'Monthly',
        paymentMethod: 'Bank Transfer',
        effectiveFrom: trainer.createdAt || new Date().toISOString(),
        status: trainer.status === 'Active' ? 'Active' : 'Pending',
        isSyncedFromProfile: true,
      };
    }
    return null;
  };

  const allRows = trainers.map(t => {
    const feeRecord = feeMap.get(t._id?.toString()) || null;
    const effectiveFee = getEffectiveFee(t, feeRecord);
    return {
      trainer: t,
      fee: effectiveFee,
      rawFee: feeRecord,
    };
  }).filter(row => {
    const q = search.toLowerCase();
    return row.trainer.name?.toLowerCase().includes(q) || row.trainer.email?.toLowerCase().includes(q);
  });

  const configuredCount = allRows.filter(r => r.fee !== null).length;
  const notConfiguredCount = allRows.length - configuredCount;

  const openSetFee = (trainer: any) => {
    setEditFee(null);
    const modeMap: Record<string, string> = {
      'online': 'Online Training',
      'offline': 'Offline Training',
      'both': 'Hybrid Training'
    };
    const cycleMap: Record<string, string> = {
      'Per Week': 'Weekly',
      'Per Month': 'Monthly',
      'Per Session': 'Per Session'
    };
    setForm({
      ...defaultForm,
      trainerId: trainer._id,
      feeAmount: trainer.fee || '',
      trainingType: modeMap[trainer.trainingMode] || 'Offline Training',
      billingCycle: cycleMap[trainer.paymentType] || 'Monthly',
      effectiveFrom: trainer.createdAt ? new Date(trainer.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      commissionType: 'Percentage',
      commissionValue: 0,
      accountHolder: trainer.name || '',
      upiId: trainer.phone ? `${trainer.phone}@paytm` : '',
      upiName: trainer.name || '',
    });
    setShowModal(true);
  };

  const openEditFee = (fee: any, trainer?: any) => {
    setEditFee(fee?._id ? fee : null);
    const tr = trainer || fee?.trainerId;
    setForm({
      trainerId: (fee?.trainerId?._id || fee?.trainerId || tr?._id || '').toString(),
      trainingType: fee?.trainingType || 'Offline Training',
      feeAmount: fee?.feeAmount || tr?.fee || '',
      billingCycle: fee?.billingCycle || 'Monthly',
      effectiveFrom: fee?.effectiveFrom ? new Date(fee.effectiveFrom).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      paymentMethod: fee?.paymentMethod || 'Bank Transfer',
      status: fee?.status || 'Active',
      notes: fee?.notes || '',
      commissionType: 'Percentage',
      commissionValue: 0,
      accountHolder: fee?.bankDetails?.accountHolder || tr?.name || '',
      bankName: fee?.bankDetails?.bankName || '',
      accountNumber: fee?.bankDetails?.accountNumber || '',
      ifscCode: fee?.bankDetails?.ifscCode || '',
      upiId: fee?.upiDetails?.upiId || (tr?.phone ? `${tr.phone}@paytm` : ''),
      upiName: fee?.upiDetails?.upiName || tr?.name || '',
    });
    setShowModal(true);
  };

  const openAddNew = () => {
    setEditFee(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.trainerId || !form.feeAmount || !form.billingCycle || !form.effectiveFrom) {
      const msg = 'Please fill all required fields (Fee Amount, etc)';
      showToast(msg, 'error');
      alert(msg);
      return;
    }

    const feeNum = Number(form.feeAmount) || 0;

    setSaving(true);
    try {
      const payload = { 
        ...form, 
        paymentMethod: form.paymentMethod || 'Bank Transfer',
        commissionType: 'Percentage',
        commissionValue: 0,
        netAmount: feeNum,
        accountHolder: form.accountHolder,
        bankName: form.bankName,
        accountNumber: form.accountNumber,
        ifscCode: form.ifscCode,
        upiId: form.upiId,
        upiName: form.upiName
      };
      await api.post('/trainer-payments/fee', payload);
      showToast(editFee ? 'Trainer fee updated successfully!' : 'Trainer fee set successfully!');
      setShowModal(false);
      fetchData();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Failed to save fee';
      showToast(errorMsg, 'error');
      alert('Error: ' + errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <TrainerNavigationTabs />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#292524]">Trainer Fee Settings</h1>
          <p className="text-[#78716C] text-sm mt-1">Configure and manage fees for your trainers</p>
        </div>
        <button
          onClick={openAddNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#F97316] text-white rounded-xl font-semibold hover:bg-[#EA580C] transition-colors shadow-lg shadow-orange-200 text-sm"
        >
          <Plus size={16} />
          Set New Fee
        </button>
      </div>

      {/* Summary Cards */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-[#FED7AA] rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <IndianRupee size={18} className="text-[#FED7AA]" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#292524]">{trainers.length}</p>
              <p className="text-xs text-[#78716C]">Total Trainers</p>
            </div>
          </div>
          <div className="bg-white border border-[#FED7AA] rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <CheckCircle size={18} className="text-[#F97316]" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#292524]">{configuredCount}</p>
              <p className="text-xs text-[#78716C]">Fee Configured</p>
            </div>
          </div>
          <div className="bg-white border border-[#FED7AA] rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
              <AlertCircle size={18} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-[#292524]">{notConfiguredCount}</p>
              <p className="text-xs text-[#78716C]">Pending Setup</p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" />
        <input
          type="text"
          placeholder="Search trainer..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-[#FED7AA] rounded-xl text-sm outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 transition bg-white"
        />
      </div>

      {/* Table — ALL trainers */}
      <div className="bg-white border border-[#FED7AA] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : allRows.length === 0 ? (
          <div className="text-center py-20">
            <IndianRupee size={40} className="mx-auto text-[#CBD5E1] mb-3" />
            <p className="text-[#78716C] font-semibold">No trainers found</p>
            <p className="text-[#78716C] text-sm mt-1">Add trainers to your gym first, then configure fees here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-[#FFFDF8] border-b border-[#FED7AA]">
                  <th className="px-5 py-3.5 font-semibold text-[#78716C]">Trainer</th>
                  <th className="px-5 py-3.5 font-semibold text-[#78716C]">Training Type</th>
                  <th className="px-5 py-3.5 font-semibold text-[#78716C] text-right">Fee (Salary)</th>
                  <th className="px-5 py-3.5 font-semibold text-[#78716C]">Billing Cycle</th>
                  <th className="px-5 py-3.5 font-semibold text-[#78716C]">Effective From</th>
                  <th className="px-5 py-3.5 font-semibold text-[#78716C]">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-[#78716C]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {allRows.map(({ trainer, fee }) => (
                  <tr key={trainer._id} className="hover:bg-[#FFFDF8] transition-colors">
                    {/* Trainer */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F97316] to-[#EA580C] flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {trainer.name?.[0]?.toUpperCase() || 'T'}
                        </div>
                        <div>
                          <p className="font-semibold text-[#292524]">{trainer.name}</p>
                          <p className="text-xs text-[#78716C]">{trainer.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Training Type */}
                    <td className="px-5 py-4 text-[#78716C]">
                      {fee ? fee.trainingType : <span className="text-[#CBD5E1] italic text-xs">Not set</span>}
                    </td>

                    {/* Fee */}
                    <td className="px-5 py-4 text-right">
                      {fee ? (
                        <span className="font-bold text-[#292524]">₹{Number(fee.feeAmount).toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-[#CBD5E1] italic text-xs">—</span>
                      )}
                    </td>

                    {/* Billing Cycle */}
                    <td className="px-5 py-4">
                      {fee ? (
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${cycleBadge(fee.billingCycle)}`}>
                          {fee.billingCycle}
                        </span>
                      ) : (
                        <span className="text-[#CBD5E1] italic text-xs">—</span>
                      )}
                    </td>

                    {/* Effective From */}
                    <td className="px-5 py-4 text-[#78716C]">
                      {fee?.effectiveFrom
                        ? new Date(fee.effectiveFrom).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : <span className="text-[#CBD5E1] italic text-xs">—</span>}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {fee ? (
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit ${
                          fee.status === 'Active' ? 'bg-[#FED7AA]/10 text-[#F97316]' :
                          fee.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                          fee.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-500'
                        }`}>
                          {fee.status === 'Pending' && <Clock size={12} />}
                          {fee.status === 'Rejected' && <XCircle size={12} />}
                          {fee.status === 'Active' && <CheckCircle size={12} />}
                          {fee.status}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold w-fit">
                          <AlertCircle size={11} />
                          Not Set
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4">
                      {fee ? (
                        <button
                          onClick={() => openEditFee(fee, trainer)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FFFDF8] text-[#F97316] border border-[#E7E5E4] rounded-lg text-xs font-semibold hover:bg-[#E7E5E4] transition-colors"
                        >
                          <Edit size={13} />
                          Edit Fee
                        </button>
                      ) : (
                        <button
                          onClick={() => openSetFee(trainer)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#F97316] text-white rounded-lg text-xs font-bold hover:bg-[#EA580C] transition-colors shadow shadow-orange-200"
                        >
                          <Plus size={13} />
                          Set Fee
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#E7E5E4] my-auto max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-[#E7E5E4] flex justify-between items-center bg-[#FFFDF8] shrink-0">
              <div>
                <h2 className="text-xl font-bold text-[#292524]">{editFee ? 'Edit Trainer Fee' : 'Set Trainer Fee'}</h2>
                <p className="text-sm text-[#78716C] mt-1">Configure fee details for the selected trainer</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <form autoComplete="off" onSubmit={e => e.preventDefault()} className="flex flex-col flex-1 overflow-hidden min-h-0">
            {/* Hidden honeypot inputs — absorb Chrome password manager autofill */}
            <input type="text" style={{ display: 'none' }} aria-hidden="true" />
            <input type="password" style={{ display: 'none' }} aria-hidden="true" />
            <div className="p-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
              {/* Trainer */}
              <div>
                <label className="block text-sm font-semibold text-[#78716C] mb-1.5">Trainer <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select
                    value={form.trainerId}
                    onChange={e => setForm({ ...form, trainerId: e.target.value })}
                    className="w-full appearance-none border border-[#FED7AA] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 bg-white pr-9"
                  >
                    <option value="">Select trainer...</option>
                    {trainers.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] pointer-events-none" />
                </div>
              </div>

              {/* Training Type */}
              <div>
                <label className="block text-sm font-semibold text-[#78716C] mb-1.5">Training Type <span className="text-red-400">*</span></label>
                <div className="relative">
                  <select
                    value={form.trainingType}
                    onChange={e => setForm({ ...form, trainingType: e.target.value })}
                    className="w-full appearance-none border border-[#FED7AA] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 bg-white pr-9"
                  >
                    {TRAINING_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] pointer-events-none" />
                </div>
              </div>

              {/* Fee + Billing Cycle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-[#78716C] mb-1.5">Fee Amount (₹) <span className="text-red-400">*</span></label>
                  <input
                    type="number"
                    value={form.feeAmount}
                    onChange={e => setForm({ ...form, feeAmount: e.target.value })}
                    placeholder="e.g. 5000"
                    className="w-full border border-[#FED7AA] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#78716C] mb-1.5">Billing Cycle <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <select
                      value={form.billingCycle}
                      onChange={e => setForm({ ...form, billingCycle: e.target.value })}
                      className="w-full appearance-none border border-[#FED7AA] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 bg-white pr-9"
                    >
                      {BILLING_CYCLES.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Effective From — full width */}
              <div>
                <label className="block text-sm font-semibold text-[#78716C] mb-1.5">Effective From <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  value={form.effectiveFrom}
                  onChange={e => setForm({ ...form, effectiveFrom: e.target.value })}
                  className="w-full border border-[#FED7AA] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30"
                />
              </div>



              {/* Status */}
              <div>
                <label className="block text-sm font-semibold text-[#78716C] mb-1.5">Status</label>
                <div className="relative">
                  <select
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                    className="w-full appearance-none border border-[#FED7AA] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 bg-white pr-9"
                  >
                    {['Active', 'Inactive', 'Pending', 'Rejected'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78716C] pointer-events-none" />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-[#78716C] mb-1.5">Notes (Optional)</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  placeholder="Any additional notes..."
                  className="w-full border border-[#FED7AA] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/30 resize-none"
                />
              </div>
            </div>

            <div className="p-5 border-t border-[#E7E5E4] flex gap-3 bg-[#FFFDF8] shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 border border-[#E7E5E4] rounded-xl text-sm font-semibold text-[#78716C] hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 bg-[#F97316] text-white rounded-xl text-sm font-bold hover:bg-[#F97316]/90 transition-colors disabled:opacity-60 shadow-sm"
              >
                {saving ? 'Saving...' : 'Save Trainer Fee'}
              </button>
            </div>
            </form>
          </div>
        </div>
      )}
      {/* Toast - Moved to end of DOM so it's always on top */}
      {toast && (
        <div className={`fixed top-5 right-5 z-[9999] px-5 py-3 rounded-xl shadow-xl font-semibold text-white text-sm flex items-center gap-2 transition-all ${toast.type === 'success' ? 'bg-[#F97316]' : 'bg-red-500'}`}>
          {toast.type === 'success' ? <CheckCircle size={16} /> : <XCircle size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default GymAdminTrainerFees;
